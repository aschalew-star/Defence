import { useAppSelector } from "./redux";

export const useAuth = () => {
  const { user, isAuthenticated, loading: userLoading } = useAppSelector(
    (state) => state.user
  );
  const { seller, isSeller, isLoading: sellerLoading } = useAppSelector(
    (state) => state.seller
  );

  const isAdmin = user?.role === "admin" || user?.role === "superadmin";

  return {
    user,
    seller,
    isAuthenticated: !!isAuthenticated,
    isSeller: !!isSeller,
    isAdmin,
    role: user?.role || (isSeller ? "seller" : "guest"),
    isLoading: userLoading || sellerLoading,
  };
};
