import React from "react";
import { useSelector } from "react-redux";
import { Navigate } from "react-router-dom";
import Loader from "../component/Layout/Loader";

const SellerProtectedRoute = ({ children }) => {
  const { isLoading, isSeller } = useSelector((state) => state.seller);
  if (isLoading) {
    return <Loader />;
  } else {
    if (!isSeller) {
      return <Navigate to="/ShopLogin" replace />;
    }
    return children;
  }
};

export default SellerProtectedRoute;
