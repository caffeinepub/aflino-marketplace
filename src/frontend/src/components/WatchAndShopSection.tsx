import { useAffiliate } from "@/context/AffiliateContext";
import { ExternalLink, Flame } from "lucide-react";

function extractYouTubeId(url: string): string | null {
  const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([\w-]+)/);
  return match ? match[1] : null;
}

export default function WatchAndShopSection() {
  const { videos, affiliates } = useAffiliate();
  const approvedVideos = videos.filter((v) => v.status === "approved");

  if (approvedVideos.length === 0) return null;

  return (
    <section className="py-8 px-4 sm:px-6" data-ocid="watch_shop.section">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center gap-2 mb-5">
          <Flame className="w-5 h-5 text-orange-500" />
          <h2 className="text-xl font-bold text-gray-900">Watch &amp; Shop</h2>
          <span className="text-sm text-gray-400 font-normal">
            Discover products through our creator community
          </span>
        </div>
        <div className="flex gap-4 overflow-x-auto pb-2 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          {approvedVideos.map((v) => {
            const aff = affiliates.find((a) => a.id === v.affiliateId);
            const ytId =
              v.platform === "youtube" ? extractYouTubeId(v.url) : null;
            return (
              <div
                key={v.id}
                className="flex-shrink-0 w-64 bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100 hover:shadow-md transition-shadow"
              >
                {ytId ? (
                  <div className="aspect-video">
                    <iframe
                      src={`https://www.youtube.com/embed/${ytId}`}
                      className="w-full h-full"
                      allowFullScreen
                      title={v.title}
                    />
                  </div>
                ) : (
                  <a
                    href={v.url}
                    target="_blank"
                    rel="noreferrer"
                    className="block"
                  >
                    <div className="aspect-video bg-gradient-to-br from-pink-100 to-purple-100 flex flex-col items-center justify-center gap-2">
                      <div className="w-12 h-12 rounded-full bg-white/80 flex items-center justify-center">
                        <span className="font-bold text-pink-600">IG</span>
                      </div>
                      <span className="text-xs text-gray-600 font-medium">
                        Instagram Reel
                      </span>
                    </div>
                  </a>
                )}
                <div className="p-3">
                  <p className="text-sm font-semibold text-gray-800 line-clamp-1 mb-1">
                    {v.title}
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-400 bg-gray-50 px-2 py-0.5 rounded-full">
                      {v.affiliateName}
                    </span>
                    {aff && (
                      <a
                        href={`https://aflino.com/?ref=${aff.referralCode}`}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center gap-1 text-xs font-semibold text-white px-2.5 py-1 rounded-full"
                        style={{ backgroundColor: "#006AFF" }}
                        data-ocid="watch_shop.shop_now.button"
                      >
                        Shop Now <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
