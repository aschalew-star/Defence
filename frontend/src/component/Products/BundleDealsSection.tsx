import React, { useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import { useAppDispatch, useCurrency } from "../../hooks";
import { addTocart } from "../../redux/Action/cartAction";
import { IProduct } from "../../types";
import { BsPlusLg, BsBagPlus, BsGift } from "react-icons/bs";

export interface BundleDealsSectionProps {
  currentProduct: IProduct;
  bundleItems?: IProduct[];
  discountPercentage?: number;
}

const BundleDealsSection: React.FC<BundleDealsSectionProps> = ({
  currentProduct,
  bundleItems = [],
  discountPercentage = 15,
}) => {
  const dispatch = useAppDispatch();
  const { formatPrice } = useCurrency();

  const validBundleItems = (bundleItems || []).filter(
    (item) => item && item._id !== currentProduct._id
  );

  const [selectedIds, setSelectedIds] = useState<string[]>([
    currentProduct._id,
    ...validBundleItems.slice(0, 2).map((i) => i._id),
  ]);

  if (validBundleItems.length === 0) return null;

  const allItems = [currentProduct, ...validBundleItems.slice(0, 2)];

  const toggleItem = (id: string) => {
    if (id === currentProduct._id) return; // current item required
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter((item) => item !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  const selectedItems = allItems.filter((i) => selectedIds.includes(i._id));

  const rawTotal = selectedItems.reduce(
    (acc, curr) => acc + Number(curr.discountPrice || curr.originalPrice || 0),
    0
  );

  const discountAmount =
    selectedItems.length > 1 ? Math.round((rawTotal * discountPercentage) / 100) : 0;
  const bundleTotal = rawTotal - discountAmount;

  const handleAddBundleToCart = () => {
    selectedItems.forEach((item) => {
      dispatch(addTocart({ ...item, qty: 1 }) as any);
    });
    toast.success(
      `Added ${selectedItems.length} bundle items to shopping bag! (Saved ${formatPrice(discountAmount)})`
    );
  };

  return (
    <div className="bg-gradient-to-r from-amber-50/60 via-stone-50 to-orange-50/40 rounded-3xl p-5 sm:p-7 border border-amber-200/80 shadow-xs space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-amber-200/50">
        <div>
          <span className="text-[10px] font-black uppercase tracking-wider bg-amber-500 text-stone-950 px-2 py-0.5 rounded-full inline-flex items-center gap-1 shadow-xs">
            <BsGift className="text-xs" />
            Bundle & Save {discountPercentage}%
          </span>
          <h3 className="text-base sm:text-lg font-bold font-serif text-stone-900 mt-1">
            Frequently Bought Together
          </h3>
        </div>
        <p className="text-xs text-stone-500">
          Complete the traditional attire with authentic handwoven accessories.
        </p>
      </div>

      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        {/* Items visual list */}
        <div className="flex flex-wrap items-center gap-3 sm:gap-4 flex-1">
          {allItems.map((item, idx) => {
            const isSelected = selectedIds.includes(item._id);
            const isCurrent = item._id === currentProduct._id;
            const price = Number(item.discountPrice || item.originalPrice || 0);

            return (
              <React.Fragment key={item._id}>
                {idx > 0 && (
                  <div className="w-7 h-7 rounded-full bg-white text-stone-400 border border-stone-200 flex items-center justify-center text-xs font-bold shrink-0">
                    <BsPlusLg />
                  </div>
                )}

                <div
                  onClick={() => !isCurrent && toggleItem(item._id)}
                  className={`relative p-3 rounded-2xl bg-white border transition-all cursor-pointer flex items-center gap-3 shadow-xs ${
                    isSelected
                      ? "border-amber-600 ring-2 ring-amber-500/20"
                      : "border-stone-200 opacity-60 hover:opacity-100"
                  }`}
                >
                  <img
                    src={
                      item.featuredImage?.url ||
                      item.images?.[0]?.url ||
                      "/placeholder.jpg"
                    }
                    alt={item.name}
                    className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl object-cover shrink-0 border border-stone-100"
                  />
                  <div className="max-w-[130px] sm:max-w-[160px]">
                    <span className="text-[10px] text-amber-800 font-bold block">
                      {isCurrent ? "This Craft" : "Add Accessory"}
                    </span>
                    <h5
                      className="text-xs font-bold text-stone-900 truncate"
                      title={item.name}
                    >
                      {item.name}
                    </h5>
                    <span className="text-xs font-black text-stone-900">
                      {formatPrice(price)}
                    </span>
                  </div>

                  <input
                    type="checkbox"
                    checked={isSelected}
                    disabled={isCurrent}
                    onChange={() => toggleItem(item._id)}
                    className="accent-amber-800 ml-1 cursor-pointer"
                  />
                </div>
              </React.Fragment>
            );
          })}
        </div>

        {/* Pricing Summary & Add Button */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-amber-200/80 shadow-xs flex flex-col justify-between min-w-[240px]">
          <div>
            <div className="flex items-baseline justify-between gap-2 mb-1">
              <span className="text-xs text-stone-500 font-medium">Bundle Price:</span>
              <span className="text-xl sm:text-2xl font-black text-amber-950">
                {formatPrice(bundleTotal)}
              </span>
            </div>

            {discountAmount > 0 && (
              <div className="flex items-center justify-between text-xs text-rose-600 font-bold mb-3">
                <span>Bundle Savings:</span>
                <span>-{formatPrice(discountAmount)} ({discountPercentage}%)</span>
              </div>
            )}
          </div>

          <button
            onClick={handleAddBundleToCart}
            className="w-full py-2.5 px-4 bg-stone-900 hover:bg-amber-800 text-white font-bold text-xs rounded-xl shadow-md transition-all active:scale-95 flex items-center justify-center gap-2"
          >
            <BsBagPlus className="text-sm" />
            <span>Add All {selectedItems.length} to Bag</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default BundleDealsSection;
