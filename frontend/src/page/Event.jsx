import React from "react";
import Events from "../component/Events/Events";
import Navbar from "../component/Layout/Navbar";
import Footer from "../component/Layout/Footer";


function Event() {
  return (
    <div className='className=" pt-64 md:pt-48'>
      <Navbar active={4} />
      <Events />

      <Footer />
    </div>
  );
}

export default Event;
