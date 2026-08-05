/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { User, ShoppingCart, X, Search, TrendingUp, Clock } from "lucide-react";
import {
  allOffers,
  becomeAseller,
  exploreNickhub,
  GooglePaly,
  searchIcon,
  trackOrder,
} from "@/assets/icons/navbar/navbarIcons";
import Logo from "@/components/ui/Logo/Logo";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { useGetAllCategoryQuery } from "@/redux/features/category/categorySlice";
import {
  useGetAllCartQuery,
  useGetAllProductQuery,
} from "@/redux/features/product/productApi";
import CategoriesNav from "./CategoriesNav";
import { LanguageSwitcher } from "@/lib/tran/language-switcher";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { logout, selectCurrentUser } from "@/redux/features/auth/authSlice";
import Image from "next/image";
import Swal from "sweetalert2";
import CurrencySelector from "@/components/CurrencySelector";
import { usePlatformCurrencies } from "@/utils/hooks/Useplatformcurrencies";
import { useAuth } from "@/lib/skipIfUnauthenticated";

// ─────────────────────────────────────────────────────────────
// TYPES (strict — no `any`)
interface Product {
  id: string;
  name: string;
  price?: number;
  image?: string;
  category?: string;
}

interface User {
  fullName: string;
  role?: string;
}

// Constants
const DEBOUNCE_DELAY = 300;
const MIN_SEARCH_LENGTH = 2;
const MAX_RECENT_SEARCHES = 5;
const RECENT_SEARCHES_KEY = "recentSearches";

// ─────────────────────────────────────────────────────────────
// Cart Icon
function CartIcon() {
  const { skip } = useAuth();
  const { data, isLoading } = useGetAllCartQuery({}, { skip });

  if (isLoading) {
    return (
      <div className="p-2 rounded-full hover:bg-gray-100 transition-colors">
        <ShoppingCart className="w-6 h-6 opacity-50" />
      </div>
    );
  }

  const totalItems = data?.result?.length || 0;

  return (
    <Link
      href="/cart"
      className="relative p-2 rounded-full hover:bg-gray-100 transition-colors"
    >
      <ShoppingCart className="w-6 h-6" />
      {totalItems > 0 && (
        <span className="absolute md:-top-1 top-3 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-medium">
          {totalItems > 99 ? "99+" : totalItems}
        </span>
      )}
    </Link>
  );
}

// ─────────────────────────────────────────────────────────────
// User Menu — UPDATED with requested role-based dashboard logic
function UserMenu({
  users,
  isOpen,
  onToggle,
  onLogout,
  router,
}: {
  users: User | null;
  isOpen: boolean;
  onToggle: () => void;
  onLogout: () => void;
  router: ReturnType<typeof useRouter>;
}) {
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        onToggle();
      }
    };

    if (isOpen) {
      document.addEventListener("click", handleClickOutside);
    }

    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, [isOpen, onToggle]);

  if (!isOpen) return null;

  return (
    <div
      ref={menuRef}
      className="absolute right-0 mt-2 w-48 bg-white border rounded shadow-lg z-10 font-nun font-medium"
    >
      <div className="py-2">
        {users ? (
          <>
            <div className="px-4 py-2 cursor-default">
              Hello, {users.fullName.split(" ")[0]}!
            </div>

            <button
              type="button"
              className="w-full text-left px-4 py-2 hover:bg-gray-100 cursor-pointer"
              onClick={(e) => {
                e.stopPropagation();
                router.push("/account/my-orders");
                onToggle();
              }}
            >
              My Orders
            </button>

            <button
              type="button"
              className="w-full text-left px-4 py-2 hover:bg-gray-100 cursor-pointer"
              onClick={(e) => {
                e.stopPropagation();
                router.push("/account/my-orders");
                onToggle();
              }}
            >
              My Account
            </button>

            {/* UPDATED: Role-based Dashboard button */}
            {(users.role === "ALL" ||
              users.role === "SELLER" ||
              users.role === "ADMIN") && (
              <button
                type="button"
                className="w-full text-left px-4 py-2 hover:bg-gray-100 cursor-pointer"
                onClick={(e) => {
                  e.stopPropagation();

                  if (users.role === "ADMIN") {
                    router.push(
                      "/dashboard/platform-management/platform-settings",
                    );
                  } else {
                    router.push("/dashboard");
                  }

                  onToggle();
                }}
              >
                {users.role === "ADMIN"
                  ? "Platform Management"
                  : "Seller Dashboard"}
              </button>
            )}

            <div className="border-t" />

            <button
              type="button"
              className="w-full text-left px-4 py-2 hover:bg-gray-100 cursor-pointer font-medium text-red-600"
              onClick={(e) => {
                e.stopPropagation();
                onLogout();
              }}
            >
              Sign Out
            </button>
          </>
        ) : (
          <>
            <div className="flex flex-col px-2">
              <Link
                href="/auth/login"
                className="block px-4 py-2 hover:bg-gray-100 cursor-pointer"
                onClick={(e) => {
                  e.stopPropagation();
                  onToggle();
                }}
              >
                Sign In
              </Link>

              <Link
                href="/auth/register"
                className="block px-4 py-2 hover:bg-gray-100 cursor-pointer"
                onClick={(e) => {
                  e.stopPropagation();
                  onToggle();
                }}
              >
                Register
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Enhanced Search Bar (unchanged — already fixed)
function EnhancedSearchBar() {
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(-1);

  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  // Load recent searches
  useEffect(() => {
    const saved = localStorage.getItem(RECENT_SEARCHES_KEY);
    if (saved) {
      try {
        setRecentSearches(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to load recent searches", e);
      }
    }
  }, []);

  // Debounce
  useEffect(() => {
    const timeout = setTimeout(() => {
      setDebouncedQuery(searchQuery.trim());
    }, DEBOUNCE_DELAY);
    return () => clearTimeout(timeout);
  }, [searchQuery]);

  // RTK Query with skip
  const { data: productResponse, isLoading: productsLoading } =
    useGetAllProductQuery(
      { search: debouncedQuery },
      {
        skip: debouncedQuery.length < MIN_SEARCH_LENGTH,
      },
    );

  const products: Product[] = productResponse?.result ?? [];

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        searchRef.current &&
        !searchRef.current.contains(event.target as Node)
      ) {
        setShowDropdown(false);
        setSelectedIndex(-1);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Save recent
  const saveToRecentSearches = useCallback((query: string) => {
    if (!query.trim()) return;
    setRecentSearches((prev) => {
      const filtered = prev.filter((item) => item !== query);
      const updated = [query, ...filtered].slice(0, MAX_RECENT_SEARCHES);
      localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(updated));
      return updated;
    });
  }, []);

  const clearRecentSearches = useCallback(() => {
    setRecentSearches([]);
    localStorage.removeItem(RECENT_SEARCHES_KEY);
  }, []);

  // Search submission
  const handleSearch = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      if (!searchQuery.trim()) return;
      saveToRecentSearches(searchQuery);
      setShowDropdown(false);
      setSearchQuery("");
      router.push(`/search?query=${encodeURIComponent(searchQuery)}`);
    },
    [searchQuery, router, saveToRecentSearches],
  );

  // Product click
  const handleSelectProduct = useCallback(
    (productId: string, productName: string) => {
      saveToRecentSearches(productName);
      setShowDropdown(false);
      setSearchQuery("");
      setSelectedIndex(-1);
      router.push(`/product/${productId}`);
    },
    [router, saveToRecentSearches],
  );

  // Recent click
  const handleRecentSearchClick = useCallback(
    (query: string) => {
      setSearchQuery(query);
      setShowDropdown(false);
      router.push(`/search?query=${encodeURIComponent(query)}`);
    },
    [router],
  );

  // Keyboard navigation
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (!showDropdown) return;

      const showRecentSection =
        searchQuery.length < MIN_SEARCH_LENGTH && recentSearches.length > 0;
      const recentCount = showRecentSection ? recentSearches.length : 0;
      const totalItems = recentCount + products.length;

      switch (e.key) {
        case "ArrowDown":
          e.preventDefault();
          setSelectedIndex((prev) => (prev < totalItems - 1 ? prev + 1 : prev));
          break;

        case "ArrowUp":
          e.preventDefault();
          setSelectedIndex((prev) => (prev > 0 ? prev - 1 : -1));
          break;

        case "Enter":
          e.preventDefault();
          if (selectedIndex >= 0) {
            if (selectedIndex < recentCount) {
              handleRecentSearchClick(recentSearches[selectedIndex]);
            } else {
              const productIndex = selectedIndex - recentCount;
              const product = products[productIndex];
              if (product) handleSelectProduct(product.id, product.name);
            }
          } else {
            handleSearch(e);
          }
          break;

        case "Escape":
          setShowDropdown(false);
          setSelectedIndex(-1);
          inputRef.current?.blur();
          break;
      }
    },
    [
      showDropdown,
      searchQuery.length,
      recentSearches,
      products,
      selectedIndex,
      handleRecentSearchClick,
      handleSelectProduct,
      handleSearch,
    ],
  );

  const showRecentSection =
    recentSearches.length > 0 && searchQuery.length < MIN_SEARCH_LENGTH;
  const hasSearchResults = searchQuery.length >= MIN_SEARCH_LENGTH;
  const shouldShowDropdown =
    showDropdown && (showRecentSection || hasSearchResults);

  return (
    <div className="relative flex-1 max-w-xl md:mx-4" ref={searchRef}>
      <form
        onSubmit={handleSearch}
        className="flex items-center border rounded-full overflow-hidden bg-white shadow-sm"
      >
        <input
          ref={inputRef}
          type="text"
          placeholder="Search products, or categories..."
          className="w-full px-4 py-2 outline-none text-sm"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onFocus={() => setShowDropdown(true)}
          onKeyDown={handleKeyDown}
          autoComplete="off"
        />

        {searchQuery && (
          <button
            type="button"
            className="px-2 hover:bg-gray-100 rounded-full transition-colors"
            onClick={() => {
              setSearchQuery("");
              setDebouncedQuery("");
              inputRef.current?.focus();
            }}
            aria-label="Clear search"
          >
            <X className="w-4 h-4 text-gray-500" />
          </button>
        )}

        <button
          type="submit"
          className="bg-orange-500 text-white hover:bg-orange-600 px-4 p-1.5 rounded-full mr-2 transition-colors"
          aria-label="Search"
        >
          {searchIcon}
        </button>
      </form>

      {/* Dropdown */}
      {shouldShowDropdown && (
        <div className="absolute w-full bg-white border mt-2 max-h-96 overflow-y-auto z-50 shadow-lg rounded-lg">
          {/* Recent Searches */}
          {showRecentSection && (
            <div className="p-2">
              <div className="flex items-center justify-between px-2 py-1">
                <div className="flex items-center gap-2 text-xs font-medium text-gray-500 uppercase">
                  <Clock className="w-4 h-4" />
                  Recent Searches
                </div>
                <button
                  onClick={clearRecentSearches}
                  className="text-xs text-blue-600 hover:text-blue-800"
                >
                  Clear All
                </button>
              </div>
              {recentSearches.map((query, index) => (
                <div
                  key={index}
                  onClick={() => handleRecentSearchClick(query)}
                  className={`flex items-center gap-2 px-3 py-2 cursor-pointer rounded transition-colors ${
                    selectedIndex === index ? "bg-blue-50" : "hover:bg-gray-50"
                  }`}
                >
                  <Search className="w-4 h-4 text-gray-400" />
                  <span className="text-sm">{query}</span>
                </div>
              ))}
            </div>
          )}

          {/* Loading */}
          {productsLoading && hasSearchResults && (
            <div className="p-4 text-center text-gray-500">
              <div className="flex items-center justify-center gap-2">
                <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                Searching...
              </div>
            </div>
          )}

          {/* Products */}
          {!productsLoading && products.length > 0 && hasSearchResults && (
            <div className="p-2">
              <div className="flex items-center gap-2 px-2 py-1 text-xs font-medium text-gray-500 uppercase">
                <TrendingUp className="w-4 h-4" />
                Products ({products.length})
              </div>
              {products.map((product, index) => {
                const globalIndex = showRecentSection
                  ? recentSearches.length + index
                  : index;
                return (
                  <div
                    key={product.id}
                    onClick={() =>
                      handleSelectProduct(product.id, product.name)
                    }
                    className={`flex items-center gap-3 px-3 py-2 cursor-pointer rounded transition-colors ${
                      selectedIndex === globalIndex
                        ? "bg-blue-50"
                        : "hover:bg-gray-50"
                    }`}
                  >
                    {product.image ? (
                      <Image
                        width={40}
                        height={40}
                        src={product.image}
                        alt={product.name}
                        className="w-10 h-10 object-cover rounded"
                      />
                    ) : (
                      <div className="w-10 h-10 bg-gray-200 rounded flex items-center justify-center">
                        <Search className="w-5 h-5 text-gray-400" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">
                        {product.name}
                      </p>
                      {product.category && (
                        <p className="text-xs text-gray-500">
                          {product.category}
                        </p>
                      )}
                    </div>
                    {product.price !== undefined && (
                      <p className="text-sm font-semibold text-orange-600">
                        ${product.price.toFixed(2)}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* No Results */}
          {!productsLoading && hasSearchResults && products.length === 0 && (
            <div className="p-8 text-center">
              <Search className="w-12 h-12 text-gray-300 mx-auto mb-2" />
              <p className="text-gray-500 text-sm">No products found</p>
              <p className="text-gray-400 text-xs mt-1">
                Try different keywords
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// MAIN NAVBAR (with fixed handleLogout)
export default function NavBar() {
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const dispatch = useAppDispatch();
  const router = useRouter();
  const pathname = usePathname();
  const { currencyOptions, isLoading: currencyLoading } =
    usePlatformCurrencies();

  const { data, isLoading: categoriesLoading } = useGetAllCategoryQuery({});
  const users = useAppSelector(selectCurrentUser) as User | null;

  const categories = data?.result || [];

  // Simplified — no event needed (stopPropagation handled inside UserMenu)
  const handleLogout = () => {
    dispatch(logout());
    setIsUserMenuOpen(false);
    router.push("/");
  };

  const handleExploreClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    if (users === null) {
      Swal.fire({
        title: "Login to Explore NicheHub",
        html: `
          Thank you for subscribing to our store updates.<br><br>
          <strong>Explore NicheHub fast — login now</strong>
        `,
        icon: "info",
        showCancelButton: true,
        confirmButtonText: "Login",
        cancelButtonText: "Close",
        confirmButtonColor: "#004899",
      }).then((result) => {
        if (result.isConfirmed) router.push("/auth/login");
      });
    } else {
      router.push("/nichehub");
    }
  };

  if (categoriesLoading) {
    return (
      <div className="bg-white shadow-md h-32 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    );
  }

  return (
    <div className="bg-white shadow-[0px_4px_8px_0px_rgba(0,59,121,0.15)]">
      {/* Top Bar */}
      <div className="bg-blue-500 text-white py-2">
        <div className="container lg:px-16 md:px-14 sm:px-10 xl:px-0 mx-auto px-4 flex justify-between flex-wrap sm:flex-nowrap gap-1 sm:gap-4 items-center">
          <div className="flex sm:items-center">
            <Link
              href="/nichehub"
              onClick={handleExploreClick}
              className="flex items-center text-nowrap text-[12px] sm:text-sm lg:text-base cursor-pointer hover:underline gap-1"
            >
              <span>{exploreNickhub}</span>
              Explore NicheHub for getting hottest drops.
            </Link>
          </div>
          <div className="flex items-center gap-1 sm:gap-2 text-[12px] sm:text-sm lg:text-base">
            <Link href="/account/my-orders">
              <div className="flex items-center text-nowrap cursor-pointer hover:underline gap-1">
                {trackOrder}
                Track your order
              </div>
            </Link>
            <div
              className="flex text-nowrap items-center cursor-pointer hover:underline gap-1"
              onClick={() => router.push("/offers")}
            >
              {allOffers}
              All offers
            </div>
            <Link href="/auth/register">
              <div className="flex text-nowrap items-center cursor-pointer hover:underline gap-1">
                {becomeAseller}
                Become a seller
              </div>
            </Link>
          </div>
        </div>
      </div>

      {/* Main Header */}
      <div>
        <header className="w-full container lg:px-16 md:px-14 sm:px-10 px-4 py-2 xl:px-0 mx-auto">
          <div className="flex flex-wrap gap-2 items-center max-lg:justify-center justify-between mb-2">
            {/* Logo */}
            <div className="flex items-center">
              <div className="text-2xl font-bold text-[#00a5cf] cursor-pointer">
                <Logo />
              </div>
            </div>

            <EnhancedSearchBar />

            {/* Desktop Actions */}
            <div className="hidden lg:block">
              <div className="flex items-center space-x-4">
                <div
                  className="flex items-center cursor-pointer hover:opacity-80 transition-opacity"
                  onClick={() => alert("Download app clicked")}
                >
                  <div className="mr-2">{GooglePaly}</div>
                  <div className="flex flex-col">
                    <span className="text-xs text-gray-500">Download the</span>
                    <span className="text-sm font-medium">Sellapy app</span>
                  </div>
                </div>

                <LanguageSwitcher />
                <CurrencySelector
                  availableCurrencies={currencyOptions}
                  isLoading={currencyLoading}
                />

                <div className="flex items-center space-x-3">
                  <div className="relative">
                    <User
                      className="h-6 w-6 text-gray-600 cursor-pointer hover:text-gray-800"
                      onClick={() => setIsUserMenuOpen((prev) => !prev)}
                    />
                    <UserMenu
                      users={users}
                      isOpen={isUserMenuOpen}
                      onToggle={() => setIsUserMenuOpen(false)}
                      onLogout={handleLogout}
                      router={router}
                    />
                  </div>

                  <CartIcon />
                </div>
              </div>
            </div>
          </div>

          {/* Categories + Mobile */}
          <div className="flex items-center justify-between">
            {pathname === "/account/my-orders" ||
            pathname === "/account/contact-seller" ||
            pathname === "/account/B2B-portal" ||
            pathname.startsWith("/stores/") ||
            pathname.startsWith("/nichehub") ||
            pathname.startsWith("/stores") ? null : (
              <CategoriesNav categories={categories} />
            )}

            {/* Mobile Actions */}
            <div className="lg:hidden w-full">
              <div className="flex items-center justify-between w-full md:gap-2">
                <div
                  className="flex items-center cursor-pointer"
                  onClick={() => alert("Download app clicked")}
                >
                  <div className="flex flex-row items-center md:gap-2">
                    <div className="mr-0 md:mr-2">{GooglePaly}</div>
                    <div className="md:flex hidden flex-col">
                      <span className="md:text-xs text-[10px] text-nowrap text-gray-500">
                        Download the
                      </span>
                      <span className="md:text-sm text-xs font-medium">
                        Sellapy app
                      </span>
                    </div>
                  </div>
                </div>

                <LanguageSwitcher />
                <CurrencySelector
                  availableCurrencies={currencyOptions}
                  isLoading={currencyLoading}
                />

                <div className="flex items-center space-x-3">
                  <div className="relative">
                    <User
                      className="h-6 w-6 text-gray-600 cursor-pointer hover:text-gray-800"
                      onClick={() => setIsUserMenuOpen((prev) => !prev)}
                    />
                    <UserMenu
                      users={users}
                      isOpen={isUserMenuOpen}
                      onToggle={() => setIsUserMenuOpen(false)}
                      onLogout={handleLogout}
                      router={router}
                    />
                  </div>

                  <CartIcon />
                </div>
              </div>
            </div>
          </div>
        </header>
      </div>
    </div>
  );
}
