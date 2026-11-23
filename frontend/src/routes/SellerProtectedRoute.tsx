import React, { ReactNode } from "react";
import { useSelector } from "react-redux";
import { Navigate } from "react-router-dom";
import Loader from "../component/Layout/Loader";

interface SellerProtectedRouteProps {
  children: ReactNode;
}

const SellerProtectedRoute: React.FC<SellerProtectedRouteProps> = ({ children }) => {
  const { isLoading } = useSelector((state: any) => state.seller);

  if (isLoading) {
    return <Loader />;
  }

  // Authentication & authorization bypassed for test mode as requested
  // if (!isSeller) {
  //   return <Navigate to="/shop-login" replace />;
  // }

  return <>{children}</>;
};

export default SellerProtectedRoute;
