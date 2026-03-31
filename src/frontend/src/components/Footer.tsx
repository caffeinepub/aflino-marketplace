import { usePWAInstall } from "@/hooks/usePWAInstall";
import { Download, Facebook, Instagram, Twitter, Youtube } from "lucide-react";

const currentYear = new Date().getFullYear();

const socialLinks = [
  { Icon: Facebook, label: "Facebook" },
  { Icon: Twitter, label: "Twitter" },
  { Icon: Instagram, label: "Instagram" },
  { Icon: Youtube, label: "Youtube" },
];

const footerLinks = {
  Explore: [
    "Home",
    "All Products",
    "Categories",
    "Top Vendors",
    "Deals & Offers",
  ],
  Account: ["Login", "Register", "My Orders", "Wishlist", "Profile"],
  Support: ["Help Center", "Track Order", "Returns", "Contact Us", "FAQ"],
  Legal: ["Privacy Policy", "Terms of Service", "Cookie Policy", "Sitemap"],
};

export default function Footer() {
  const { canInstall, isIOS, triggerInstall } = usePWAInstall();
  const installOpacity = canInstall || isIOS ? "" : " opacity-70";
  const hostname =
    typeof window !== "undefined" ? window.location.hostname : "";

  return (
    <footer className="bg-gray-900 text-gray-400" data-ocid="footer.section">
      <div className="max-w-[1200px] mx-auto px-6 pt-14 pb-8">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-8 mb-10">
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
          {Object.entries(footerLinks).map(([heading, links]) => (
            <div key={heading}>
              <h4 className="text-white font-semibold text-sm mb-4">
                {heading}
              </h4>
              <ul className="space-y-2.5">
                {links.map((link) => (
                  <li key={link}>
                    <a
                      href="/"
                      className="text-sm hover:text-white transition-colors"
                      data-ocid="footer.link"
                    >
                      {link}
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
