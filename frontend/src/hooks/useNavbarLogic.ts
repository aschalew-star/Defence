import React, { useState, useEffect, useRef, useMemo, ChangeEvent, KeyboardEvent } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import { server } from "../server";
import { useAppSelector, useCurrency } from "./index";
import { IProduct } from "../types";

export interface UseNavbarLogicReturn {
  user: any;
  seller: any;
  cart: any[];
  wish: any[];
  totalCartCount: number;
  totalWishCount: number;
  search: string;
  setSearch: (val: string) => void;
  searchData: IProduct[];
  setSearchData: (data: IProduct[]) => void;
  searchRef: React.RefObject<HTMLDivElement | null>;
  userDropdownRef: React.RefObject<HTMLDivElement | null>;
  mobileMenuOpen: boolean;
  setMobileMenuOpen: (val: boolean | ((prev: boolean) => boolean)) => void;
  mobileSearchOpen: boolean;
  setMobileSearchOpen: (val: boolean | ((prev: boolean) => boolean)) => void;
  userDropdownOpen: boolean;
  setUserDropdownOpen: (val: boolean | ((prev: boolean) => boolean)) => void;
  currency: string;
  toggleCurrency: () => void;
  handleSearch: (e: ChangeEvent<HTMLInputElement>) => void;
  handleSearchKeyDown: (e: KeyboardEvent<HTMLInputElement>) => void;
  handleLogout: () => Promise<void>;
  navigate: (path: string) => void;
  pathname: string;
}

export const useNavbarLogic = (): UseNavbarLogicReturn => {
  const { cart } = useAppSelector((state) => state.Cart);
  const { wish } = useAppSelector((state) => state.Wish);
  const { user } = useAppSelector((state) => state.user);
  const { seller } = useAppSelector((state) => state.seller);

  const [search, setSearch] = useState<string>("");
  const [searchData, setSearchData] = useState<IProduct[]>([]);
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState<boolean>(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState<boolean>(false);
  const { currency, toggleCurrency } = useCurrency();

  const searchRef = useRef<HTMLDivElement | null>(null);
  const userDropdownRef = useRef<HTMLDivElement | null>(null);
  const debounceRef = useRef<any>(null);
  const navigate = useNavigate();
  const location = useLocation();

  const handleSearch = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearch(value);

    if (!value.trim()) {
      setSearchData([]);
      if (debounceRef.current) clearTimeout(debounceRef.current);
      return;
    }

    if (debounceRef.current) clearTimeout(debounceRef.current);

    debounceRef.current = setTimeout(async () => {
      try {
        const query = encodeURIComponent(value.trim());
        const { data } = await axios.get(
          `${server}/product/get-all-products?keyword=${query}&limit=6`
        );
        setSearchData(data.products || []);
      } catch (err: any) {
        console.error("Live search failed:", err);
      }
    }, 300);
  };

  const handleSearchKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && search.trim()) {
      e.preventDefault();
      setSearchData([]);
      setMobileMenuOpen(false);
      setMobileSearchOpen(false);
      navigate(`/products?keyword=${encodeURIComponent(search.trim())}`);
    }
  };

  // Close search dropdown and user profile menu on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setSearchData([]);
      }
      if (
        userDropdownRef.current &&
        !userDropdownRef.current.contains(e.target as Node)
      ) {
        setUserDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const totalCartCount = useMemo(
    () => (cart || []).reduce((acc: number, item: any) => acc + (item.qty || 1), 0),
    [cart]
  );
  const totalWishCount = useMemo(() => (wish || []).length, [wish]);

  const handleLogout = async () => {
    try {
      await axios.get(`${server}/user/logout`, { withCredentials: true });
      window.location.reload();
    } catch (err: any) {
      console.error(err);
    }
  };

  return {
    user,
    seller,
    cart: cart || [],
    wish: wish || [],
    totalCartCount,
    totalWishCount,
    search,
    setSearch,
    searchData,
    setSearchData,
    searchRef,
    userDropdownRef,
    mobileMenuOpen,
    setMobileMenuOpen,
    mobileSearchOpen,
    setMobileSearchOpen,
    userDropdownOpen,
    setUserDropdownOpen,
    currency,
    toggleCurrency,
    handleSearch,
    handleSearchKeyDown,
    handleLogout,
    navigate,
    pathname: location.pathname,
  };
};

export default useNavbarLogic;
