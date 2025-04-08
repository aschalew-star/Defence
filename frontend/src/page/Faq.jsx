import React from 'react'
import FAQ from '../component/FAQ'
import Footer from "../component/Layout/Footer";
import Navbar from "../component/Layout/Navbar";


function Faq() {
  return (
<div className='className=" pt-36 mt-4 md:mt-0 md:pt-12'>
      <Navbar active={6} />
      <FAQ />
      <Footer/>
    </div>
  )
}

export default Faq

