import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PRODUCTS } from "@/data/products";
import { Heart, Menu, Search, ShoppingCart, X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useRef, useState } from "react";

interface HeaderProps {
  onLoginClick: () => void;
  onRegisterClick: () => void;
}

const navLinks = [
  { label: "Home", href: "#home" },
  { label: "All Products", href: "#products" },
];

function SearchBox({
  value,
  onChange,
  placeholder,
  ocid,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  ocid: string;
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

  return (
    <div ref={wrapRef} className="relative w-full">
      <Input
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={(e) => {
          onChange(e.target.value);
          setShow(true);
        }}
        onFocus={() => setShow(true)}
        className="pl-4 pr-10 py-2 rounded-full bg-gray-50 border-gray-200 text-sm focus:ring-[#006AFF]"
        data-ocid={ocid}
      />
      <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />

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

export default function Header({ onLoginClick, onRegisterClick }: HeaderProps) {
  const [activeLink, setActiveLink] = useState("Home");
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [mobileSearch, setMobileSearch] = useState("");

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-200 shadow-header">
      <div className="max-w-[1200px] mx-auto px-6 h-[72px] flex items-center gap-6">
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
        <nav className="hidden md:flex items-center gap-1 ml-4">
          {navLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              data-ocid="nav.link"
              onClick={() => setActiveLink(link.label)}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors relative ${
                activeLink === link.label
                  ? "text-primary"
                  : "text-gray-700 hover:text-primary hover:bg-blue-50"
              }`}
            >
              {link.label}
              {activeLink === link.label && (
                <span className="absolute bottom-0 left-4 right-4 h-0.5 bg-primary rounded-full" />
              )}
            </a>
          ))}
        </nav>

        {/* Search */}
        <div className="hidden md:flex flex-1 max-w-md">
          <SearchBox
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Search products…"
            ocid="header.search_input"
          />
        </div>

        {/* Icons */}
        <div className="hidden md:flex items-center gap-2 ml-auto">
          <button
            type="button"
            className="p-2 text-gray-500 hover:text-primary transition-colors"
            aria-label="Wishlist"
          >
            <Heart className="w-5 h-5" />
          </button>
          <button
            type="button"
            className="p-2 text-gray-500 hover:text-primary transition-colors"
            aria-label="Cart"
          >
            <ShoppingCart className="w-5 h-5" />
          </button>
        </div>

        {/* Auth Buttons */}
        <div className="hidden md:flex items-center gap-2 flex-shrink-0">
          <Button
            type="button"
            onClick={onLoginClick}
            className="rounded-full px-5 h-9 text-sm font-semibold text-white"
            style={{ backgroundColor: "#006AFF" }}
            data-ocid="header.login.button"
          >
            Login
          </Button>
          <Button
            type="button"
            onClick={onRegisterClick}
            className="rounded-full px-5 h-9 text-sm font-semibold text-white border-0"
            style={{ backgroundColor: "#FF1B8D" }}
            data-ocid="header.register.button"
          >
            Register
          </Button>
        </div>

        {/* Mobile hamburger */}
        <button
          type="button"
          className="md:hidden ml-auto p-2 text-gray-700"
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

      {/* Mobile Drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
            className="md:hidden bg-white border-t border-gray-100 px-6 py-4 flex flex-col gap-3 shadow-lg"
          >
            <SearchBox
              value={mobileSearch}
              onChange={setMobileSearch}
              placeholder="Search products…"
              ocid="mobile.search_input"
            />

            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                data-ocid="nav.link"
                onClick={() => {
                  setActiveLink(link.label);
                  setMobileOpen(false);
                }}
                className={`px-3 py-2 text-sm font-medium rounded-lg ${
                  activeLink === link.label
                    ? "text-primary bg-blue-50"
                    : "text-gray-700"
                }`}
              >
                {link.label}
              </a>
            ))}

            <div className="flex gap-2 pt-2">
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
                Login
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
                Register
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
