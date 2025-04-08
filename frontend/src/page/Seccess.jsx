import React from 'react'
import SSeccess from '../component/payment/SSeccess'
import Navbar from '../component/Layout/Navbar'
import CheckoutSteps from "../component/Checkout/Checkoutprocess";




function Payments() {
  return (
     <div className="pt-48 md:pt-32 -mt-1 mb-24">
              <Navbar show={7}/>
              <CheckoutSteps active={3}/>
              <SSeccess/>
              {/* <Footer /> */}
        
            </div>
  )
}

export default Payments