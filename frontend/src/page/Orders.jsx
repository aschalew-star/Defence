import React from 'react'
import Navbar from "../component/Layout/Navbar";
import Order from "../component/Order"


function Orders() {
  return (
    <div className="pt-48 md:pt-1 -mt-1">
      {/* <Navbar show={7}/> */}
      <Order />
    </div>
  )
}

export default Orders

