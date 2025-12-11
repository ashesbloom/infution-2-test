// client/src/components/CartSidebar.jsx
import { X } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const CartSidebar = ({ isOpen, onClose }) => {
  const {
    cartItems,
    removeFromCart,
    addToCart,
    selectedItems,
    toggleSelectItem,
    isItemSelected,
  } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  const isAdmin = user?.isAdmin;

  // ✅ Use ONLY selected items for subtotal & count
  const itemsCount = selectedItems.reduce((acc, item) => acc + item.qty, 0);
  const totalPrice = selectedItems.reduce(
    (acc, item) => acc + item.qty * item.price,
    0
  );

  const handleCheckout = () => {
    if (selectedItems.length === 0 || isAdmin) return;

    onClose(); // close sidebar

    // If not logged in → go to login/signup with redirect
    if (!user) {
      navigate('/login?redirect=/shipping');
    } else {
      // If logged in → go to shipping directly
      navigate('/shipping');
    }
  };

  // quantity handlers inside sidebar
  const incQty = (item) => {
    addToCart(item, item.qty + 1); // our addToCart overwrites qty
  };

  const decQty = (item) => {
    if (item.qty > 1) {
      addToCart(item, item.qty - 1);
    } else {
      removeFromCart(item._id);
    }
  };

  return (
    <>
      {/* BLURRED OVERLAY */}
      <div
        onClick={onClose}
        className={`fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity ${
          isOpen
            ? 'opacity-100 pointer-events-auto'
            : 'opacity-0 pointer-events-none'
        } z-40`}
      />

      {/* SIDEBAR */}
      <div
        className={`fixed top-0 right-0 h-full w-80 sm:w-96 max-w-full bg-[#050505] text-white shadow-2xl transform transition-transform duration-300 ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        } z-50 flex flex-col`}
      >
        {/* HEADER */}
        <div className="h-16 px-4 flex items-center justify-between border-b border-gray-800 bg-black/60">
          <div className="flex flex-col">
            <h2 className="text-lg font-bold tracking-wide">Your Cart</h2>
            {isAdmin && (
              <p className="text-[11px] text-yellow-400 font-medium">
                Admin mode – cart actions disabled
              </p>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full hover:bg-gray-800 transition-colors"
          >
            <X size={20} className="text-gray-300" />
          </button>
        </div>

        {/* BODY */}
        <div className="h-[calc(100%-64px)] flex flex-col">
          {/* ITEMS LIST */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {cartItems.length === 0 ? (
              <p className="text-gray-400 text-center mt-10">
                Your cart is empty
              </p>
            ) : (
              cartItems.map((item) => (
                <div
                  key={item._id}
                  className="flex gap-3 items-center bg-black/70 rounded-xl p-3 border border-gray-800 hover:border-yellow-500/70 transition-colors"
                >
                  {/* ✅ Selection checkbox */}
                  <input
                    type="checkbox"
                    checked={isItemSelected(item._id)}
                    onChange={() => {
                      if (!isAdmin) toggleSelectItem(item._id);
                    }}
                    disabled={isAdmin}
                    className={`w-4 h-4 flex-shrink-0 ${
                      isAdmin
                        ? 'opacity-40 cursor-not-allowed'
                        : 'accent-yellow-400 cursor-pointer'
                    }`}
                  />

                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-14 h-14 object-contain rounded-lg bg-black flex-shrink-0 border border-gray-800"
                  />

                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-semibold leading-tight line-clamp-2">
                      {item.name}
                    </h3>

                    {/* QTY + PRICE */}
                    <div className="mt-2 flex items-center gap-2">
                      <button
                        onClick={() => {
                          if (!isAdmin) decQty(item);
                        }}
                        disabled={isAdmin}
                        className={`w-7 h-7 flex items-center justify-center rounded-full text-xs font-bold transition ${
                          isAdmin
                            ? 'bg-gray-900 text-gray-500 cursor-not-allowed'
                            : 'bg-gray-800 hover:bg-gray-700'
                        }`}
                      >
                        -
                      </button>
                      <span className="text-sm font-semibold w-7 text-center">
                        {item.qty}
                      </span>
                      <button
                        onClick={() => {
                          if (!isAdmin) incQty(item);
                        }}
                        disabled={isAdmin}
                        className={`w-7 h-7 flex items-center justify-center rounded-full text-xs font-bold transition ${
                          isAdmin
                            ? 'bg-gray-900 text-gray-500 cursor-not-allowed'
                            : 'bg-gray-800 hover:bg-gray-700'
                        }`}
                      >
                        +
                      </button>

                      <span className="ml-auto text-xs text-yellow-400 font-bold">
                        ₹{item.price}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      if (!isAdmin) removeFromCart(item._id);
                    }}
                    disabled={isAdmin}
                    className={`text-[11px] font-semibold transition ${
                      isAdmin
                        ? 'text-red-900 cursor-not-allowed'
                        : 'text-red-400 hover:text-red-500'
                    }`}
                  >
                    Remove
                  </button>
                </div>
              ))
            )}
          </div>

          {/* FOOTER: subtotal + proceed button */}
          <div className="border-t border-gray-800 px-4 py-3 bg-black/70">
            <div className="flex justify-between text-sm mb-2">
              <span className="text-gray-300">
                Subtotal ({itemsCount} item{itemsCount !== 1 ? 's' : ''})
              </span>
              <span className="font-bold text-yellow-400">
                ₹{totalPrice.toFixed(0)}
              </span>
            </div>

            {isAdmin && (
              <p className="text-[11px] text-red-400 mb-1">
                Admin accounts cannot place orders. Login with a customer
                account to checkout.
              </p>
            )}

            <button
              onClick={handleCheckout}
              disabled={selectedItems.length === 0 || isAdmin}
              className={`w-full mt-1 py-2 text-sm font-bold uppercase tracking-widest rounded-md transition-colors ${
                selectedItems.length === 0 || isAdmin
                  ? 'bg-gray-800 text-gray-500 cursor-not-allowed'
                  : 'bg-yellow-400 text-black hover:bg-yellow-300'
              }`}
            >
              Proceed to Checkout
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default CartSidebar;
