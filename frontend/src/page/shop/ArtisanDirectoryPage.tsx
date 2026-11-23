import React from "react";
import Navbar from "../../component/Layout/Navbar";
import Footer from "../../component/Layout/Footer";
import ArtisanDirectory from "../../component/shop/ArtisanDirectory";

function ArtisanDirectoryPage() {
  return (
    <div className="pt-28 md:pt-32 bg-gray-50/50 min-h-screen flex flex-col justify-between">
      <Navbar active={3} />
      <div className="flex-1">
        <ArtisanDirectory />
      </div>
      <Footer />
    </div>
  );
}

export default ArtisanDirectoryPage;

