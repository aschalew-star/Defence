import React from "react";
import Navbar from "../component/Layout/Navbar";
import Footer from "../component/Layout/Footer";
import Profile from "../component/Profile/Profile";

function ProfilePage() {
  return (
    <div className="pt-28 md:pt-32 bg-gray-50/50 min-h-screen flex flex-col justify-between">
      <Navbar active={6} />
      <div className="flex-1">
        <Profile />
      </div>
      <Footer />
    </div>
  );
}

export default ProfilePage;

