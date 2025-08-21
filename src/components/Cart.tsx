import React from 'react';
import { X, Minus, Plus, ShoppingBag, Trash2 } from 'lucide-react';
import { useCart } from '../context/CartContext';
import Checkout from './Checkout';
import { useAuth } from '../components/Auth/Providers/AuthProvider';

interface CartProps {
  isOpen: boolean;
  onClose: () => void;
}

const Cart: React.FC<CartProps> = ({ isOpen, onClose }) => {
  const { cartItems, removeFromCart, updateQuantity, getCartTotal, clearCart } = useCart();
  const { login, isAuthenticated, userRole, user, logout } = useAuth();
  const [isCheckoutOpen, setIsCheckoutOpen] = React.useState(false);

  function handleProceedToCheckout() {
    if (!isAuthenticated) {
      
      alert('Please log in to proceed with checkout');
      
      return;
    }
    setIsCheckoutOpen(true);
  }

  const handleClearCart = () => {
    if (window.confirm('Are you sure you want to clear your cart?')) {
      clearCart();
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 z-50 overflow-hidden">
        <div className="absolute inset-0 bg-black bg-opacity-50" onClick={onClose} />
        <div className="absolute right-0 top-0 h-full w-full max-w-sm sm:max-w-md bg-white shadow-xl">
          <div className="flex h-full flex-col">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b">
              <h2 className="text-lg sm:text-xl font-semibold">Shopping Cart</h2>
              <div className="flex items-center space-x-2">
                {cartItems.length > 0 && (
                  <button
                    onClick={handleClearCart}
                    className="p-2 hover:bg-red-50 text-red-600 rounded-full transition-colors touch-manipulation"
                    title="Clear Cart"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                )}
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors touch-manipulation"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Cart Items */}
            <div className="flex-1 overflow-y-auto p-3 sm:p-4">
              {cartItems.length === 0 ? (
                <div className="text-center py-12">
                  <ShoppingBag className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500 text-sm sm:text-base">Your cart is empty</p>
                  <p className="text-gray-400 text-xs sm:text-sm mt-2">
                    Add some seeds to get started!
                  </p>
                </div>
              ) : (
                <div className="space-y-3 sm:space-y-4">
                  {cartItems.map((item) => (
                    <div key={item.id} className="flex items-center space-x-3 sm:space-x-4 bg-gray-50 p-3 sm:p-4 rounded-lg">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-12 h-12 sm:w-16 sm:h-16 object-cover rounded flex-shrink-0"
                      />
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-900 text-sm sm:text-base leading-tight">{item.name}</h3>
                        <p className="text-sm text-gray-600">LKR {item.price.toLocaleString()}</p>
                        <p className="text-xs text-green-600 font-medium">
                          Subtotal: LKR {(item.price * item.quantity).toLocaleString()}
                        </p>
                        <div className="flex items-center space-x-2 mt-2">
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            className="p-1 hover:bg-gray-200 rounded transition-colors touch-manipulation"
                            disabled={item.quantity <= 1}
                          >
                            <Minus className="h-4 w-4" />
                          </button>
                          <span className="px-2 py-1 bg-white rounded border text-sm min-w-[2rem] text-center">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="p-1 hover:bg-gray-200 rounded transition-colors touch-manipulation"
                          >
                            <Plus className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                      <button
                        onClick={() => removeFromCart(item.id)}
                        className="p-2 hover:bg-red-100 text-red-600 rounded transition-colors touch-manipulation flex-shrink-0"
                        title="Remove item"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            {cartItems.length > 0 && (
              <div className="border-t p-3 sm:p-4 space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between items-center text-sm">
                    <span>Items ({cartItems.reduce((sum, item) => sum + item.quantity, 0)}):</span>
                    <span>LKR {getCartTotal().toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center border-t pt-2">
                    <span className="text-base sm:text-lg font-semibold">Total:</span>
                    <span className="text-xl sm:text-2xl font-bold text-green-600">
                      LKR {getCartTotal().toLocaleString()}
                    </span>
                  </div>
                </div>
                
                {/* Show user status */}
                {!isAuthenticated && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 text-sm">
                    <p className="text-yellow-800">
                      <span className="font-medium">Sign in required:</span> Please log in to complete your purchase.
                    </p>
                  </div>
                )}
                
                <button 
                  onClick={handleProceedToCheckout}
                  className={`w-full font-semibold py-3 sm:py-4 px-4 rounded-lg transition-colors text-base touch-manipulation ${
                    isAuthenticated 
                      ? 'bg-green-600 hover:bg-green-700 text-white' 
                      : 'bg-gray-300 hover:bg-gray-400 text-gray-700'
                  }`}
                >
                  {isAuthenticated ? 'Proceed to Checkout' : 'Sign In to Checkout'}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
      
      <Checkout 
        isOpen={isCheckoutOpen} 
        onClose={() => setIsCheckoutOpen(false)} 
      />
    </>
  );
};

export default Cart;