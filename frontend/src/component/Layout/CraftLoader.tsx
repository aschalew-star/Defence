import React from "react";

const CraftLoader: React.FC = () => {
  return (
    <div className="w-full min-h-[50vh] flex flex-col items-center justify-center p-8 select-none">
      <div className="relative w-14 h-14 flex items-center justify-center">
        <div className="absolute inset-0 rounded-2xl border-4 border-amber-600/20 border-t-amber-700 animate-spin" />
        <div className="w-6 h-6 rounded-xl bg-gradient-to-tr from-amber-600 to-yellow-500 text-white font-serif font-black text-xs flex items-center justify-center shadow-xs">
          A
        </div>
      </div>
      <p className="mt-4 text-xs font-bold text-stone-700 tracking-wide uppercase font-serif animate-pulse">
        Loading Ethiopian Craft Atelier...
      </p>
    </div>
  );
};

export default CraftLoader;
