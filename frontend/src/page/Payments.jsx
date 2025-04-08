import React from 'react'
import Payment from '../component/payment/Payment'
import Navbar from '../component/Layout/Navbar'
import CheckoutSteps from "../component/Checkout/Checkoutprocess";




function Payments() {
  return (
     <div className="pt-48 md:pt-20 -mt-1 mb-24">
              <Navbar show={7}/>
              <CheckoutSteps active={2}/>
              <Payment/>
              {/* <Footer /> */}
        
            </div>
  )
}

export default Payments