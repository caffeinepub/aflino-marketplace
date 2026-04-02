import InstallPWAButton from "@/components/InstallPWAButton";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import { Button } from "@/components/ui/button";
import { useGeoLocation } from "@/context/GeoLocationContext";
import { useHomepageManager } from "@/context/HomepageManagerContext";
import { useTranslation } from "@/context/I18nContext";
import { useWishlist } from "@/context/WishlistContext";
import { PRODUCTS } from "@/data/products";
import {
  Camera,
  ChevronDown,
  Heart,
  MapPin,
  Menu,
  Mic,
  Navigation,
  Search,
  SlidersHorizontal,
  User,
  X,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useRef, useState } from "react";

interface HeaderProps {
  onLoginClick: () => void;
  onRegisterClick: () => void;
  onAffiliateClick?: () => void;
  onWishlistClick?: () => void;
}

const navLinks = [
  { labelKey: "nav.home", href: "#home" },
  { labelKey: "nav.allProducts", href: "#products" },
];

function SearchBox({
  value,
  onChange,
  placeholder,
  ocid,
  scrolledDown,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  ocid: string;
  scrolledDown?: boolean;
}) {
  const [show, setShow] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);

  const suggestions =
    value.trim().length >= 2
      ? PRODUCTS.filter(
          (p) =>
            p.title.toLowerCase().includes(value.toLowerCase()) ||
            p.seller.toLowerCase().includes(value.toLowerCase()),
        ).slice(0, 5)
      : [];

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) {
        setShow(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const borderColor = scrolledDown ? "#e5e7eb" : "#006AFF";
  const iconColor = scrolledDown ? "#9ca3af" : "#006AFF";

  return (
    <div ref={wrapRef} className="relative w-full">
      <div
        className="flex items-center gap-2 rounded-full px-4 py-2 bg-white border-2 transition-colors duration-200"
        style={{ borderColor }}
      >
        <Search
          className="w-4 h-4 flex-shrink-0 transition-colors duration-200"
          style={{ color: iconColor }}
        />
        <input
          type="text"
          placeholder={placeholder}
          value={value}
          onChange={(e) => {
            onChange(e.target.value);
            setShow(true);
          }}
          onFocus={() => setShow(true)}
          className="flex-1 text-sm bg-transparent outline-none text-gray-700 placeholder-gray-400 min-w-0"
          data-ocid={ocid}
        />
        <button
          type="button"
          className="flex-shrink-0 p-1 rounded-full hover:bg-blue-50 transition-colors"
          aria-label="Voice search"
        >
          <Mic
            className="w-4 h-4 transition-colors duration-200"
            style={{ color: iconColor }}
          />
        </button>
        <button
          type="button"
          className="flex-shrink-0 p-1 rounded-full hover:bg-blue-50 transition-colors"
          aria-label="Image search"
        >
          <Camera
            className="w-4 h-4 transition-colors duration-200"
            style={{ color: iconColor }}
          />
        </button>
      </div>

      <AnimatePresence>
        {show && suggestions.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.15 }}
            className="absolute top-full left-0 right-0 mt-1 bg-white rounded-xl shadow-lg border border-gray-100 border-t-2 z-50 overflow-hidden"
            style={{ borderTopColor: "#006AFF" }}
            data-ocid="header.search.popover"
          >
            {suggestions.map((product) => (
              <button
                key={product.id}
                type="button"
                className="w-full px-4 py-2.5 flex items-center justify-between hover:bg-blue-50 transition-colors text-left"
                onMouseDown={() => {
                  onChange(product.title);
                  setShow(false);
                }}
              >
                <div>
                  <p className="text-sm font-semibold text-gray-900 leading-tight">
                    {product.title}
                  </p>
                  <p className="text-xs text-gray-400">{product.seller}</p>
                </div>
                <span
                  className="text-sm font-bold flex-shrink-0 ml-3"
                  style={{ color: "#006AFF" }}
                >
                  ₹{product.price.toLocaleString("en-IN")}
                </span>
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function LocationPill() {
  const { t } = useTranslation();
  const { customerState, setCustomerState, requestLocation, indianStates } =
    useGeoLocation();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  return (
    <div ref={ref} className="relative flex-shrink-0">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-1 px-2.5 py-1 rounded-full border text-xs font-medium transition-colors hover:bg-blue-50"
        style={{ borderColor: "#006AFF", color: "#006AFF" }}
        data-ocid="header.location.button"
      >
        <MapPin className="w-3 h-3 flex-shrink-0" />
        <span className="max-w-[80px] truncate">
          {customerState || t("nav.selectLocation")}
        </span>
        <ChevronDown className="w-3 h-3 flex-shrink-0" />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.97 }}
            transition={{ duration: 0.15 }}
            className="absolute top-full right-0 mt-1.5 w-56 bg-white rounded-xl shadow-xl border border-gray-100 z-50 overflow-hidden"
            data-ocid="header.location.popover"
          >
            <div className="p-1">
              <button
                type="button"
                onClick={() => {
                  requestLocation();
                  setOpen(false);
                }}
                className="w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold rounded-lg hover:bg-blue-50 transition-colors text-left"
                style={{ color: "#006AFF" }}
                data-ocid="header.location.use_my_location.button"
              >
                <Navigation className="w-3 h-3" />
                {t("nav.useMyLocation")}
              </button>
              <button
                type="button"
                onClick={() => {
                  setCustomerState(null);
                  setOpen(false);
                }}
                className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium rounded-lg hover:bg-gray-50 transition-colors text-left text-gray-600"
                data-ocid="header.location.all_india.button"
              >
                🇮🇳 {t("nav.allIndia")} (GST products)
              </button>
              <div className="h-px bg-gray-100 my-1" />
              <div className="max-h-48 overflow-y-auto">
                {indianStates.map((state) => (
                  <button
                    key={state}
                    type="button"
                    onClick={() => {
                      setCustomerState(state);
                      setOpen(false);
                    }}
                    className={`w-full flex items-center gap-2 px-3 py-1.5 text-xs rounded-lg transition-colors text-left ${
                      customerState === state
                        ? "font-semibold"
                        : "text-gray-700 hover:bg-gray-50"
                    }`}
                    style={
                      customerState === state
                        ? { color: "#006AFF", backgroundColor: "#EEF4FF" }
                        : {}
                    }
                  >
                    {customerState === state && (
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-500 flex-shrink-0" />
                    )}
                    {state}
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function CategoryCarousel() {
  const [selectedCategory, setSelectedCategory] = useState("all");
  const scrollRef = useRef<HTMLDivElement>(null);
  const { categories } = useHomepageManager();

  const allPill = {
    id: "all",
    label: "All",
    iconUrl: undefined as string | undefined,
    link: undefined as string | undefined,
  };
  const pills = [
    allPill,
    ...categories.map((c) => ({
      id: c.id,
      label: c.label,
      iconUrl: c.iconUrl || c.imageUrl,
      link: c.link,
    })),
  ];

  return (
    <div style={{ backgroundColor: "white" }}>
      <div className="max-w-[1200px] mx-auto px-4">
        <div
          ref={scrollRef}
          className="flex items-center overflow-x-auto py-2 gap-2 no-scrollbar"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          {pills.map((cat) => {
            const isSelected = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => {
                  setSelectedCategory(cat.id);
                  window.dispatchEvent(
                    new CustomEvent("aflino:filterCategory", {
                      detail: cat.label,
                    }),
                  );
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold whitespace-nowrap flex-shrink-0 transition-all duration-200 rounded-full"
                style={{
                  border: "1px solid #0056B3",
                  backgroundColor: isSelected ? "#0056B3" : "transparent",
                  color: isSelected ? "#ffffff" : "#0056B3",
                }}
                data-ocid="nav.tab"
              >
                {cat.iconUrl && (
                  <img
                    src={cat.iconUrl}
                    alt={cat.label}
                    className="w-4 h-4 rounded-full object-cover flex-shrink-0"
                    style={{
                      filter: isSelected ? "brightness(0) invert(1)" : "none",
                    }}
                  />
                )}
                {cat.label}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default function Header({
  onLoginClick,
  onRegisterClick,
  onAffiliateClick,
  onWishlistClick,
}: HeaderProps) {
  const { t } = useTranslation();
  const { wishlistCount } = useWishlist();
  const [activeLink, setActiveLink] = useState("nav.home");
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [mobileSearch, setMobileSearch] = useState("");
  const { customerState, setCustomerState, requestLocation, indianStates } =
    useGeoLocation();
  const [mobilePicker, setMobilePicker] = useState(false);
  const [scrolledDown, setScrolledDown] = useState(false);
  const [scrollingUp, setScrollingUp] = useState(false);
  const lastScrollY = useRef(0);

  useEffect(() => {
    function onScroll() {
      const currentY = window.scrollY;
      setScrolledDown(currentY > 50);
      setScrollingUp(currentY < lastScrollY.current);
      lastScrollY.current = currentY;
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Part 1 and Part 3 are visible when NOT scrolled down, OR when scrolling back up
  const showTopParts = !scrolledDown || scrollingUp;

  function openFilters() {
    setMobileOpen(false);
    window.dispatchEvent(new Event("aflino:openFilters"));
  }

  return (
    <header
      className="fixed top-0 left-0 right-0 z-50 bg-white shadow-sm"
      style={{ borderBottom: showTopParts ? "1px solid #e5e7eb" : "none" }}
    >
      {/* Part 1: Logo + Nav — fades out on scroll down */}
      <AnimatePresence initial={false}>
        {showTopParts && (
          <motion.div
            key="top-row"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.22 }}
            className="overflow-hidden"
          >
            <div className="max-w-[1200px] mx-auto px-4 sm:px-6">
              <div className="flex items-center gap-3 h-[52px]">
                {/* Logo */}
                <a
                  href="#home"
                  className="flex-shrink-0 flex items-center"
                  data-ocid="nav.link"
                >
                  <span className="text-2xl font-bold tracking-tight">
                    <span style={{ color: "#006AFF" }}>AFL</span>
                    <span style={{ color: "#FF1B8D" }}>INO</span>
                  </span>
                </a>

                {/* Desktop Nav */}
                <nav className="hidden md:flex items-center gap-1 ml-2">
                  {navLinks.map((link) => (
                    <a
                      key={link.labelKey}
                      href={link.href}
                      data-ocid="nav.link"
                      onClick={() => setActiveLink(link.labelKey)}
                      className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors relative ${
                        activeLink === link.labelKey
                          ? "text-primary"
                          : "text-gray-700 hover:text-primary hover:bg-blue-50"
                      }`}
                    >
                      {t(link.labelKey)}
                      {activeLink === link.labelKey && (
                        <span className="absolute bottom-0 left-3 right-3 h-0.5 bg-primary rounded-full" />
                      )}
                    </a>
                  ))}
                </nav>

                <div className="flex-1" />

                {/* Location pill - desktop */}
                <div className="hidden md:block">
                  <LocationPill />
                </div>

                {/* Wishlist icon - desktop */}
                <div className="hidden md:flex items-center">
                  <button
                    type="button"
                    onClick={onWishlistClick}
                    className="relative p-2 text-gray-500 hover:text-primary transition-colors rounded-full hover:bg-blue-50"
                    aria-label="Wishlist"
                    data-ocid="header.wishlist.button"
                  >
                    <Heart className="w-5 h-5" />
                    {wishlistCount > 0 && (
                      <span
                        className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full text-[10px] font-bold text-white flex items-center justify-center"
                        style={{ backgroundColor: "#EC008C" }}
                      >
                        {wishlistCount > 9 ? "9+" : wishlistCount}
                      </span>
                    )}
                  </button>
                </div>

                {/* Install PWA Button - desktop (between Language Switcher and Auth) */}
                <div className="hidden md:flex items-center">
                  <InstallPWAButton />
                </div>

                {/* Language Switcher — between Wishlist and Auth (Snapdeal style) */}
                <div className="hidden md:block">
                  <LanguageSwitcher />
                </div>

                {/* Auth Buttons */}
                <div className="hidden md:flex items-center gap-2 flex-shrink-0">
                  <Button
                    type="button"
                    onClick={onLoginClick}
                    className="rounded-full px-5 h-8 text-sm font-semibold text-white"
                    style={{ backgroundColor: "#006AFF" }}
                    data-ocid="header.login.button"
                  >
                    {t("nav.login")}
                  </Button>
                  <Button
                    type="button"
                    onClick={onRegisterClick}
                    className="rounded-full px-5 h-8 text-sm font-semibold text-white border-0"
                    style={{ backgroundColor: "#FF1B8D" }}
                    data-ocid="header.register.button"
                  >
                    {t("nav.register")}
                  </Button>
                  {onAffiliateClick && (
                    <Button
                      type="button"
                      onClick={onAffiliateClick}
                      variant="outline"
                      className="rounded-full px-5 h-8 text-sm font-semibold border-blue-200 hidden lg:inline-flex"
                      style={{ color: "#006AFF" }}
                      data-ocid="header.affiliate.button"
                    >
                      Affiliate
                    </Button>
                  )}
                </div>

                {/* Mobile: icons + hamburger */}
                <div className="flex md:hidden items-center gap-1">
                  <button
                    type="button"
                    onClick={onWishlistClick}
                    className="relative p-1.5 text-gray-500"
                    aria-label="Wishlist"
                    data-ocid="header.wishlist.mobile.button"
                  >
                    <Heart className="w-5 h-5" />
                    {wishlistCount > 0 && (
                      <span
                        className="absolute top-0 right-0 w-3.5 h-3.5 rounded-full text-[9px] font-bold text-white flex items-center justify-center"
                        style={{ backgroundColor: "#EC008C" }}
                      >
                        {wishlistCount > 9 ? "9+" : wishlistCount}
                      </span>
                    )}
                  </button>
                  <button
                    type="button"
                    className="p-1.5 text-gray-700"
                    onClick={() => setMobileOpen(!mobileOpen)}
                    aria-label="Toggle menu"
                    data-ocid="header.menu.toggle"
                  >
                    {mobileOpen ? (
                      <X className="w-6 h-6" />
                    ) : (
                      <Menu className="w-6 h-6" />
                    )}
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Part 2: Search bar — always visible, sticky at top when scrolled */}
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 py-2">
        <SearchBox
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder={t("nav.search")}
          ocid="header.search_input"
          scrolledDown={scrolledDown && !scrollingUp}
        />
      </div>

      {/* Part 3: Category Carousel — hidden when scrolled down */}
      <AnimatePresence initial={false}>
        {showTopParts && (
          <motion.div
            key="category-row"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.22 }}
            className="overflow-hidden"
          >
            <CategoryCarousel />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
            className="md:hidden bg-white border-t border-gray-100 px-4 py-3 flex flex-col gap-3 shadow-lg"
          >
            <div className="mb-1">
              <SearchBox
                value={mobileSearch}
                onChange={setMobileSearch}
                placeholder={t("nav.searchMobile")}
                ocid="mobile.search_input"
              />
            </div>

            {/* Mobile Location Picker */}
            <div className="flex flex-col gap-1">
              <button
                type="button"
                onClick={() => setMobilePicker((o) => !o)}
                className="flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-lg border transition-colors text-left"
                style={{ borderColor: "#006AFF", color: "#006AFF" }}
                data-ocid="mobile.location.button"
              >
                <MapPin className="w-4 h-4" />
                {customerState || t("nav.selectLocation")}
                <ChevronDown className="w-3 h-3 ml-auto" />
              </button>
              <AnimatePresence>
                {mobilePicker && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="bg-gray-50 rounded-lg p-2 flex flex-col gap-0.5 max-h-48 overflow-y-auto">
                      <button
                        type="button"
                        onClick={() => {
                          requestLocation();
                          setMobilePicker(false);
                          setMobileOpen(false);
                        }}
                        className="flex items-center gap-2 px-2 py-1.5 text-xs font-semibold rounded hover:bg-blue-50 text-left"
                        style={{ color: "#006AFF" }}
                      >
                        <Navigation className="w-3 h-3" />{" "}
                        {t("nav.useMyLocation")}
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setCustomerState(null);
                          setMobilePicker(false);
                        }}
                        className="flex items-center gap-2 px-2 py-1.5 text-xs font-medium rounded hover:bg-gray-100 text-left text-gray-600"
                      >
                        🇮🇳 {t("nav.allIndia")}
                      </button>
                      <div className="h-px bg-gray-200 my-0.5" />
                      {indianStates.map((state) => (
                        <button
                          key={state}
                          type="button"
                          onClick={() => {
                            setCustomerState(state);
                            setMobilePicker(false);
                          }}
                          className={`px-2 py-1.5 text-xs rounded text-left transition-colors ${
                            customerState === state
                              ? "font-semibold"
                              : "text-gray-700 hover:bg-gray-100"
                          }`}
                          style={
                            customerState === state
                              ? {
                                  color: "#006AFF",
                                  backgroundColor: "#EEF4FF",
                                }
                              : {}
                          }
                        >
                          {state}
                        </button>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Language Switcher - mobile */}
            <div className="rounded-lg border border-gray-100 overflow-hidden">
              <LanguageSwitcher compact />
            </div>

            {navLinks.map((link) => (
              <a
                key={link.labelKey}
                href={link.href}
                data-ocid="nav.link"
                onClick={() => {
                  setActiveLink(link.labelKey);
                  setMobileOpen(false);
                }}
                className={`px-3 py-2 text-sm font-medium rounded-lg ${
                  activeLink === link.labelKey
                    ? "text-primary bg-blue-50"
                    : "text-gray-700"
                }`}
              >
                {t(link.labelKey)}
              </a>
            ))}

            {/* Filters link in mobile menu */}
            <button
              type="button"
              onClick={openFilters}
              className="flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-lg text-gray-700 hover:bg-blue-50 hover:text-[#006AFF] transition-colors text-left"
              data-ocid="mobile.filters.button"
            >
              <SlidersHorizontal className="w-4 h-4" />
              {t("nav.filters")}
            </button>

            {/* Install PWA - mobile full width */}
            <div className="pt-1">
              <InstallPWAButton fullWidth />
            </div>

            <div className="flex gap-2 pt-1">
              <Button
                type="button"
                onClick={() => {
                  onLoginClick();
                  setMobileOpen(false);
                }}
                className="flex-1 rounded-full h-9 text-sm font-semibold text-white"
                style={{ backgroundColor: "#006AFF" }}
                data-ocid="mobile.login.button"
              >
                {t("nav.login")}
              </Button>
              <Button
                type="button"
                onClick={() => {
                  onRegisterClick();
                  setMobileOpen(false);
                }}
                className="flex-1 rounded-full h-9 text-sm font-semibold text-white border-0"
                style={{ backgroundColor: "#FF1B8D" }}
                data-ocid="mobile.register.button"
              >
                {t("nav.register")}
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
