import { usePWAInstall } from "@/hooks/usePWAInstall";
import { Download, Facebook, Instagram, Twitter, Youtube } from "lucide-react";

const currentYear = new Date().getFullYear();

const socialLinks = [
  { Icon: Facebook, label: "Facebook" },
  { Icon: Twitter, label: "Twitter" },
  { Icon: Instagram, label: "Instagram" },
  { Icon: Youtube, label: "Youtube" },
];

interface FooterNavItem {
  label: string;
  action: "href" | "navigate";
  href?: string;
  view?: string;
}

type FooterNavSection = Record<string, FooterNavItem[]>;

interface FooterProps {
  onNavigate?: (view: string) => void;
  onAdvertiseClick?: () => void;
}

export default function Footer({ onNavigate, onAdvertiseClick }: FooterProps) {
  const { canInstall, isIOS, triggerInstall } = usePWAInstall();
  const installOpacity = canInstall || isIOS ? "" : " opacity-70";
  const hostname =
    typeof window !== "undefined" ? window.location.hostname : "";

  const footerSections: FooterNavSection = {
    Business: [
      { label: "Sell on AFLINO", action: "navigate", view: "seller-register" },
      {
        label: "Affiliate Program",
        action: "navigate",
        view: "affiliate-landing",
      },
      { label: "Advertise with Us", action: "navigate", view: "advertise" },
      { label: "Brand Solutions", action: "navigate", view: "advertise" },
      { label: "API Partners", action: "navigate", view: "api-partners" },
    ],
    Explore: [
      { label: "Home", action: "navigate", view: "home" },
      { label: "All Products", action: "navigate", view: "home" },
      { label: "Categories", action: "navigate", view: "home" },
      { label: "Top Vendors", action: "navigate", view: "home" },
      { label: "Deals & Offers", action: "navigate", view: "home" },
    ],
    Account: [
      { label: "Login", action: "navigate", view: "login" },
      { label: "Register", action: "navigate", view: "seller-register" },
      { label: "My Orders", action: "navigate", view: "home" },
      { label: "Wishlist", action: "navigate", view: "wishlist" },
      { label: "Profile", action: "navigate", view: "home" },
    ],
    Support: [
      { label: "Help Center", action: "navigate", view: "home" },
      { label: "Track Order", action: "navigate", view: "home" },
      { label: "Returns", action: "navigate", view: "home" },
      { label: "Contact Us", action: "navigate", view: "home" },
      { label: "FAQ", action: "navigate", view: "home" },
    ],
    Legal: [
      { label: "Privacy Policy", action: "navigate", view: "home" },
      { label: "Terms of Service", action: "navigate", view: "home" },
      { label: "Cookie Policy", action: "navigate", view: "home" },
      { label: "Sitemap", action: "navigate", view: "home" },
    ],
  };

  function handleLinkClick(item: FooterNavItem, e: React.MouseEvent) {
    e.preventDefault();
    if (
      item.label === "Advertise with Us" ||
      item.label === "Brand Solutions"
    ) {
      if (onAdvertiseClick) {
        onAdvertiseClick();
        return;
      }
    }
    if (onNavigate && item.view) {
      onNavigate(item.view);
    }
  }

  return (
    <footer className="bg-gray-900 text-gray-400" data-ocid="footer.section">
      <div className="max-w-[1200px] mx-auto px-6 pt-14 pb-8">
        <div className="grid grid-cols-1 md:grid-cols-6 gap-8 mb-10">
          {/* Brand column */}
          <div className="md:col-span-1">
            <div className="text-2xl font-bold mb-4">
              <span style={{ color: "#006AFF" }}>AFL</span>
              <span style={{ color: "#FF1B8D" }}>INO</span>
            </div>
            <p className="text-sm leading-relaxed mb-5">
              Your trusted multi-vendor marketplace. Shop with confidence from
              thousands of verified sellers.
            </p>
            <div className="flex gap-3">
              {socialLinks.map(({ Icon, label }) => (
                <a
                  key={label}
                  href="/"
                  className="w-8 h-8 bg-gray-800 rounded-full flex items-center justify-center hover:bg-primary transition-colors"
                  aria-label={label}
                  data-ocid="footer.link"
                >
                  <Icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Link columns */}
          {Object.entries(footerSections).map(([heading, links]) => (
            <div key={heading}>
              <h4 className="text-white font-semibold text-sm mb-4">
                {heading}
              </h4>
              <ul className="space-y-2.5">
                {links.map((item) => (
                  <li key={item.label}>
                    <a
                      href="/"
                      onClick={(e) => handleLinkClick(item, e)}
                      className="text-sm hover:text-white transition-colors cursor-pointer"
                      data-ocid="footer.link"
                    >
                      {item.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Download App section */}
        <div
          className="bg-gray-800 rounded-2xl p-6 mb-8 text-center"
          data-ocid="footer.panel"
        >
          <p className="text-white font-semibold text-sm mb-4 tracking-wide uppercase">
            Get the App
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              type="button"
              onClick={triggerInstall}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white transition-opacity hover:opacity-90${installOpacity}`}
              style={{ backgroundColor: "#006AFF" }}
              data-ocid="footer.primary_button"
              aria-label="Download AFLINO App"
            >
              <Download className="w-4 h-4" />
              Download AFLINO App
            </button>
            <button
              type="button"
              onClick={triggerInstall}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white transition-opacity hover:opacity-90${installOpacity}`}
              style={{ backgroundColor: "#EC008C" }}
              data-ocid="footer.secondary_button"
              aria-label="Download AFLINO Seller"
            >
              <Download className="w-4 h-4" />
              Download AFLINO Seller
            </button>
          </div>
        </div>

        {/* Bottom strip */}
        <div className="border-t border-gray-800 pt-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-xs text-gray-500">
            © {currentYear}. Built with ❤️ using{" "}
            <a
              href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(hostname)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-400 hover:text-white underline"
            >
              caffeine.ai
            </a>
          </p>
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-500 mr-1">We Accept:</span>
            <div className="flex gap-2">
              <div className="w-10 h-6 bg-gray-800 rounded flex items-center justify-center text-xs font-bold text-gray-300">
                VISA
              </div>
              <div className="w-10 h-6 bg-gray-800 rounded flex items-center justify-center text-xs font-bold text-gray-300">
                MC
              </div>
              <div className="w-10 h-6 bg-gray-800 rounded flex items-center justify-center text-xs font-bold text-gray-300">
                PayPal
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
