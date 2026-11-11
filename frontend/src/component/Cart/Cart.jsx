import React from "react";
import { useSelector } from "react-redux";
import CartCard from "./CartCard";
import { Link } from "react-router-dom";
import { BsCart3, BsArrowRight } from "react-icons/bs";

function Cart() {
  const { cart } = useSelector((state) => state.Cart);

  const cartList = cart || [];

  const subtotal = cartList.reduce(
    (acc, item) => acc + (item.discountPrice || item.originalPrice || 0) * (item.qty || 1),
    0
  );

  const shipping = subtotal > 0 ? (subtotal > 3000 ? 0 : 150) : 0;
  const grandTotal = subtotal + shipping;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center">
          <BsCart3 className="text-xl" />
        </div>
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-gray-900 font-serif">
            Shopping Cart
          </h1>
          <p className="text-xs text-gray-500">
            {cartList.length} items ready for checkout
          </p>
        </div>
      </div>

      {cartList.length === 0 ? (
        <div className="text-center py-24 bg-white rounded-3xl border border-gray-100 shadow-sm max-w-xl mx-auto p-8">
          <div className="w-20 h-20 rounded-full bg-amber-50 text-amber-800 flex items-center justify-center mx-auto mb-4">
            <BsCart3 className="text-4xl" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 font-serif">Your shopping bag is empty</h2>
          <p className="text-sm text-gray-500 mt-2 max-w-sm mx-auto">
            Explore authentic handwoven Habesha Kemis, men's cultural suits, and festive gifts.
          </p>
          <Link to="/products">
            <button className="mt-6 px-8 py-3 bg-gradient-to-r from-amber-700 to-amber-900 text-white font-bold rounded-full shadow-md hover:shadow-lg transition">
              Explore Traditional Catalog
            </button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left: Cart Items List */}
          <div className="lg:col-span-8 space-y-4">
            {cartList.map((item) => (
              <CartCard key={item._id} item={item} />
            ))}

            <div className="pt-4 flex justify-between items-center">
              <Link
                to="/products"
                className="text-sm font-semibold text-amber-800 hover:text-amber-950 flex items-center gap-1.5"
              >
                ← Continue Shopping
              </Link>
            </div>
          </div>

          {/* Right: Order Summary Box */}
          <div className="lg:col-span-4 bg-white p-6 sm:p-8 rounded-3xl border border-gray-100 shadow-xl sticky top-28">
            <h3 className="text-xl font-bold text-gray-900 font-serif pb-4 border-b border-gray-100">
              Order Summary
            </h3>

            <div className="space-y-3 py-6 border-b border-gray-100 text-sm">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal</span>
                <span className="font-semibold text-gray-900">{subtotal} ETB</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Estimated Delivery</span>
                <span className="font-semibold text-gray-900">
                  {shipping === 0 ? (
                    <span className="text-emerald-600 font-bold">FREE (Over 3,000 ETB)</span>
                  ) : (
                    `${shipping} ETB`
                  )}
                </span>
              </div>
            </div>

            <div className="flex justify-between items-baseline py-4 text-base">
              <span className="font-bold text-gray-900">Total</span>
              <span className="text-2xl font-black text-amber-950">
                {grandTotal} ETB
              </span>
            </div>

            <Link to="/checkout" className="block mt-4">
              <button className="w-full py-4 bg-gradient-to-r from-amber-700 to-amber-900 hover:from-amber-800 hover:to-amber-950 text-white font-bold rounded-2xl shadow-lg hover:shadow-xl transition flex items-center justify-center gap-2">
                <span>Proceed to Checkout</span>
                <BsArrowRight className="text-lg" />
              </button>
            </Link>

            <p className="text-[11px] text-gray-400 text-center mt-3">
              🔒 Fast & Secure Checkout via Chapa (Telebirr, CBE, Cards)
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

export default Cart;
