import React from "react";
import Events from "../component/Events/Events";
import Navbar from "../component/Layout/Navbar";
import Footer from "../component/Layout/Footer";

function Event() {
  return (
    <div className="pt-28 md:pt-32 bg-gray-50/50 min-h-screen flex flex-col justify-between">
      <Navbar active={4} />
      <div className="flex-1">
        <Events />
      </div>
      <Footer />
    </div>
  );
}

export default Event;
