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
  onSuccess: (paymentMethod: any) => void;
  onBack: () => void;
  amount: number;
  orderNumber: string;
}> = ({ onSuccess, onBack, amount, orderNumber }) => {
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
      return;
    }

    // Create payment method
    const { error, paymentMethod } = await stripe.createPaymentMethod({
      type: 'card',
      card: cardElement,
      billing_details: {
        name: cardholderName,
      },
    });

    if (error) {
      setError(error.message || 'An error occurred');
      setProcessing(false);
    } else {
      // In a real application, you would send the paymentMethod.id to your server
      // to create a payment intent and complete the payment
      console.log('Payment Method Created:', paymentMethod);
      setProcessing(false);
      onSuccess(paymentMethod);
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

      {orderNumber && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
          <p className="text-sm text-blue-800">
            <strong>Order Number:</strong> {orderNumber}
          </p>
          <p className="text-xs text-blue-600 mt-1">
            Your order has been saved to our system.
          </p>
        </div>
      )}

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
        </div>
      )}

      <button
        type="submit"
        disabled={!stripe || processing}
        className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-semibold py-3 px-4 rounded-lg transition-colors"
      >
        {processing ? 'Processing...' : `Pay LKR ${amount.toLocaleString()}`}
      </button>
    </form>
  );
};

// Main Checkout Component
const Checkout: React.FC<CheckoutProps> = ({ isOpen, onClose }) => {
  const { cartItems, getCartTotal, clearCart } = useCart();
  const [currentStep, setCurrentStep] = useState(1);
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [orderNumber, setOrderNumber] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [orderId, setOrderId] = useState(null);
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

  // Save order to database
  const saveOrderToDatabase = async () => {
    try {
      const orderNum = 'BWA' + Date.now().toString().slice(-6);
      
      const orderData = {
        orderNumber: orderNum,
        customerInfo: shippingInfo,
        items: cartItems,
        subtotal: getCartTotal(),
        shipping: 500,
        total: getCartTotal() + 500,
        status: 'pending'
      };

      const response = await fetch('http://localhost:4000/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(orderData),
      });

      if (!response.ok) {
        throw new Error('Failed to create order');
      }

      const result = await response.json();
      
      if (result.success) {
        setOrderNumber(orderNum);
        setOrderId(result.data.id);
        return orderNum;
      } else {
        throw new Error(result.message || 'Failed to create order');
      }
    } catch (error) {
      console.error('Error saving order:', error);
      throw error;
    }
  };

  const handleShippingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      // Save order to database when continuing to payment
      await saveOrderToDatabase();
      setCurrentStep(2);
    } catch (error) {
      console.error('Error creating order:', error);
      alert('Failed to create order. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePaymentSuccess = (paymentMethod: any) => {
    setPaymentMethod(paymentMethod);
    setCurrentStep(3);
  };

  const handlePlaceOrder = async () => {
    setIsLoading(true);
    
    try {
      // Update order with payment information
      const updateData = {
        paymentMethodId: paymentMethod.id,
        paymentStatus: 'completed',
        status: 'confirmed'
      };

      const response = await fetch(`http://localhost:4000/orders/${orderId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData),
      });

      if (!response.ok) {
        throw new Error('Failed to update order');
      }

      setOrderPlaced(true);
      clearCart();
      
      console.log('Order completed:', {
        orderNumber,
        orderId,
        items: cartItems,
        total: getCartTotal() + 500,
        shipping: shippingInfo,
        paymentMethod
      });
    } catch (error) {
      console.error('Error completing order:', error);
      alert('Failed to complete order. Please try again.');
    } finally {
      setIsLoading(false);
    }
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
    resetCheckout();
    onClose();
  };

  if (!isOpen) return null;

  if (orderPlaced) {
    return (
      <div className="fixed inset-0 z-50 overflow-hidden">
        <div className="absolute inset-0 bg-black bg-opacity-50" onClick={handleClose} />
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
      <div className="absolute inset-0 bg-black bg-opacity-50" onClick={handleClose} />
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
                    1
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
                <div className={`flex-1 h-1 mx-4 ${currentStep >= 3 ? 'bg-green-600' : 'bg-gray-200'}`} />
                <div className={`flex items-center ${currentStep >= 3 ? 'text-green-600' : 'text-gray-400'}`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${currentStep >= 3 ? 'bg-green-600 text-white' : 'bg-gray-200'}`}>
                    3
                  </div>
                  <span className="ml-2 font-medium">Review</span>
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
                      <label className="block text-sm font-medium text-gray-700 mb-2">First Name</label>
                      <input
                        type="text"
                        required
                        value={shippingInfo.firstName}
                        onChange={(e) => setShippingInfo({...shippingInfo, firstName: e.target.value})}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Last Name</label>
                      <input
                        type="text"
                        required
                        value={shippingInfo.lastName}
                        onChange={(e) => setShippingInfo({...shippingInfo, lastName: e.target.value})}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                      <input
                        type="email"
                        required
                        value={shippingInfo.email}
                        onChange={(e) => setShippingInfo({...shippingInfo, email: e.target.value})}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
                      <input
                        type="tel"
                        required
                        value={shippingInfo.phone}
                        onChange={(e) => setShippingInfo({...shippingInfo, phone: e.target.value})}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">Address</label>
                      <input
                        type="text"
                        required
                        value={shippingInfo.address}
                        onChange={(e) => setShippingInfo({...shippingInfo, address: e.target.value})}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">City</label>
                      <input
                        type="text"
                        required
                        value={shippingInfo.city}
                        onChange={(e) => setShippingInfo({...shippingInfo, city: e.target.value})}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Postal Code</label>
                      <input
                        type="text"
                        required
                        value={shippingInfo.postalCode}
                        onChange={(e) => setShippingInfo({...shippingInfo, postalCode: e.target.value})}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">Province</label>
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
                    disabled={isLoading}
                    className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-semibold py-3 px-4 rounded-lg transition-colors"
                  >
                    {isLoading ? 'Creating Order...' : 'Continue to Payment'}
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
                    orderNumber={orderNumber}
                  />
                </Elements>
              )}

              {/* Step 3: Order Review */}
              {currentStep === 3 && (
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-semibold">Review Your Order</h3>
                    <button
                      onClick={() => setCurrentStep(2)}
                      className="flex items-center text-green-600 hover:text-green-700"
                    >
                      <ArrowLeft className="h-4 w-4 mr-1" />
                      Back
                    </button>
                  </div>

                  {orderNumber && (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-4">
                      <p className="text-sm text-green-800">
                        <strong>Order Number:</strong> {orderNumber}
                      </p>
                      <p className="text-xs text-green-600 mt-1">
                        Your order is saved and ready to be completed.
                      </p>
                    </div>
                  )}
                  
                  <div className="bg-gray-50 rounded-lg p-4 mb-6">
                    <h4 className="font-semibold mb-2">Shipping Address</h4>
                    <p className="text-sm text-gray-600">
                      {shippingInfo.firstName} {shippingInfo.lastName}<br />
                      {shippingInfo.address}<br />
                      {shippingInfo.city}, {shippingInfo.province} {shippingInfo.postalCode}<br />
                      {shippingInfo.phone}
                    </p>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-4 mb-6">
                    <h4 className="font-semibold mb-2">Payment Method</h4>
                    <p className="text-sm text-gray-600">
                      {paymentMethod && (
                        <>
                          {paymentMethod.card.brand.toUpperCase()} ending in {paymentMethod.card.last4}<br />
                          Expires: {paymentMethod.card.exp_month}/{paymentMethod.card.exp_year}
                        </>
                      )}
                    </p>
                  </div>

                  <button
                    onClick={handlePlaceOrder}
                    disabled={isLoading}
                    className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-semibold py-4 px-4 rounded-lg transition-colors text-lg"
                  >
                    {isLoading ? 'Processing...' : `Complete Order - LKR ${(getCartTotal() + 500).toLocaleString()}`}
                  </button>
                </div>
              )}
            </div>

            {/* Order Summary Sidebar */}
            <div className="lg:w-80 bg-gray-50 p-6 border-l">
              <h3 className="text-lg font-semibold mb-4">Order Summary</h3>
              <div className="space-y-3 mb-4">
                {cartItems.map((item) => (
                  <div key={item.id} className="flex items-center space-x-3">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-12 h-12 object-cover rounded"
                    />
                    <div className="flex-1">
                      <h4 className="font-medium text-sm">{item.name}</h4>
                      <p className="text-sm text-gray-600">Qty: {item.quantity}</p>
                    </div>
                    <span className="font-medium">LKR {(item.price * item.quantity).toLocaleString()}</span>
                  </div>
                ))}
              </div>
              <div className="border-t pt-4">
                <div className="flex justify-between items-center mb-2">
                  <span>Subtotal:</span>
                  <span>LKR {getCartTotal().toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center mb-2">
                  <span>Shipping:</span>
                  <span>LKR 500</span>
                </div>
                <div className="flex justify-between items-center font-bold text-lg border-t pt-2">
                  <span>Total:</span>
                  <span>LKR {(getCartTotal() + 500).toLocaleString()}</span>
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