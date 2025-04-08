import React, { useState, useEffect } from "react";
import { useSearchParams,useParams, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import axios from "axios";
import { toast } from "react-toastify";

function SSeccess() {
  const [orderData, setOrderData] = useState(null);
  const { user } = useSelector((state) => state.user);
  // const [searchParams] = useSearchParams();
  const { tx_ref } = useParams();
  // const tx_ref = searchParams.get("tx_ref");
  const navigate = useNavigate();

  // ✅ Load orderData first
  useEffect(() => {
    const storedOrder = JSON.parse(localStorage.getItem("latestOrder"));
    console.log("🔍 Loaded order from localStorage:", storedOrder); // Log orderData from localStorage
    if (storedOrder) {
      setOrderData(storedOrder);
    } else {
      console.warn("⚠️ No order data found in localStorage.");
      toast.error("No order data found. Please try again.");
    }
  }, []); // This will run only once to load the order data

  // ✅ Runs only AFTER `tx_ref` and `orderData` are available
  useEffect(() => {
    console.log("🔍 tx_ref:", tx_ref); // Log tx_ref value
    console.log("🔍 orderData:", orderData); // Log orderData

    if (!tx_ref || !orderData) {
      console.log("⏳ Waiting for tx_ref and orderData...");
      return; // Wait until both tx_ref and orderData are available
    }

    console.log("✅ Both tx_ref and orderData are available, starting payment verification...");

    const verifyPayment = async () => {
      try {
        console.log("🔍 Verifying payment with tx_ref:", tx_ref);
        const response = await axios.post("http://localhost:5000/payment/verify", { tx_ref });

        if (response.data.status === "success") {
          toast.success("✅ Payment successful! Order placed.");

          const finalOrder = {
            ...orderData,
            user: user || null,
            paymentInfo: {
              type: "Chapa",
              status: "success",
              id: response.data.ref_id,
            },
          };

          console.log("📨 Sending final order to backend:", finalOrder);

          try {
            const orderResponse = await axios.post("http://localhost:5000/order/create-order", finalOrder, {
              headers: { "Content-Type": "application/json" },
            });

            if (orderResponse.data.success==true) {
              console.log("✅ Order successfully stored in database:", orderResponse.data);
              toast.success("✅ Order stored successfully!");

              // ✅ Cleanup localStorage only after success
              localStorage.removeItem("cartItems");
              localStorage.removeItem("latestOrder");

              navigate("/");
              window.location.reload();
            } else {
              console.error("❌ Order creation failed:", orderResponse.data);
              toast.error("❌ Failed to store order in database.");
            }
          } catch (orderError) {
            console.error("❌ Error storing order:", orderError);
            toast.error("❌ Error storing order. Please try again.");
          }
        } else {
          console.error("❌ Payment verification failed:", response.data);
          toast.error("❌ Payment verification failed!");
        }
      } catch (error) {
        console.error("❌ Error in payment verification:", error);
        toast.error("❌ Error verifying payment. Please try again.");
      }
    };

    verifyPayment();
  }, [tx_ref, orderData, user, navigate]); // ✅ Runs when `tx_ref` or `orderData` updates

  return (
    <div className="w-full flex justify-center items-center h-[60vh]">
      <div>
        <div className="text-[30px] font-Poppins text-blue-400">
          🎉 Great! Your payment was successful!
        </div>
      </div>
    </div>
  );
}

export default SSeccess;
