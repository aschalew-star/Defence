import { useMemo, useCallback } from "react";
import { toast } from "react-toastify";
import { useAppDispatch, useAppSelector, useCurrency } from "./index";
import { addTocart, removeFromCart } from "../redux/Action/cartAction";
import { ICartItem } from "../types";

export interface UseCartLogicReturn {
  cart: ICartItem[];
  subtotal: number;
  shipping: number;
  grandTotal: number;
  formattedSubtotal: string;
  formattedShipping: string;
  formattedGrandTotal: string;
  increment: (item: ICartItem) => void;
  decrement: (item: ICartItem) => void;
  removeItem: (item: ICartItem) => void;
  clearCart: () => void;
  formatPrice: (amount?: number | null) => string;
}

export const useCartLogic = (): UseCartLogicReturn => {
  const dispatch = useAppDispatch();
  const { cart } = useAppSelector((state) => state.Cart);
  const { formatPrice } = useCurrency();

  const cartList: ICartItem[] = useMemo(() => cart || [], [cart]);

  const subtotal = useMemo(() => {
    return cartList.reduce(
      (acc, item) =>
        acc + (item.discountPrice || item.originalPrice || 0) * (item.qty || 1),
      0
    );
  }, [cartList]);

  const shipping = useMemo(() => {
    if (subtotal === 0) return 0;
    return subtotal > 3000 ? 0 : 150;
  }, [subtotal]);

  const grandTotal = useMemo(() => subtotal + shipping, [subtotal, shipping]);

  const increment = useCallback(
    (item: ICartItem) => {
      if (item.stock && item.qty >= item.stock) {
        toast.error("Maximum available stock reached!");
        return;
      }
      dispatch(addTocart({ ...item, qty: item.qty + 1 }) as any);
    },
    [dispatch]
  );

  const decrement = useCallback(
    (item: ICartItem) => {
      if (item.qty <= 1) {
        dispatch(removeFromCart(item) as any);
        toast.info("Item removed from cart");
        return;
      }
      dispatch(addTocart({ ...item, qty: item.qty - 1 }) as any);
    },
    [dispatch]
  );

  const removeItem = useCallback(
    (item: ICartItem) => {
      dispatch(removeFromCart(item) as any);
      toast.info("Item removed from cart");
    },
    [dispatch]
  );

  const clearCart = useCallback(() => {
    cartList.forEach((item) => {
      dispatch(removeFromCart(item) as any);
    });
    localStorage.removeItem("cartItems");
    toast.info("Shopping bag emptied");
  }, [dispatch, cartList]);

  return {
    cart: cartList,
    subtotal,
    shipping,
    grandTotal,
    formattedSubtotal: formatPrice(subtotal),
    formattedShipping: shipping === 0 ? "Free" : formatPrice(shipping),
    formattedGrandTotal: formatPrice(grandTotal),
    increment,
    decrement,
    removeItem,
    clearCart,
    formatPrice,
  };
};

export default useCartLogic;
