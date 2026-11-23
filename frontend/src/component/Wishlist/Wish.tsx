import React, { FC } from "react";
import { Link } from "react-router-dom";
import { BsHeart } from "react-icons/bs";
import Productcard from "../Products/Productcard";
import { useWishlistLogic } from "../../hooks";
import { useLanguage } from "../../hooks/useLanguage";

const Wish: FC = () => {
  const { wish: wishList } = useWishlistLogic();
  const { t } = useLanguage();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
          <BsHeart className="text-xl" />
        </div>
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-gray-900 font-serif">
            {t("wishlistPage.title", "My Wishlist")}
          </h1>
          <p className="text-xs text-gray-500">
            {t("wishlistPage.savedCount", "{count} saved traditional garments", { count: wishList.length })}
          </p>
        </div>
      </div>

      {wishList.length === 0 ? (
        <div className="text-center py-24 bg-white rounded-3xl border border-gray-100 shadow-sm max-w-xl mx-auto p-8">
          <div className="w-20 h-20 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mx-auto mb-4">
            <BsHeart className="text-4xl" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 font-serif">
            {t("wishlistPage.emptyTitle", "Your wishlist is empty")}
          </h2>
          <p className="text-sm text-gray-500 mt-2 max-w-sm mx-auto">
            {t("wishlistPage.emptySubtitle", "Click the heart icon on any traditional item to save it for later.")}
          </p>
          <Link to="/products">
            <button className="mt-6 px-8 py-3 bg-gradient-to-r from-amber-700 to-amber-900 text-white font-bold rounded-full shadow-md hover:shadow-lg transition">
              {t("wishlistPage.browseCollections", "Browse Traditional Collections")}
            </button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 xl:grid-cols-5 gap-4 sm:gap-6">
          {wishList.map((item) => (
            <Productcard key={item._id} item={item} />
          ))}
        </div>
      )}
    </div>
  );
};

export default Wish;
