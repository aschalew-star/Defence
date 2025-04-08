
import React, { useState } from 'react';

const FAQItem = ({ question, answer }) => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleAnswer = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div className="faq-item mb-6">
      <button onClick={toggleAnswer} className="faq-question font-medium text-[18px]">
        {question}
      </button>
      {isOpen && <p className="faq-answer ml-6">{answer}</p>}
    </div>
  );
};

const FAQ = () => {
  const faqData = [
    {
      question: "What is a Merchant Exchange Platform?",
      answer: "A digital platform that allows merchants to trade goods and connect with other businesses."
    },
    {
      question: "How do I sign up as a merchant?",
      answer: "Go to the Sign Up page, fill in your details, and submit your business information."
    },
    {
      question: "How can I list my products?",
      answer: "Log in to your dashboard, go to Product Listings, and add your product details."
    },
    {
      question: "How does payment processing work?",
      answer: "Payments are securely processed via the platform and transferred to your merchant account."
    },
    {
      question: "How do I manage my orders?",
      answer: "You can view and manage orders through your Merchant Dashboard under the Orders section."
    },
    {
      question: "How do I withdraw my earnings?",
      answer: "Go to the Payouts section, choose your withdrawal method, and confirm your transaction."
    }
  ];

  return (
    <div className="faq-container m-10 py-20">
      <h2 className="faq-title font-bold text-[24px] text-center pb-3">Frequently Asked Questions</h2>
      {faqData.map((item, index) => (
        <FAQItem key={index} question={item.question} answer={item.answer} />
      ))}
    </div>
  );
};

export default FAQ;
