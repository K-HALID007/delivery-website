// This file is not needed. The main dashboard is at /admin (page.jsx)
export default function DashboardRedirect() {
  if (typeof window !== 'undefined') {
    window.location.href = '/admin';
  }
  return null;
}
