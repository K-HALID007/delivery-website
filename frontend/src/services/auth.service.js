import { API_URL } from '../config';

class AuthService {
  constructor() {
    this.baseUrl = `${API_URL}/auth`;
    // Use separate keys for admin and user
    this.adminTokenKey = 'admin_token';
    this.adminUserKey = 'admin_user';
    this.userTokenKey = 'user_token';
    this.userUserKey = 'user_user';
    this.token = null;
    this.user = null;
    if (typeof window !== 'undefined') {
      // Prefer admin session if both exist
      if (sessionStorage.getItem(this.adminTokenKey)) {
        this.token = sessionStorage.getItem(this.adminTokenKey);
        this.user = JSON.parse(sessionStorage.getItem(this.adminUserKey));
        this.isAdminSession = true;
      } else if (sessionStorage.getItem(this.userTokenKey)) {
        this.token = sessionStorage.getItem(this.userTokenKey);
        this.user = JSON.parse(sessionStorage.getItem(this.userUserKey));
        this.isAdminSession = false;
      }
    }
  }

  async login(email, password) {
    try {
      const response = await fetch(`${this.baseUrl}/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Login failed');
      }

      if (data.token && data.user) {
        if (data.user.role === 'admin') {
          sessionStorage.setItem(this.adminTokenKey, data.token);
          sessionStorage.setItem(this.adminUserKey, JSON.stringify(data.user));
          sessionStorage.removeItem(this.userTokenKey);
          sessionStorage.removeItem(this.userUserKey);
          this.isAdminSession = true;
        } else {
          sessionStorage.setItem(this.userTokenKey, data.token);
          sessionStorage.setItem(this.userUserKey, JSON.stringify(data.user));
          sessionStorage.removeItem(this.adminTokenKey);
          sessionStorage.removeItem(this.adminUserKey);
          this.isAdminSession = false;
        }
        this.token = data.token;
        this.user = data.user;
        // Dispatch auth change event
        window.dispatchEvent(new CustomEvent('authChange', {
          detail: { user: data.user, isAuthenticated: true }
        }));
      }

      return data;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  }

  async adminLogin(email, password) {
    try {
      const response = await fetch(`${this.baseUrl}/admin/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Admin login failed');
      }

      if (data.token) {
        // Clear any user session
        sessionStorage.removeItem(this.userTokenKey);
        sessionStorage.removeItem(this.userUserKey);
        // Set admin session
        sessionStorage.setItem(this.adminTokenKey, data.token);
        sessionStorage.setItem(this.adminUserKey, JSON.stringify(data.user));
        this.token = data.token;
        this.user = data.user;
        this.isAdminSession = true;

        // Dispatch auth change event
        window.dispatchEvent(new CustomEvent('authChange', {
          detail: { user: data.user, isAuthenticated: true }
        }));
      }

      return data;
    } catch (error) {
      console.error('Admin login error:', error);
      throw error;
    }
  }

  async register(userData) {
    try {
      const response = await fetch(`${this.baseUrl}/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Registration failed');
      }

      // Store user data and token after successful registration
      if (data.token && data.user) {
        // Clear any existing sessions
        sessionStorage.removeItem(this.adminTokenKey);
        sessionStorage.removeItem(this.adminUserKey);
        
        // Set user session
        sessionStorage.setItem(this.userTokenKey, data.token);
        sessionStorage.setItem(this.userUserKey, JSON.stringify(data.user));
        
        this.token = data.token;
        this.user = data.user;
        this.isAdminSession = false;

        // Dispatch auth change event
        window.dispatchEvent(new CustomEvent('authChange', {
          detail: { user: data.user, isAuthenticated: true }
        }));
      }

      return data;
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  }

  async updateProfile(profileData) {
    try {
      // Determine role and token
      let token = null;
      let role = null;
      if (typeof window !== 'undefined') {
        if (sessionStorage.getItem(this.adminTokenKey)) {
          token = sessionStorage.getItem(this.adminTokenKey);
          role = 'admin';
        } else if (sessionStorage.getItem(this.userTokenKey)) {
          token = sessionStorage.getItem(this.userTokenKey);
          role = 'user';
        }
      }
      if (!token) throw new Error('Not authenticated');

      // Optionally, restrict editing to users only:
      if (role !== 'user') throw new Error('Only users can edit their profile');

      const response = await fetch(`${this.baseUrl}/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(profileData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Profile update failed');
      }

      // Update local user data
      if (data.user) {
        if (role === 'admin') {
          sessionStorage.setItem(this.adminUserKey, JSON.stringify(data.user));
        } else {
          sessionStorage.setItem(this.userUserKey, JSON.stringify(data.user));
        }
        this.user = data.user;

        // Dispatch auth change event
        window.dispatchEvent(new CustomEvent('authChange', {
          detail: { user: data.user, isAuthenticated: true }
        }));
      }

      return data;
    } catch (error) {
      console.error('Profile update error:', error);
      throw error;
    }
  }

  logout() {
    // Remove both admin and user sessions
    sessionStorage.removeItem(this.adminTokenKey);
    sessionStorage.removeItem(this.adminUserKey);
    sessionStorage.removeItem(this.userTokenKey);
    sessionStorage.removeItem(this.userUserKey);
    this.token = null;
    this.user = null;
    this.isAdminSession = false;

    // Dispatch auth change event
    window.dispatchEvent(new CustomEvent('authChange', {
      detail: { user: null, isAuthenticated: false }
    }));
  }

  getCurrentUser() {
    return this.user;
  }

  // Helper to decode JWT and check expiration
  _isTokenExpired(token) {
    if (!token) return true;
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      if (!payload.exp) return false;
      // exp is in seconds
      return Date.now() >= payload.exp * 1000;
    } catch {
      return true;
    }
  }

  isAuthenticated() {
    // Always check the latest session
    if (typeof window !== 'undefined') {
      if (sessionStorage.getItem(this.adminTokenKey)) {
        this.token = sessionStorage.getItem(this.adminTokenKey);
        this.user = JSON.parse(sessionStorage.getItem(this.adminUserKey));
        this.isAdminSession = true;
      } else if (sessionStorage.getItem(this.userTokenKey)) {
        this.token = sessionStorage.getItem(this.userTokenKey);
        this.user = JSON.parse(sessionStorage.getItem(this.userUserKey));
        this.isAdminSession = false;
      } else {
        // No valid session, clear everything
        sessionStorage.removeItem(this.adminTokenKey);
        sessionStorage.removeItem(this.adminUserKey);
        sessionStorage.removeItem(this.userTokenKey);
        sessionStorage.removeItem(this.userUserKey);
        this.token = null;
        this.user = null;
        this.isAdminSession = false;
      }
    }
    if (!this.token || this._isTokenExpired(this.token)) {
      this.logout();
      return false;
    }
    return true;
  }

  isAdmin() {
    return this.user?.role === 'admin' && this.isAdminSession;
  }

  async deleteAccount({ password, otp }) {
    // Only users can delete their own account
    let token = null;
    let role = null;
    if (typeof window !== 'undefined') {
      if (sessionStorage.getItem(this.userTokenKey)) {
        token = sessionStorage.getItem(this.userTokenKey);
        role = 'user';
      }
    }
    if (!token || role !== 'user') throw new Error('Only users can delete their account');
    const response = await fetch(`${this.baseUrl}/profile`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(password ? { password } : { otp }),
    });
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || 'Failed to delete account');
    }
    // Log out after deletion
    this.logout();
    return data;
  }

  async requestDeleteAccountOtp() {
    let token = null;
    if (typeof window !== 'undefined') {
      if (sessionStorage.getItem(this.userTokenKey)) {
        token = sessionStorage.getItem(this.userTokenKey);
      }
    }
    if (!token) throw new Error('Not authenticated');
    const response = await fetch(`${this.baseUrl}/profile/send-delete-otp`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || 'Failed to send OTP');
    }
    return data;
  }
}

export const authService = new AuthService();
