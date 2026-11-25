import { useCallback, useMemo } from "react";
import { toast } from "react-toastify";
import { useAppDispatch, useAppSelector } from "./index";
import { addToWishlist, removeFromwish } from "../redux/Action/Wishlist";
import { addTocart } from "../redux/Action/cartAction";

export interface UseWishlistLogicReturn {
  wish: any[];
  isInWish: (id: string) => boolean;
  toggleWish: (item: any) => void;
  removeFromWish: (item: any) => void;
  moveToCart: (item: any) => void;
}

export const useWishlistLogic = (): UseWishlistLogicReturn => {
  const dispatch = useAppDispatch();
  const { wish } = useAppSelector((state) => state.Wish);

  const wishList = useMemo(() => wish || [], [wish]);

  const isInWish = useCallback(
    (id: string) => {
      return wishList.some((i: any) => i._id === id);
    },
    [wishList]
  );

  const toggleWish = useCallback(
    (item: any) => {
      if (isInWish(item._id)) {
        dispatch(removeFromwish(item) as any);
        toast.info("Removed from Wishlist");
      } else {
        dispatch(addToWishlist({ ...item, qty: 1 }) as any);
        toast.success("Added to Wishlist!");
      }
    },
    [dispatch, isInWish]
  );

  const removeFromWish = useCallback(
    (item: any) => {
      dispatch(removeFromwish(item) as any);
      toast.info("Removed from Wishlist");
    },
    [dispatch]
  );

  const moveToCart = useCallback(
    (item: any) => {
      if ((item.stock ?? 0) < 1) {
        toast.error("Item is currently out of stock!");
        return;
      }
      dispatch(addTocart({ ...item, qty: 1 }) as any);
      dispatch(removeFromwish(item) as any);
      toast.success("Moved item to Cart!");
    },
    [dispatch]
  );

  return {
    wish: wishList,
    isInWish,
    toggleWish,
    removeFromWish,
    moveToCart,
  };
};

export default useWishlistLogic;
