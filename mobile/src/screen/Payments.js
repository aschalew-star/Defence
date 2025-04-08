import React from 'react'
import CheckoutSteps from "../components/Paymentheader"
import { View,Text } from 'react-native'
import Payment from '../components/PAyment'

function Payments() {
  return (
    <View>
       < CheckoutSteps active={2}/>
       <Payment/>
    </View>
  )
}

export default Payments