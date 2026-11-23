import React, { useState } from "react";
import { FiChevronDown, FiHelpCircle } from "react-icons/fi";
import { useLanguage } from "../hooks/useLanguage";

export interface FAQItemProps {
  question: string;
  answer: string;
}

const FAQItem: React.FC<FAQItemProps> = ({ question, answer }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="border border-stone-200 rounded-2xl overflow-hidden transition-all duration-200 bg-white shadow-xs">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-5 text-left font-bold text-stone-900 hover:text-amber-800 transition"
      >
        <span className="text-base sm:text-lg pr-4">{question}</span>
        <FiChevronDown
          className={`text-xl text-stone-400 transition-transform duration-200 shrink-0 ${
            isOpen ? "rotate-180 text-amber-700" : ""
          }`}
        />
      </button>
      {isOpen && (
        <div className="px-5 pb-5 pt-1 text-sm text-stone-600 leading-relaxed border-t border-stone-100">
          {answer}
        </div>
      )}
    </div>
  );
};

const FAQ: React.FC = () => {
  const { t } = useLanguage();

  const faqData: FAQItemProps[] = [
    {
      question: t("faqView.q1", "What is the Habesha Artisan Craft & Merchant Exchange?"),
      answer: t("faqView.a1", "A cultural commerce platform connecting authentic Ethiopian weavers, leather artisans, and traditional craftspeople directly with buyers and the global diaspora."),
    },
    {
      question: t("faqView.q2", "How do I register as an Ethiopian Artisan Merchant?"),
      answer: t("faqView.a2", "Navigate to the Shop Sign Up page, enter your business details, phone number, and workshop location in Addis Ababa or Ethiopian regional craft hubs."),
    },
    {
      question: t("faqView.q3", "How does custom traditional garment sizing work?"),
      answer: t("faqView.a3", "Buyers can input custom tailoring measurements (bust, waist, hips, length, and neck) which are verified by our master weavers before the pit-loom weaving process begins."),
    },
    {
      question: t("faqView.q4", "What payment methods are supported for domestic & diaspora buyers?"),
      answer: t("faqView.a4", "We support Chapa (Telebirr, CBEBirr, Awash, local debit cards) as well as international cards (Visa/Mastercard) and Cash upon Handover in Addis Ababa."),
    },
    {
      question: t("faqView.q5", "How are artisan earnings and payouts processed?"),
      answer: t("faqView.a5", "Artisans receive escrow-secured payouts directly to their CBE (Commercial Bank of Ethiopia) account or Telebirr merchant wallet upon customer handover verification."),
    },
    {
      question: t("faqView.q6", "How does delivery confirmation work?"),
      answer: t("faqView.a6", "When the order is handed over by the courier, a secure 6-digit confirmation OTP code is verified to finalize delivery and release escrow funds."),
    },
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 py-16 sm:py-24">
      <div className="text-center mb-12">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-amber-50 text-amber-800 mb-4 text-2xl">
          <FiHelpCircle />
        </div>
        <h2 className="text-3xl sm:text-4xl font-black text-stone-900 font-serif">
          {t("faqView.title", "Frequently Asked Questions")}
        </h2>
        <p className="text-sm text-stone-500 mt-2">
          {t("faqView.subtitle", "Everything you need to know about our authentic Ethiopian artisan marketplace")}
        </p>
      </div>

      <div className="space-y-4">
        {faqData.map((item, index) => (
          <FAQItem key={index} question={item.question} answer={item.answer} />
        ))}
      </div>
    </div>
  );
};

export default FAQ;
