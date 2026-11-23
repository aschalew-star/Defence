import React from "react";
import { FiCheck, FiTruck, FiCreditCard, FiCheckCircle } from "react-icons/fi";

export interface CheckoutStepsProps {
  active: number;
}

const CheckoutSteps: React.FC<CheckoutStepsProps> = ({ active }) => {
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
                className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold transition shadow-2xs select-none ${
                  isDone
                    ? "bg-emerald-700 text-white"
                    : isCurrent
                    ? "bg-gradient-to-r from-amber-800 to-amber-950 text-white shadow-xs ring-2 ring-amber-700/20"
                    : "bg-stone-100 text-stone-400 border border-stone-200/60"
                }`}
              >
                {isDone ? (
                  <FiCheck className="text-sm shrink-0" />
                ) : (
                  <Icon className="text-sm shrink-0" />
                )}
                <span className="truncate">{step.label}</span>
              </div>

              {/* Connecting Line */}
              {idx < steps.length - 1 && (
                <div
                  className={`w-8 sm:w-16 h-1 rounded-full transition ${
                    active > step.num ? "bg-emerald-600" : "bg-stone-200"
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
