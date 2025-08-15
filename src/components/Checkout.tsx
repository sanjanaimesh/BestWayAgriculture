import React, { useState } from 'react';
import { X, CreditCard, Truck, CheckCircle, ArrowLeft } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { loadStripe } from '@stripe/stripe-js';
import {
  Elements,
  CardElement,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js';

// Initialize Stripe with your publishable key
// Replace with your actual Stripe publishable key
const stripePromise = loadStripe('pk_test_51RvJvWCs4Jxtyk6HXo6CViF3dFngVOZbruNw8Ii6RMcrarq0oWE9evWhYbp0JFVj9JwSz6RxzU1SxU1fHHfcChnY00m7xqMabW');

interface CheckoutProps {
  isOpen: boolean;
  onClose: () => void;
}

// Stripe Card Element options
const CARD_ELEMENT_OPTIONS = {
  style: {
    base: {
      color: '#32325d',
      fontFamily: '"Helvetica Neue", Helvetica, sans-serif',
      fontSmoothing: 'antialiased',
      fontSize: '16px',
      '::placeholder': {
        color: '#aab7c4',
      },
    },
    invalid: {
      color: '#fa755a',
      iconColor: '#fa755a',
    },
  },
};

// Payment Form Component
const PaymentForm: React.FC<{
  onSuccess: (result: any) => void;
  onBack: () => void;
  amount: number;
  shippingInfo: any;
  cartItems: any[];
}> = ({ onSuccess, onBack, amount, shippingInfo, cartItems }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [error, setError] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);
  const [cardholderName, setCardholderName] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setProcessing(true);
    setError(null);

    const cardElement = elements.getElement(CardElement);

    if (!cardElement) {
      setProcessing(false);
      return;
    }

    try {
      // Create payment method
      const { error: stripeError, paymentMethod } = await stripe.createPaymentMethod({
        type: 'card',
        card: cardElement,
        billing_details: {
          name: cardholderName,
        },
      });

      if (stripeError) {
        setError(stripeError.message || 'An error occurred with payment');
        setProcessing(false);
        return;
      }

      // Payment successful - now save order to database
      const orderNum = 'BWA' + Date.now().toString().slice(-6);
      
      const orderData = {
        orderNumber: orderNum,
        customerInfo: shippingInfo,
        items: cartItems,
        subtotal: amount - 500, // Remove shipping from subtotal
        shipping: 500,
        total: amount,
        status: 'processing', // Use 'processing' instead of 'confirmed'
        paymentMethodId: paymentMethod.id,
        paymentStatus: 'completed'
      };

      console.log('Attempting to save order:', orderData);

      const response = await fetch('http://localhost:4000/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(orderData),
      });

      console.log('Response status:', response.status);

      const responseText = await response.text();
      console.log('Raw response:', responseText);

      let result;
      try {
        result = JSON.parse(responseText);
      } catch (parseError) {
        console.error('Failed to parse response as JSON:', parseError);
        throw new Error(`Server returned invalid JSON. Status: ${response.status}, Response: ${responseText}`);
      }

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${result.message || responseText}`);
      }
      
      if (result.success) {
        console.log('Order created successfully:', result);
        setProcessing(false);
        onSuccess({ 
          paymentMethod, 
          orderNumber: orderNum, 
          orderId: result.data?.id || result.id,
          orderData: orderData
        });
      } else {
        throw new Error(result.message || 'Failed to create order - server returned success:false');
      }
    } catch (error: any) {
      console.error('Detailed error saving order:', error);
      
      // Check if it's a network error
      if (error instanceof TypeError && error.message.includes('fetch')) {
        setError('Network error: Could not connect to server. Please check if the server is running on http://localhost:4000');
      } else if (error.message.includes('HTTP 404')) {
        setError('Server endpoint not found. Please check if /orders endpoint exists.');
      } else if (error.message.includes('HTTP 500')) {
        setError('Server error occurred while saving order. Please check server logs.');
      } else if (error.message.includes('HTTP 400')) {
        setError(`Validation error: ${error.message}. Please check the order data format.`);
      } else {
        setError(`Payment successful but failed to save order: ${error.message}. Please contact support with order details.`);
      }
      
      setProcessing(false);
      
      // For debugging - log payment method details
      console.log('Payment Method Details:', paymentMethod);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-semibold flex items-center">
          <CreditCard className="h-6 w-6 mr-2" />
          Payment Information
        </h3>
        <button
          type="button"
          onClick={onBack}
          className="flex items-center text-green-600 hover:text-green-700"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back
        </button>
      </div>

      {/* Test Card Information */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
        <h4 className="font-semibold text-yellow-800 mb-2">Test Card Numbers</h4>
        <div className="text-sm text-yellow-700 space-y-1">
          <p><strong>Success:</strong> 4242 4242 4242 4242</p>
          <p><strong>Requires Authentication:</strong> 4000 0025 0000 3155</p>
          <p><strong>Declined:</strong> 4000 0000 0000 9995</p>
          <p className="mt-2">Use any future date for expiry and any 3 digits for CVC</p>
        </div>
      </div>

      <div className="space-y-4 mb-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Cardholder Name
          </label>
          <input
            type="text"
            required
            value={cardholderName}
            onChange={(e) => setCardholderName(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
            placeholder="John Doe"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Card Details
          </label>
          <div className="p-3 border border-gray-300 rounded-lg focus-within:ring-2 focus-within:ring-green-500 focus-within:border-green-500">
            <CardElement options={CARD_ELEMENT_OPTIONS} />
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
          <p className="text-sm text-red-800">{error}</p>
          <div className="mt-2 text-xs text-red-600">
            <p>If this error persists:</p>
            <ul className="list-disc list-inside mt-1">
              <li>Check browser console for detailed logs</li>
              <li>Verify backend server is running on port 4000</li>
              <li>Contact support with your order details</li>
            </ul>
          </div>
        </div>
      )}

      <button
        type="submit"
        disabled={!stripe || processing}
        className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-semibold py-3 px-4 rounded-lg transition-colors"
      >
        {processing ? 'Processing Payment...' : `Pay LKR ${amount.toLocaleString()}`}
      </button>

      {processing && (
        <div className="mt-3 text-center">
          <div className="inline-flex items-center">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-green-600 mr-2"></div>
            <span className="text-sm text-gray-600">Processing your payment and creating order...</span>
          </div>
        </div>
      )}
    </form>
  );
};

// Main Checkout Component
const Checkout: React.FC<CheckoutProps> = ({ isOpen, onClose }) => {
  const { cartItems, getCartTotal, clearCart } = useCart();
  const [currentStep, setCurrentStep] = useState(1);
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [orderNumber, setOrderNumber] = useState('');
  const [orderId, setOrderId] = useState<string | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<any>(null);

  const [shippingInfo, setShippingInfo] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    postalCode: '',
    province: ''
  });

  const provinces = [
    'Western Province',
    'Central Province',
    'Southern Province',
    'Northern Province',
    'Eastern Province',
    'North Western Province',
    'North Central Province',
    'Uva Province',
    'Sabaragamuwa Province'
  ];

  const handleShippingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Validate form
    const requiredFields = ['firstName', 'lastName', 'email', 'phone', 'address', 'city', 'postalCode', 'province'];
    const missingFields = requiredFields.filter(field => !shippingInfo[field as keyof typeof shippingInfo]);
    
    if (missingFields.length > 0) {
      alert(`Please fill in all required fields: ${missingFields.join(', ')}`);
      return;
    }
    
    // Move to payment step
    setCurrentStep(2);
  };

  const handlePaymentSuccess = (result: any) => {
    // Payment successful and order saved to database
    setPaymentMethod(result.paymentMethod);
    setOrderNumber(result.orderNumber);
    setOrderId(result.orderId);
    setOrderPlaced(true);
    clearCart();
    
    console.log('Order completed successfully:', {
      orderNumber: result.orderNumber,
      orderId: result.orderId,
      total: getCartTotal() + 500
    });
  };

  const resetCheckout = () => {
    setCurrentStep(1);
    setOrderPlaced(false);
    setOrderNumber('');
    setOrderId(null);
    setPaymentMethod(null);
    setShippingInfo({
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      address: '',
      city: '',
      postalCode: '',
      province: ''
    });
  };

  const handleClose = () => {
    if (!orderPlaced) {
      // Only show confirmation if user hasn't completed the order
      const shouldClose = window.confirm('Are you sure you want to close checkout? Your progress will be lost.');
      if (!shouldClose) return;
    }
    resetCheckout();
    onClose();
  };

  if (!isOpen) return null;

  // Empty cart check
  if (cartItems.length === 0 && !orderPlaced) {
    return (
      <div className="fixed inset-0 z-50 overflow-hidden">
        <div className="absolute inset-0 bg-black bg-opacity-50" onClick={handleClose} />
        <div className="absolute inset-0 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6 text-center">
            <div className="text-6xl mb-4">🛒</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Your cart is empty</h2>
            <p className="text-gray-600 mb-6">
              Add some items to your cart before proceeding to checkout.
            </p>
            <button
              onClick={handleClose}
              className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors"
            >
              Continue Shopping
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (orderPlaced) {
    return (
      <div className="fixed inset-0 z-50 overflow-hidden">
        <div className="absolute inset-0 bg-black bg-opacity-50" />
        <div className="absolute inset-0 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6 text-center">
            <CheckCircle className="h-16 w-16 text-green-600 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Order Placed Successfully!</h2>
            <p className="text-gray-600 mb-4">
              Thank you for your order. Your order number is:
            </p>
            <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-6">
              <span className="text-lg font-bold text-green-800">{orderNumber}</span>
            </div>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-6">
              <p className="text-sm text-blue-800 mb-1">
                <strong>Order Status:</strong> Processing
              </p>
              <p className="text-xs text-blue-600">
                Your order is being prepared for shipment.
              </p>
            </div>
            <p className="text-sm text-gray-600 mb-6">
              You will receive an email confirmation shortly. Our team will contact you within 24 hours to confirm delivery details.
            </p>
            <button
              onClick={handleClose}
              className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors"
            >
              Continue Shopping
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      <div className="absolute inset-0 bg-black bg-opacity-50" />
      <div className="absolute inset-0 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b">
            <h2 className="text-2xl font-bold text-gray-900">Checkout</h2>
            <button
              onClick={handleClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          <div className="flex flex-col lg:flex-row">
            {/* Main Content */}
            <div className="flex-1 p-6">
              {/* Progress Steps */}
              <div className="flex items-center mb-8">
                <div className={`flex items-center ${currentStep >= 1 ? 'text-green-600' : 'text-gray-400'}`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${currentStep >= 1 ? 'bg-green-600 text-white' : 'bg-gray-200'}`}>
                    {currentStep > 1 ? '✓' : '1'}
                  </div>
                  <span className="ml-2 font-medium">Shipping</span>
                </div>
                <div className={`flex-1 h-1 mx-4 ${currentStep >= 2 ? 'bg-green-600' : 'bg-gray-200'}`} />
                <div className={`flex items-center ${currentStep >= 2 ? 'text-green-600' : 'text-gray-400'}`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${currentStep >= 2 ? 'bg-green-600 text-white' : 'bg-gray-200'}`}>
                    2
                  </div>
                  <span className="ml-2 font-medium">Payment</span>
                </div>
              </div>

              {/* Step 1: Shipping Information */}
              {currentStep === 1 && (
                <form onSubmit={handleShippingSubmit}>
                  <h3 className="text-xl font-semibold mb-4 flex items-center">
                    <Truck className="h-6 w-6 mr-2" />
                    Shipping Information
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        First Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={shippingInfo.firstName}
                        onChange={(e) => setShippingInfo({...shippingInfo, firstName: e.target.value})}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                        placeholder="Enter your first name"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Last Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={shippingInfo.lastName}
                        onChange={(e) => setShippingInfo({...shippingInfo, lastName: e.target.value})}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                        placeholder="Enter your last name"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Email <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="email"
                        required
                        value={shippingInfo.email}
                        onChange={(e) => setShippingInfo({...shippingInfo, email: e.target.value})}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                        placeholder="Enter your email"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Phone <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="tel"
                        required
                        value={shippingInfo.phone}
                        onChange={(e) => setShippingInfo({...shippingInfo, phone: e.target.value})}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                        placeholder="Enter your phone number"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Address <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={shippingInfo.address}
                        onChange={(e) => setShippingInfo({...shippingInfo, address: e.target.value})}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                        placeholder="Enter your full address"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        City <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={shippingInfo.city}
                        onChange={(e) => setShippingInfo({...shippingInfo, city: e.target.value})}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                        placeholder="Enter your city"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Postal Code <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={shippingInfo.postalCode}
                        onChange={(e) => setShippingInfo({...shippingInfo, postalCode: e.target.value})}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                        placeholder="Enter postal code"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Province <span className="text-red-500">*</span>
                      </label>
                      <select
                        required
                        value={shippingInfo.province}
                        onChange={(e) => setShippingInfo({...shippingInfo, province: e.target.value})}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                      >
                        <option value="">Select Province</option>
                        {provinces.map(province => (
                          <option key={province} value={province}>{province}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  
                  <button
                    type="submit"
                    className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors"
                  >
                    Continue to Payment
                  </button>
                </form>
              )}

              {/* Step 2: Payment Information with Stripe */}
              {currentStep === 2 && (
                <Elements stripe={stripePromise}>
                  <PaymentForm
                    onSuccess={handlePaymentSuccess}
                    onBack={() => setCurrentStep(1)}
                    amount={getCartTotal() + 500}
                    shippingInfo={shippingInfo}
                    cartItems={cartItems}
                  />
                </Elements>
              )}
            </div>

            {/* Order Summary Sidebar */}
            <div className="lg:w-80 bg-gray-50 p-6 border-l">
              <h3 className="text-lg font-semibold mb-4">Order Summary</h3>
              <div className="space-y-3 mb-4 max-h-64 overflow-y-auto">
                {cartItems.map((item) => (
                  <div key={item.id} className="flex items-center space-x-3">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-12 h-12 object-cover rounded flex-shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-sm truncate">{item.name}</h4>
                      <p className="text-sm text-gray-600">Qty: {item.quantity}</p>
                    </div>
                    <span className="font-medium text-sm">Rs {(item.price * item.quantity).toLocaleString()}</span>
                  </div>
                ))}
              </div>
              <div className="border-t pt-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm">Subtotal:</span>
                  <span className="text-sm">Rs {getCartTotal().toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm">Shipping:</span>
                  <span className="text-sm">Rs 500</span>
                </div>
                <div className="flex justify-between items-center font-bold text-lg border-t pt-2">
                  <span>Total:</span>
                  <span>Rs {(getCartTotal() + 500).toLocaleString()}</span>
                </div>
              </div>
              
            
              
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;