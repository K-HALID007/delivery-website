import { Cashfree } from 'cashfree-pg';

// Initialize Cashfree with your credentials
Cashfree.XClientId = process.env.CASHFREE_APP_ID;
Cashfree.XClientSecret = process.env.CASHFREE_SECRET_KEY;
Cashfree.XEnvironment = process.env.NODE_ENV === 'production' ? 'PRODUCTION' : 'SANDBOX';

export class CashfreeService {
  
  // Create a payment session
  static async createPaymentSession(orderData) {
    try {
      const { orderId, amount, customerDetails, returnUrl } = orderData;
      
      const request = {
        order_id: orderId,
        order_amount: amount,
        order_currency: "INR",
        customer_details: {
          customer_id: customerDetails.customerId,
          customer_name: customerDetails.name,
          customer_email: customerDetails.email,
          customer_phone: customerDetails.phone,
        },
        order_meta: {
          return_url: returnUrl,
          notify_url: `${process.env.FRONTEND_URL}/api/payment/webhook`,
        }
      };

      const response = await Cashfree.PGCreateOrder("2023-08-01", request);
      return {
        success: true,
        data: response.data,
        paymentSessionId: response.data.payment_session_id,
        orderId: response.data.order_id
      };
    } catch (error) {
      console.error('Cashfree payment session creation error:', error);
      return {
        success: false,
        error: error.message || 'Failed to create payment session'
      };
    }
  }

  // Verify payment status
  static async verifyPayment(orderId) {
    try {
      const response = await Cashfree.PGOrderFetchPayments("2023-08-01", orderId);
      
      if (response.data && response.data.length > 0) {
        const payment = response.data[0];
        return {
          success: true,
          status: payment.payment_status,
          paymentId: payment.cf_payment_id,
          amount: payment.payment_amount,
          method: payment.payment_method
        };
      }
      
      return {
        success: false,
        error: 'No payment found for this order'
      };
    } catch (error) {
      console.error('Payment verification error:', error);
      return {
        success: false,
        error: error.message || 'Failed to verify payment'
      };
    }
  }

  // Get order status
  static async getOrderStatus(orderId) {
    try {
      const response = await Cashfree.PGOrderFetchOrder("2023-08-01", orderId);
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('Order status fetch error:', error);
      return {
        success: false,
        error: error.message || 'Failed to fetch order status'
      };
    }
  }

  // Handle webhook verification
  static verifyWebhookSignature(rawBody, signature, timestamp) {
    try {
      return Cashfree.PGVerifyWebhookSignature(rawBody, signature, timestamp);
    } catch (error) {
      console.error('Webhook verification error:', error);
      return false;
    }
  }
}