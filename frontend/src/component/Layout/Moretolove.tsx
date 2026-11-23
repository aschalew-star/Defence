import React, { useState, useEffect } from "react";
import axios from "axios";
import { server } from "../../server";
import Productcard from "../Products/Productcard";
import { FiTrendingUp } from "react-icons/fi";
import { useLanguage } from "../../hooks/useLanguage";

function Moretolove() {
  const { t } = useLanguage();
  const [data, setData] = useState([]);
  const [activeTab, setActiveTab] = useState("all");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const tabs = [
    { label: t("moreToLove.tabTopSelling"), val: "all" },
    { label: t("moreToLove.tabKemis"), val: "kemis" },
    { label: t("moreToLove.tabMen"), val: "men" },
    { label: t("moreToLove.tabKids"), val: "kids" },
  ];

  useEffect(() => {
    let isMounted = true;
    const fetchTopProducts = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const queryParams = new URLSearchParams({
          limit: "10",
          sort: "best-selling",
        });

        if (activeTab !== "all") {
          queryParams.append("category", activeTab);
        }

        const res = await axios.get(
          `${server}/product/get-all-products?${queryParams.toString()}`
        );

        if (isMounted) {
          setData(res.data.products || []);
        }
      } catch (err: any) {
        if (isMounted) {
          setError(
            err.response?.data?.message ||
              err.message ||
              "Could not load curated products"
          );
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    fetchTopProducts();

    return () => {
      isMounted = false;
    };
  }, [activeTab]);

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      {/* Section Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-amber-700 mb-1">
            <FiTrendingUp className="text-sm" />
            <span>{t("moreToLove.handpicked")}</span>
          </div>
          <h2 className="text-3xl font-black text-gray-900 font-serif">
            {t("moreToLove.title")}
          </h2>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
          {tabs.map((tab) => (
            <button
              key={tab.val}
              onClick={() => setActiveTab(tab.val)}
              className={`text-xs font-bold px-4 py-2 rounded-full transition whitespace-nowrap ${
                activeTab === tab.val
                  ? "bg-amber-800 text-white shadow"
                  : "bg-white text-gray-600 hover:bg-gray-100 border border-gray-200"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Loading State */}
      {isLoading ? (
        <div className="py-24 flex flex-col items-center justify-center">
          <div className="w-12 h-12 border-4 border-amber-600 border-t-transparent rounded-full animate-spin mb-4" />
          <p className="text-sm text-gray-500 font-medium">{t("moreToLove.loadingCurated")}</p>
        </div>
      ) : error ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-gray-100 p-8">
          <p className="text-rose-600 font-semibold">{error}</p>
        </div>
      ) : data.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl border border-gray-100 p-8">
          <h3 className="text-lg font-bold text-gray-800">{t("moreToLove.emptyTitle")}</h3>
          <p className="text-xs text-gray-500 mt-1">{t("moreToLove.emptySubtitle")}</p>
        </div>
      ) : (
        /* Responsive Product Grid */
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 xl:grid-cols-5 gap-4 sm:gap-6">
          {data.map((item) => (
            <Productcard key={item._id} item={item} />
          ))}
        </div>
      )}
    </section>
  );
}

export default Moretolove;