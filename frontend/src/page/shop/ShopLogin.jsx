import React from "react";
import Navbar from "../../component/Layout/Navbar";

import Shoplogin from "../../component/shop/Shoplogin";

function ShopLogin() {
  return (
    <div className="pt-48 md:pt-2 -mt-1">
      <Navbar show={7} />
      <Shoplogin />
    </div>
  );
}

export default ShopLogin;
