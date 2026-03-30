import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import ReactDOM from "react-dom/client";
import App from "./App";
import { InternetIdentityProvider } from "./hooks/useInternetIdentity";
import "./index.css";

BigInt.prototype.toJSON = function () {
  return this.toString();
};

declare global {
  interface BigInt {
    toJSON(): string;
  }
}

// Dynamic manifest injection for dual-PWA identity
(function injectManifest() {
  const params = new URLSearchParams(window.location.search);
  const app =
    params.get("app") ||
    localStorage.getItem("aflino_pwa_identity") ||
    "default";
  const path = window.location.pathname;

  let identity = app;
  if (path.startsWith("/admin")) identity = "admin";
  else if (path.startsWith("/seller") || path === "/seller-register")
    identity = "seller";

  const manifestPath =
    identity === "seller"
      ? "/manifest-seller.json"
      : identity === "customer"
        ? "/manifest-customer.json"
        : "/manifest.json";

  let link = document.querySelector(
    'link[rel="manifest"]',
  ) as HTMLLinkElement | null;
  if (!link) {
    link = document.createElement("link");
    link.rel = "manifest";
    document.head.appendChild(link);
  }
  link.href = manifestPath;

  if (["customer", "seller"].includes(identity)) {
    localStorage.setItem("aflino_pwa_identity", identity);
  }
})();

const queryClient = new QueryClient();

ReactDOM.createRoot(document.getElementById("root")!).render(
  <QueryClientProvider client={queryClient}>
    <InternetIdentityProvider>
      <App />
    </InternetIdentityProvider>
  </QueryClientProvider>,
);
