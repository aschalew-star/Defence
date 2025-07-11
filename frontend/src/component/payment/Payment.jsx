import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";

import { useSelector } from "react-redux";
import axios from "axios";
import { toast } from "react-toastify";
import { RxCross1 } from "react-icons/rx";

const Payment = () => {
  const [orderData, setOrderData] = useState([]);
  const [open, setOpen] = useState(false);
  const { user } = useSelector((state) => state.user);
  const navigate = useNavigate();

  useEffect(() => {
    const orderData = JSON.parse(localStorage.getItem("latestOrder"));
    setOrderData(orderData);
  }, []);

  console.log(orderData);

  const order = {
    cart: orderData?.cart,
    shippingAddress: orderData?.shippingAddress,
    user: user && user,
    totalPrice: orderData?.totalPrice,
  };

  console.log(order);

  const handlePayment = async (e) => {
    // setLoading(true);
    e.preventDefault();
    const tx_ref = "tx-" + Date.now();
    const return_url = `http://localhost:3000/Seccess/${tx_ref}`;

    console.log(user.email, order.totalPrice, user.name);

    try {
      const response = await axios.post("http://localhost:5000/payment/init", {
        amount: order.totalPrice,
        currency: "ETB",
        // email: user.email, // Only email required, no login needed
        first_name: user.name,
        last_name: "MEP",
        tx_ref,
        return_url,
      });

      console.log(response);

      if (response.data.status === "success") {
        window.location.href = response.data.data.checkout_url; // Redirects to Chapa UI
      } else {
        alert("Payment initiation failed!");
      }
    } catch (error) {
      console.error("Payment Error:", error);
      alert("An error occurred");
    }
    // setLoading(false);
  };

  const cashOnDeliveryHandler = async (e) => {
    e.preventDefault();

    const config = {
      headers: {
        "Content-Type": "application/json",
      },
    };

    order.paymentInfo = {
      type: "Cash On Delivery",
    };

    await axios
      .post("http://localhost:5000/order/create-order", order, config)
      .then((res) => {
        setOpen(false);
        localStorage.setItem("cartItems", JSON.stringify([]));
        localStorage.setItem("latestOrder", JSON.stringify([]));
        toast.success("Order successful!");
        navigate("/");

        window.location.reload();
      }).catch((err)=>{
        console.log(err.message);
      });
  };

  return (
    <div className="w-full flex flex-col items-center py-8">
      <div className="w-[90%] 1000px:w-[70%] block 800px:flex">
        <div className="w-full 800px:w-[65%]">
          <PaymentInfo
            user={user}
            open={open}
            setOpen={setOpen}
            // onApprove={onApprove}
            handlePayment={handlePayment}
            // createOrder={createOrder}
            // paymentHandler={paymentHandler}
            cashOnDeliveryHandler={cashOnDeliveryHandler}
          />
        </div>
        <div className="w-full 800px:w-[35%] 800px:mt-0 mt-8">
          <CartData orderData={orderData} />
        </div>
      </div>
    </div>
  );
};

const PaymentInfo = ({
  user,
  open,
  setOpen,
  // onApprove,
  // createOrder,
  handlePayment,
  // paymentHandler,
  cashOnDeliveryHandler,
}) => {
  const [select, setSelect] = useState(1);

  return (
    <div className="w-full 800px:w-[95%] bg-[#fff] rounded-md p-5 pb-8">
      {/* select buttons */}
      <div>
        <div className="flex w-full pb-5 border-b mb-2">
          <div
            className="w-[25px] h-[25px] rounded-full bg-transparent border-[3px] border-[#1d1a1ab4] relative flex items-center justify-center"
            onClick={() => setSelect(1)}
          >
            {select === 1 ? (
              <div className="w-[13px] h-[13px] bg-[#1d1a1acb] rounded-full" />
            ) : null}
          </div>
          <h4 className="text-[18px] pl-2 font-[600] text-[#000000b1]">
            Pay with Chapa
          </h4>
        </div>
      </div>

      <br />
      {/* cash on delivery */}
      <div>
        <div className="flex w-full pb-5 border-b mb-2">
          <div
            className="w-[25px] h-[25px] rounded-full bg-transparent border-[3px] border-[#1d1a1ab4] relative flex items-center justify-center"
            onClick={() => setSelect(3)}
          >
            {select === 3 ? (
              <div className="w-[13px] h-[13px] bg-[#1d1a1acb] rounded-full" />
            ) : null}
          </div>
          <h4 className="text-[18px] pl-2 font-[600] text-[#000000b1]">
            Cash on Delivery
          </h4>
        </div>

        {/* cash on delivery */}
        {select === 3 ? (
          <div className="w-full flex">
            <form className="w-full" onSubmit={cashOnDeliveryHandler}>
              <input
                type="submit"
                value="confirm with delivery"
                className="w-[150px] my-3 flex items-center justify-center   !bg-[#f63b60] text-[#fff] h-[45px] rounded-[5px]
                 cursor-pointer text-[14px] font-[500]"
              />
            </form>
          </div>
        ) : null}

        {/* chapa payment  */}
        {select === 1 ? (
          <div className="w-full flex">
            <form className="w-full" onSubmit={handlePayment}>
              <input
                type="submit"
                value="confirm with chapa"
                className="w-[150px] my-3 flex items-center justify-center   !bg-[#f63b60] text-[#fff]
                 h-[45px] rounded-[5px] cursor-pointer text-[14px] font-[500]"
              />
            </form>
          </div>
        ) : null}
      </div>
    </div>
  );
};

const CartData = ({ orderData }) => {
  const shipping = orderData?.shipping?.toFixed(2);
  return (
    <div className="w-full bg-[#fff] rounded-md p-5 pb-8">
      <div className="flex justify-between">
        <h3 className="text-[16px] font-[400] text-[#000000a4]">subtotal:</h3>
        <h5 className="text-[18px] font-[600]">{orderData?.subTotalPrice}  Birr</h5>
      </div>
      <br />
      <div className="flex justify-between">
        <h3 className="text-[16px] font-[400] text-[#000000a4]">shipping:</h3>
        <h5 className="text-[18px] font-[600]">{shipping}  Birr</h5>
      </div>
      <br />
      <div className="flex justify-between border-b pb-3">
        <h3 className="text-[16px] font-[400] text-[#000000a4]">Discount:</h3>
        <h5 className="text-[18px] font-[600]">
          {orderData?.discountPrice ?  orderData.discountPrice+  "Birr": "-"}
        </h5>
      </div>

      <div className="flex justify-between border-b pb-3 items-center ">
        <h3 className="text-[19px] mt-1 font-[650] text-black ">
          Total price:
        </h3>
        <h5 className="text-[18px] font-[600] text-end pt-3">
          {orderData?.totalPrice}  Birr
        </h5>
      </div>

      <br />
    </div>
  );
};

export default Payment;
