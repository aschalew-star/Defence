import React, { useState, FC, MouseEvent } from "react";
import { useNavigate } from "react-router-dom";
import {
  AiFillStar,
  AiOutlineStar,
  AiFillHeart,
  AiOutlineHeart,
  AiOutlineEye,
} from "react-icons/ai";
import {
  BsBagPlus,
  BsBagCheck,
  BsShop,
  BsArrowUpRight,
  BsLightningChargeFill,
  BsTagsFill,
  BsShieldCheck,
} from "react-icons/bs";
import ProductDetail from "./productDetail";
import { useAppDispatch, useAppSelector, useCurrency } from "../../hooks";
import { useLanguage } from "../../hooks/useLanguage";
import { addTocart, removeFromCart } from "../../redux/Action/cartAction";
import { addToWishlist, removeFromwish } from "../../redux/Action/Wishlist";
import { toast } from "react-toastify";
import { optimizeImage } from "../../utils/imageOptimizer";
import { IProduct } from "../../types";

export interface ProductCardProps {
  item?: (IProduct & { isEvent?: boolean }) | any;
}

const Productcard: FC<ProductCardProps> = ({ item }) => {
  const [popup, setpopup] = useState<boolean>(false);
  const [isHovered, setIsHovered] = useState<boolean>(false);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { formatPrice } = useCurrency();
  const { t } = useLanguage();

  const { cart } = useAppSelector((state) => state.Cart);
  const { wish } = useAppSelector((state) => state.Wish);

  if (!item) return null;

  const isInWish = (wish || []).some((i: any) => i._id === item._id);
  const isInCart = (cart || []).some((i: any) => i._id === item._id);
  const isOutOfStock = (item.stock ?? 1) < 1;

  const goToDetails = (e?: MouseEvent) => {
    if (e) e.stopPropagation();
    if (item.isEvent) {
      navigate(`/event/${item._id}`);
    } else {
      navigate(`/product/${item._id}`);
    }
  };

  const wishHandler = (e: MouseEvent) => {
    e.stopPropagation();
    if (isInWish) {
      dispatch(removeFromwish(item) as any);
      toast.info("Removed from Wishlist");
    } else {
      dispatch(addToWishlist({ ...item, qty: 1 }) as any);
      toast.success("Added to Wishlist!");
    }
  };

  const cartHandler = (e: MouseEvent) => {
    e.stopPropagation();
    if (isInCart) {
      dispatch(removeFromCart(item) as any);
      toast.info("Removed from Bag");
    } else {
      if (isOutOfStock) {
        toast.error("This artisan craft is currently sold out!");
        return;
      }
      dispatch(addTocart({ ...item, qty: 1 }) as any);
      toast.success("Added to Bag!");
    }
  };

  const openQuickView = (e: MouseEvent) => {
    e.stopPropagation();
    setpopup(true);
  };

  const discountPercent =
    item.originalPrice &&
    item.discountPrice &&
    item.originalPrice > item.discountPrice
      ? Math.round(
          ((item.originalPrice - item.discountPrice) / item.originalPrice) * 100
        )
      : null;

  const ratingValue = item.ratings ? Number(item.ratings) : 5;
  const ratingDisplay = item.ratings ? Number(item.ratings).toFixed(1) : "5.0";
  const soldCount = item.sold_out || 0;

  const primaryImg = optimizeImage(
    item.featuredImage?.url ||
      item.images?.find((img: any) => img.isFeatured)?.url ||
      item.images?.[0]?.url ||
      "/placeholder.jpg",
    500
  );

  const secondaryImg =
    item.images && item.images.length > 1
      ? optimizeImage(
          item.images[1]?.url && item.images[1].url !== primaryImg
            ? item.images[1].url
            : item.images[0]?.url,
          500
        )
      : null;

  const lowestBulkTier =
    item.bulkPricing && item.bulkPricing.length > 0
      ? [...item.bulkPricing].sort(
          (a: any, b: any) => a.discountPrice - b.discountPrice
        )[0]
      : null;

  return (
    <>
      <div
        onClick={goToDetails}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className="group relative bg-white rounded-2xl border border-stone-200/70 shadow-xs hover:shadow-xl hover:border-amber-400/50 transition-all duration-300 flex flex-col justify-between overflow-hidden cursor-pointer selection:bg-none"
      >
        {/* Media Frame & Visual Badges */}
        <div className="relative aspect-[4/5] w-full overflow-hidden bg-stone-100">
          {/* Primary Product Image */}
          <img
            src={primaryImg}
            alt={item.name}
            loading="lazy"
            decoding="async"
            className={`w-full h-full object-cover object-center transition-all duration-700 ease-out ${
              secondaryImg && isHovered
                ? "scale-105 opacity-0"
                : "scale-100 group-hover:scale-105 opacity-100"
            }`}
          />

          {/* Secondary Hover Image (AliExpress/Luxury Angle Flip) */}
          {secondaryImg && (
            <img
              src={secondaryImg}
              alt={`${item.name} alternate view`}
              loading="lazy"
              decoding="async"
              className={`absolute inset-0 w-full h-full object-cover object-center transition-all duration-700 ease-out pointer-events-none ${
                isHovered ? "opacity-100 scale-105" : "opacity-0 scale-100"
              }`}
            />
          )}

          {/* Out of Stock Overlay */}
          {isOutOfStock && (
            <div className="absolute inset-0 bg-stone-950/60 backdrop-blur-[2px] flex items-center justify-center z-20 pointer-events-none">
              <span className="bg-stone-900/90 text-white font-black text-xs px-3.5 py-1.5 rounded-full shadow-lg tracking-wider uppercase border border-stone-700">
                {t("card.outOfStock", "Out of Stock")}
              </span>
            </div>
          )}

          {/* Top-Left Stack: Badges & Guarantees */}
          <div className="absolute top-2.5 left-2.5 flex flex-col items-start gap-1.5 z-10 pointer-events-none">
            {/* Flash Deal Badge */}
            {item.flashSale?.isActive && (
              <span className="bg-gradient-to-r from-amber-500 to-rose-600 text-white font-black text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-md shadow-md flex items-center gap-1 animate-pulse">
                <BsLightningChargeFill className="text-amber-200 text-xs" />
                {t("card.flashDeal", "Flash Deal")}
              </span>
            )}

            {/* Discount Percentage */}
            {discountPercent ? (
              <span className="bg-rose-600 text-white font-extrabold text-[10px] tracking-wide px-2 py-0.5 rounded-md shadow-sm">
                -{discountPercent}%
              </span>
            ) : (item.stock ?? 0) <= 5 && !isOutOfStock ? (
              <span className="bg-amber-600 text-white font-bold text-[10px] px-2 py-0.5 rounded-md shadow-sm">
                {t("card.onlyLeft", "Only {count} left", { count: item.stock })}
              </span>
            ) : null}

            {/* Ethiopian Artisan Provenance Chip */}
            <span className="bg-stone-900/80 backdrop-blur-xs text-amber-200 text-[10px] font-semibold px-2 py-0.5 rounded-md shadow-xs flex items-center gap-1">
              <span>🇪🇹</span>
              <span className="hidden sm:inline">{t("card.handcrafted", "Handcrafted")}</span>
            </span>
          </div>

          {/* Top-Right Floating Controls (Wishlist & Quick View) */}
          <div className="absolute top-2.5 right-2.5 flex flex-col gap-1.5 z-10">
            {/* Wishlist Button */}
            <button
              onClick={wishHandler}
              className={`w-8 h-8 sm:w-9 sm:h-9 rounded-full flex items-center justify-center shadow-md backdrop-blur-md transition-all duration-200 ${
                isInWish
                  ? "bg-rose-50 text-rose-600 border border-rose-200 shadow-rose-500/20 scale-105"
                  : "bg-white/90 text-stone-700 hover:text-rose-600 hover:bg-white hover:scale-105 border border-white/60"
              }`}
              title={isInWish ? "Remove from wishlist" : "Add to wishlist"}
              aria-label="Wishlist toggle"
            >
              {isInWish ? (
                <AiFillHeart className="text-lg text-rose-600" />
              ) : (
                <AiOutlineHeart className="text-lg" />
              )}
            </button>

            {/* Quick View Button */}
            <button
              onClick={openQuickView}
              className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-white/90 hover:bg-white text-stone-700 hover:text-amber-800 flex items-center justify-center shadow-md backdrop-blur-md transition-all duration-200 hover:scale-105 border border-white/60 opacity-90 sm:opacity-0 sm:group-hover:opacity-100"
              title="Quick preview"
              aria-label="Quick view"
            >
              <AiOutlineEye className="text-lg font-bold" />
            </button>

            {/* Details Arrow */}
            <button
              onClick={goToDetails}
              className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-white/90 hover:bg-white text-stone-700 hover:text-amber-800 flex items-center justify-center shadow-md backdrop-blur-md transition-all duration-200 hover:scale-105 border border-white/60 hidden sm:flex sm:opacity-0 sm:group-hover:opacity-100"
              title="View full product page"
              aria-label="View product page"
            >
              <BsArrowUpRight className="text-xs font-bold" />
            </button>
          </div>

          {/* Desktop Slide-up Quick View Bar */}
          <div className="absolute inset-x-3 bottom-3 translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300 z-10 hidden sm:block">
            <button
              onClick={openQuickView}
              className="w-full bg-white/95 hover:bg-white text-stone-900 font-bold text-xs py-2 px-3 rounded-xl shadow-lg backdrop-blur-md flex items-center justify-center gap-1.5 transition-all hover:scale-[1.01] border border-stone-200/60"
            >
              <AiOutlineEye className="text-sm text-amber-800" />
              <span>{t("card.quickView", "Quick View")}</span>
            </button>
          </div>

          {/* Photo Count Indicator (Mobile) */}
          {item.images && item.images.length > 1 && (
            <span className="absolute bottom-2 left-2 sm:hidden bg-stone-950/70 text-white text-[9px] font-bold px-1.5 py-0.5 rounded backdrop-blur-xs pointer-events-none">
              {item.images.length} photos
            </span>
          )}
        </div>

        {/* Card Body Details */}
        <div className="p-3.5 sm:p-4 flex flex-col flex-1 justify-between">
          <div>
            {/* Merchant / Shop Info */}
            <div className="flex items-center justify-between text-xs text-stone-500 mb-1">
              <div className="flex items-center gap-1.5 truncate">
                <BsShop className="text-amber-700 text-xs shrink-0" />
                <span className="truncate font-medium text-stone-600 hover:text-amber-800 transition">
                  {item.shop?.name || "Habesha Artisan"}
                </span>
              </div>
              <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200/50 flex items-center gap-0.5 shrink-0">
                <BsShieldCheck className="text-[10px]" />
                {t("card.verified", "Verified")}
              </span>
            </div>

            {/* Product Title */}
            <h3
              className="text-xs sm:text-sm font-semibold text-stone-900 group-hover:text-amber-800 transition-colors line-clamp-2 leading-snug min-h-[2.4rem]"
              title={item.name}
            >
              {item.name}
            </h3>

            {/* Rating Stars & Social Proof (AliExpress Standard) */}
            <div className="flex items-center gap-1.5 mt-1.5">
              <div className="flex items-center text-amber-400 text-xs">
                {[1, 2, 3, 4, 5].map((star) => (
                  <span key={star}>
                    {ratingValue >= star ? (
                      <AiFillStar className="text-amber-400" />
                    ) : (
                      <AiOutlineStar className="text-stone-300" />
                    )}
                  </span>
                ))}
              </div>
              <span className="text-xs font-bold text-stone-800">
                {ratingDisplay}
              </span>
              <span className="text-stone-300 text-[10px]">·</span>
              <span className="text-[11px] text-stone-500 font-medium">
                {soldCount > 1000
                  ? `${(soldCount / 1000).toFixed(1)}k`
                  : soldCount}{" "}
                {t("card.sold", "sold")}
              </span>
            </div>

            {/* Wholesale Tier Indicator */}
            {lowestBulkTier && (
              <div className="flex items-center gap-1 text-[10px] sm:text-[11px] font-semibold text-amber-950 bg-amber-50/80 px-2 py-0.5 rounded-md border border-amber-200/60 mt-2 w-fit">
                <BsTagsFill className="text-amber-700 text-[10px]" />
                <span>
                  {t("card.wholesale", "Wholesale")}: {lowestBulkTier.minQty}+ pcs @{" "}
                  {formatPrice(lowestBulkTier.discountPrice)}
                </span>
              </div>
            )}
          </div>

          {/* Pricing & Cart Action Row */}
          <div className="mt-3.5 pt-2.5 border-t border-stone-100 flex items-end justify-between gap-2">
            {/* Price Box */}
            <div className="flex flex-col">
              <div className="flex items-baseline gap-1.5">
                <span className="text-base sm:text-lg font-black text-stone-950 tracking-tight leading-none">
                  {formatPrice(item.discountPrice || item.originalPrice)}
                </span>
                {item.discountPrice &&
                  item.originalPrice &&
                  item.discountPrice < item.originalPrice && (
                    <span className="text-[11px] sm:text-xs text-stone-400 line-through">
                      {formatPrice(item.originalPrice)}
                    </span>
                  )}
              </div>
              <span className="text-[10px] text-stone-400 font-medium mt-0.5">
                {item.shippingFee === 0 || item.shippingTiers?.domestic?.freeShippingMin
                  ? t("card.freeShippingEligible", "Eligible for free shipping")
                  : t("card.buyerProtection", "Buyer Protection Included")}
              </span>
            </div>

            {/* Add to Cart Button */}
            <button
              onClick={cartHandler}
              disabled={isOutOfStock}
              className={`px-3 py-2 sm:px-3.5 sm:py-2 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all shadow-xs ${
                isOutOfStock
                  ? "bg-stone-200 text-stone-400 cursor-not-allowed"
                  : isInCart
                  ? "bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-600/20 ring-2 ring-emerald-500/20 active:scale-95"
                  : "bg-stone-900 hover:bg-amber-800 text-white hover:shadow-md active:scale-95"
              }`}
              title={
                isOutOfStock
                  ? t("card.soldOut", "Sold Out")
                  : isInCart
                  ? "Craft is in your shopping bag"
                  : "Add craft to shopping bag"
              }
              aria-label={isInCart ? "Remove from bag" : "Add to bag"}
            >
              {isInCart ? (
                <BsBagCheck className="text-sm font-bold" />
              ) : (
                <BsBagPlus className="text-sm font-bold" />
              )}
              <span className="hidden sm:inline">
                {isOutOfStock
                  ? t("card.soldOut", "Sold")
                  : isInCart
                  ? t("card.inBag", "In Bag")
                  : t("card.add", "Add")}
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Quick View Modal Popup */}
      {popup && <ProductDetail item={item} setpopup={setpopup} />}
    </>
  );
};

export default React.memo(Productcard);
