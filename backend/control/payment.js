const express = require("express");
const axios = require("axios");

const router = express.Router();


const CHAPA_SECRET_KEY ="CHASECK_TEST-1eSMtwQD3CWqw8SiOJTo73gw1GpD2ZwP";
const CHAPA_BASE_URL = "https://api.chapa.co/v1/transaction";



// Middleware to validate request body
const validateRequestBody = (req, res, next) => {
  const { amount, currency,  first_name, last_name, tx_ref, return_url } = req.body;

  // Check if any required field is missing or null
  if ( !amount || !currency || !first_name || !last_name || !tx_ref || !return_url) {
    return res.status(400).json({ error: 'All fields are required' });
  }


  // If all validations pass, proceed to the next middleware
  next();
};

// Endpoint to create a payment session
router.post("/init", validateRequestBody, async (req, res) => {
  try {
    const { amount, currency, email, first_name, last_name, tx_ref, return_url } = req.body;

    const response = await axios.post(
      `${CHAPA_BASE_URL}/initialize`,
      {
        amount,
        currency,
    
        first_name,
        last_name,
        tx_ref,
        return_url,
      },
      {
        headers: {
          Authorization: `Bearer ${CHAPA_SECRET_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    res.json(response.data); // Return the response data (URL, status, etc.)
  } catch (error) {
    res.status(500).json({ error: error.response?.data || "Payment initialization failed" });
  }
});

// Webhook to handle payment notifications
router.post("/success", (req, res) => {
  const event = req.body;

  if (event.status === "success") {
    console.log("Payment successful:", event);
    // Update order/payment status in your database
  }

  res.sendStatus(200);
});


// ✅ Verify Payment & Store Order
router.post("/verify", async (req, res) => {
  const { tx_ref } = req.body;

  try {
    // Verify payment with Chapa
    const response = await axios.get(`https://api.chapa.co/v1/transaction/verify/${tx_ref}`, {
      headers: {
        Authorization: `Bearer ${CHAPA_SECRET_KEY}`,
      },
    });

    const chapaData = response?.data?.data;

    // ✅ Ensure response contains transaction data
    if (!chapaData) {
      console.error("❌ No transaction data received from Chapa");
      return res.status(400).json({ status: "error", message: "Invalid transaction data" });
    }


    if (chapaData.status === "success") {
      return res.status(200).json({
        status: "success",
        ref_id: chapaData.tx_ref,
    })}}
    catch (error) {
      console.error("Payment verification error:", error);
      res.status(500).json({ status: "error", message: "Internal Server Error" });
    }})


module.exports = router;

