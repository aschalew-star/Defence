import React, { FC } from "react";
import CartCard from "./CartCard";
import { Link } from "react-router-dom";
import { BsCart3, BsArrowRight } from "react-icons/bs";
import { useCartLogic } from "../../hooks";
import { useLanguage } from "../../hooks/useLanguage";

const Cart: FC = () => {
  const {
    cart: cartList,
    subtotal,
    formattedSubtotal,
    formattedShipping,
    formattedGrandTotal,
    clearCart,
  } = useCartLogic();
  const { t } = useLanguage();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center">
          <BsCart3 className="text-xl" />
        </div>
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-gray-900 font-serif">
            {t("cartPage.title", "Shopping Cart")}
          </h1>
          <p className="text-xs text-gray-500">
            {t("cartPage.itemsReady", "{count} items ready for checkout", { count: cartList.length })}
          </p>
        </div>
      </div>

      {cartList.length === 0 ? (
        <div className="text-center py-24 bg-white rounded-3xl border border-gray-100 shadow-sm max-w-xl mx-auto p-8">
          <div className="w-20 h-20 rounded-full bg-amber-50 text-amber-800 flex items-center justify-center mx-auto mb-4">
            <BsCart3 className="text-4xl" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 font-serif">
            {t("cartPage.bagEmpty", "Your shopping bag is empty")}
          </h2>
          <p className="text-sm text-gray-500 mt-2 max-w-sm mx-auto">
            {t("cartPage.bagEmptySubtitle", "Explore our collection of authentic Ethiopian handwoven fashion.")}
          </p>
          <Link to="/products">
            <button className="mt-6 px-8 py-3 bg-gradient-to-r from-amber-700 to-amber-900 text-white font-bold rounded-full shadow-md hover:shadow-lg transition">
              {t("cartPage.exploreCatalog", "Explore Traditional Catalog")}
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
                className="text-amber-800 font-bold text-sm hover:underline flex items-center gap-1.5"
              >
                ← {t("cartPage.continueShopping", "Continue Shopping")}
              </Link>
              <button
                onClick={clearCart}
                className="text-xs text-gray-400 hover:text-rose-600 transition"
              >
                {t("cartPage.clearAll", "Clear entire cart")}
              </button>
            </div>
          </div>

          {/* Right: Order Summary */}
          <div className="lg:col-span-4 bg-white p-6 rounded-3xl border border-gray-100 shadow-sm sticky top-32">
            <h3 className="text-lg font-bold text-gray-900 font-serif mb-4 pb-3 border-b border-gray-100">
              {t("cartPage.orderSummary", "Order Summary")}
            </h3>

            <div className="space-y-3 text-sm text-gray-600">
              <div className="flex justify-between">
                <span>{t("cartPage.itemsSubtotal", "Items Subtotal")}</span>
                <span className="font-bold text-gray-900">{formattedSubtotal}</span>
              </div>
              <div className="flex justify-between">
                <span>{t("cartPage.estimatedDelivery", "Estimated Delivery")}</span>
                <span className="font-bold text-emerald-600">{formattedShipping}</span>
              </div>
              <div className="border-t border-gray-100 pt-3 flex justify-between text-base font-extrabold text-amber-900">
                <span>{t("cartPage.totalAmount", "Total Amount")}</span>
                <span>{formattedGrandTotal}</span>
              </div>
            </div>

            <Link to="/checkout" className="block mt-6">
              <button className="w-full py-3.5 bg-gray-900 hover:bg-amber-800 text-white font-bold rounded-2xl shadow-md transition flex items-center justify-center gap-2">
                <span>{t("cartPage.proceedCheckout", "Proceed to Checkout")}</span>
                <BsArrowRight />
              </button>
            </Link>

            <div className="mt-4 p-3 bg-amber-50/50 rounded-xl border border-amber-100/50 text-center">
              <p className="text-[11px] text-amber-900 font-medium">
                🇪🇹 {t("banner.deliveryGuarantee", "Free Delivery in Addis Ababa over 3,000 ETB")}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Cart;
