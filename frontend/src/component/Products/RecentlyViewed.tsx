import React, { useState, useEffect } from "react";
import axios from "axios";
import { server } from "../../server";
import { useAppSelector } from "../../hooks";
import { IProduct } from "../../types";
import Productcard from "./Productcard";
import { BsClockHistory } from "react-icons/bs";

const RecentlyViewed: React.FC = () => {
  const { user } = useAppSelector((state) => state.user);
  const [products, setProducts] = useState<IProduct[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    if (!user?._id) return;

    const fetchRecentlyViewed = async () => {
      try {
        setLoading(true);
        const res = await axios.get(`${server}/user/recently-viewed`, {
          withCredentials: true,
        });
        if (res.data?.success) {
          setProducts(res.data.products || []);
        }
      } catch (err) {
        // silent fail
      } finally {
        setLoading(false);
      }
    };

    fetchRecentlyViewed();
  }, [user?._id]);

  if (!user || products.length === 0 || loading) return null;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 my-14">
      <div className="flex items-center gap-2 mb-6 pb-3 border-b border-stone-200">
        <div className="w-8 h-8 rounded-full bg-amber-100 text-amber-900 flex items-center justify-center text-sm">
          <BsClockHistory />
        </div>
        <div>
          <h3 className="text-lg sm:text-xl font-bold font-serif text-stone-900 tracking-tight">
            Recently Viewed by You
          </h3>
          <p className="text-xs text-stone-500">
            Pick up right where you left off
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-5">
        {products.slice(0, 5).map((item) => (
          <Productcard key={item._id} item={item} />
        ))}
      </div>
    </div>
  );
};

export default RecentlyViewed;
