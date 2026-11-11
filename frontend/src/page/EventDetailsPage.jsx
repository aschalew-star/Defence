import React from "react";
import EventDetailsView from "../component/Events/EventDetailsView";
import Navbar from "../component/Layout/Navbar";
import Footer from "../component/Layout/Footer";

function EventDetailsPage() {
  return (
    <div className="pt-28 md:pt-32 bg-stone-50 min-h-screen flex flex-col justify-between">
      <Navbar active={4} />
      <div className="flex-1">
        <EventDetailsView />
      </div>
      <Footer />
    </div>
  );
}

export default EventDetailsPage;
