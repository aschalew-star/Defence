import React from "react";
import { FiCheck, FiTruck, FiCreditCard, FiCheckCircle } from "react-icons/fi";

const CheckoutSteps = ({ active }) => {
  const steps = [
    { num: 1, label: "Shipping Info", icon: FiTruck },
    { num: 2, label: "Payment", icon: FiCreditCard },
    { num: 3, label: "Success", icon: FiCheckCircle },
  ];

  return (
    <div className="w-full flex items-center justify-center py-6">
      <div className="flex items-center gap-3 sm:gap-6">
        {steps.map((step, idx) => {
          const isDone = active > step.num;
          const isCurrent = active === step.num;
          const Icon = step.icon;

          return (
            <React.Fragment key={step.num}>
              {/* Step Pill */}
              <div
                className={`flex items-center gap-2 px-3.5 py-2 rounded-full text-xs font-bold transition shadow-sm ${
                  isDone
                    ? "bg-emerald-600 text-white"
                    : isCurrent
                    ? "bg-amber-800 text-white shadow"
                    : "bg-gray-100 text-gray-400"
                }`}
              >
                {isDone ? (
                  <FiCheck className="text-sm" />
                ) : (
                  <Icon className="text-sm" />
                )}
                <span>{step.label}</span>
              </div>

              {/* Connecting Line */}
              {idx < steps.length - 1 && (
                <div
                  className={`w-8 sm:w-16 h-1 rounded-full transition ${
                    active > step.num ? "bg-emerald-500" : "bg-gray-200"
                  }`}
                />
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
};

export default CheckoutSteps;
