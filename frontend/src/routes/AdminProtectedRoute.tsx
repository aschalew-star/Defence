import React, { ReactNode } from "react";
// import { useSelector } from "react-redux";
// import { Navigate } from "react-router-dom";
// import Loader from "../component/Layout/Loader";

interface AdminProtectedRouteProps {
  children: ReactNode;
}

const AdminProtectedRoute: React.FC<AdminProtectedRouteProps> = ({ children }) => {
  // Authentication & authorization bypassed for test as requested by user
  // const { loading, isAuthenticated, user } = useSelector((state: any) => state.user);
  // if (loading) {
  //   return <Loader />;
  // }
  // if (!isAuthenticated || !["admin", "superadmin"].includes(user?.role)) {
  //   return <Navigate to="/shop-login?mode=admin" replace />;
  // }

  return <>{children}</>;
};

export default AdminProtectedRoute;
