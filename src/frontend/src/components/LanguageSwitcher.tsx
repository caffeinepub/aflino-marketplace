import { useTranslation } from "@/context/I18nContext";
import { useLanguageIcons } from "@/context/LanguageIconContext";
import { ALL_LANGUAGES, RTL_LANGS } from "@/i18n";
import { Check, Globe, X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { createPortal } from "react-dom";

// Keep backward-compat export used in LanguageIconManager
export const LANGUAGES = ALL_LANGUAGES;

/* ── Default SVG Line-Art Icons ── */
function DefaultLandmarkSVG({ type }: { type: string }) {
  switch (type) {
    case "indiagate":
      return (
        <svg
          viewBox="0 0 80 44"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          className="w-9 h-6 text-gray-400 mx-auto mb-0.5"
        >
          <title>India Gate</title>
          <line x1="4" y1="38" x2="76" y2="38" />
          <rect x="14" y="16" width="8" height="22" />
          <rect x="58" y="16" width="8" height="22" />
          <path d="M22,16 Q40,2 58,16" />
          <rect x="30" y="6" width="20" height="4" />
          <line x1="30" y1="16" x2="30" y2="38" />
          <line x1="40" y1="16" x2="40" y2="38" />
          <line x1="50" y1="16" x2="50" y2="38" />
        </svg>
      );
    case "howrah":
      return (
        <svg
          viewBox="0 0 80 34"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          className="w-9 h-6 text-gray-400 mx-auto mb-0.5"
        >
          <title>Howrah Bridge</title>
          <line x1="4" y1="26" x2="76" y2="26" />
          <line x1="16" y1="26" x2="16" y2="4" />
          <line x1="64" y1="26" x2="64" y2="4" />
          <line x1="16" y1="4" x2="64" y2="4" />
          <line x1="16" y1="4" x2="8" y2="26" />
          <line x1="16" y1="4" x2="28" y2="26" />
          <line x1="16" y1="4" x2="40" y2="26" />
          <line x1="64" y1="4" x2="72" y2="26" />
          <line x1="64" y1="4" x2="52" y2="26" />
          <line x1="64" y1="4" x2="44" y2="26" />
        </svg>
      );
    case "centralstation":
      return (
        <svg
          viewBox="0 0 80 46"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          className="w-9 h-6 text-gray-400 mx-auto mb-0.5"
        >
          <title>Chennai Central</title>
          <rect x="6" y="30" width="68" height="12" />
          <path d="M28,30 Q40,10 52,30" />
          <rect x="8" y="16" width="8" height="14" />
          <rect x="64" y="16" width="8" height="14" />
          <circle cx="40" cy="22" r="4" />
        </svg>
      );
    case "charminar":
      return (
        <svg
          viewBox="0 0 80 50"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          className="w-9 h-6 text-gray-400 mx-auto mb-0.5"
        >
          <title>Charminar</title>
          <rect x="30" y="30" width="20" height="16" />
          <line x1="14" y1="46" x2="14" y2="14" />
          <line x1="66" y1="46" x2="66" y2="14" />
          <path d="M14,14 Q14,6 18,6" />
          <path d="M66,14 Q66,6 62,6" />
          <line x1="30" y1="30" x2="30" y2="14" />
          <line x1="50" y1="30" x2="50" y2="14" />
          <line x1="14" y1="30" x2="66" y2="30" />
        </svg>
      );
    case "gateway":
      return (
        <svg
          viewBox="0 0 80 50"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          className="w-9 h-6 text-gray-400 mx-auto mb-0.5"
        >
          <title>Gateway of India</title>
          <line x1="4" y1="42" x2="76" y2="42" />
          <path d="M20,42 Q20,10 40,6 Q60,10 60,42" />
          <line x1="20" y1="42" x2="20" y2="20" />
          <line x1="60" y1="42" x2="60" y2="20" />
          <line x1="30" y1="18" x2="50" y2="18" />
        </svg>
      );
    case "goldentemple":
      return (
        <svg
          viewBox="0 0 80 50"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          className="w-9 h-6 text-gray-400 mx-auto mb-0.5"
        >
          <title>Golden Temple</title>
          <rect x="24" y="24" width="32" height="18" />
          <path d="M24,24 Q40,8 56,24" />
          <line x1="40" y1="8" x2="40" y2="4" />
          <circle cx="40" cy="3" r="2" />
          <line x1="14" y1="42" x2="66" y2="42" />
        </svg>
      );
    case "konark":
      return (
        <svg
          viewBox="0 0 80 50"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          className="w-9 h-6 text-gray-400 mx-auto mb-0.5"
        >
          <title>Konark Sun Temple</title>
          <rect x="16" y="28" width="48" height="14" />
          <path d="M26,28 Q40,6 54,28" />
          <circle cx="40" cy="20" r="5" />
          <line x1="6" y1="42" x2="74" y2="42" />
        </svg>
      );
    case "hawamahal":
      return (
        <svg
          viewBox="0 0 80 50"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          className="w-9 h-6 text-gray-400 mx-auto mb-0.5"
        >
          <title>Hawa Mahal</title>
          <rect x="10" y="28" width="60" height="14" />
          <path d="M10,28 Q14,18 18,28" />
          <path d="M18,28 Q22,18 26,28" />
          <path d="M26,28 Q30,18 34,28" />
          <path d="M34,28 Q38,18 42,28" />
          <path d="M42,28 Q46,18 50,28" />
          <path d="M50,28 Q54,18 58,28" />
          <path d="M58,28 Q62,18 66,28" />
          <path d="M66,28 Q70,18 70,28" />
        </svg>
      );
    case "varanasi":
      return (
        <svg
          viewBox="0 0 80 50"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          className="w-9 h-6 text-gray-400 mx-auto mb-0.5"
        >
          <title>Varanasi Ghats</title>
          <line x1="4" y1="36" x2="76" y2="36" />
          <rect x="14" y="18" width="12" height="18" />
          <rect x="34" y="14" width="12" height="22" />
          <rect x="54" y="20" width="10" height="16" />
          <path d="M14,18 Q20,10 26,18" />
          <path d="M34,14 Q40,6 46,14" />
        </svg>
      );
    case "dallake":
      return (
        <svg
          viewBox="0 0 80 44"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          className="w-9 h-6 text-gray-400 mx-auto mb-0.5"
        >
          <title>Dal Lake</title>
          <path d="M6,34 Q20,20 40,18 Q60,16 74,26" />
          <path d="M10,38 Q24,32 40,30 Q56,28 70,34" />
          <line x1="36" y1="18" x2="36" y2="8" />
          <path d="M28,14 Q36,6 44,14" />
        </svg>
      );
    case "lucknow":
      return (
        <svg
          viewBox="0 0 80 50"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          className="w-9 h-6 text-gray-400 mx-auto mb-0.5"
        >
          <title>Bara Imambara Lucknow</title>
          <rect x="10" y="28" width="60" height="14" />
          <path d="M24,28 Q24,14 40,10 Q56,14 56,28" />
          <rect x="34" y="10" width="12" height="6" />
          <line x1="40" y1="10" x2="40" y2="4" />
        </svg>
      );
    default: // flagpole
      return (
        <svg
          viewBox="0 0 60 40"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          className="w-9 h-6 text-gray-400 mx-auto mb-0.5"
        >
          <title>India Flagpole</title>
          <line x1="12" y1="4" x2="12" y2="36" />
          <polygon points="12,4 44,12 12,20" fill="none" />
          <circle cx="28" cy="12" r="3" />
        </svg>
      );
  }
}

function LandmarkIcon({ code, iconKey }: { code: string; iconKey: string }) {
  const { icons } = useLanguageIcons();
  const adminIcon = icons[code];
  if (adminIcon) {
    return (
      <img
        src={adminIcon}
        alt={code}
        className="w-9 h-6 object-cover mx-auto mb-0.5 rounded"
      />
    );
  }
  return <DefaultLandmarkSVG type={iconKey} />;
}

interface LanguageSwitcherProps {
  compact?: boolean;
}

export default function LanguageSwitcher({
  compact = false,
}: LanguageSwitcherProps) {
  const { i18n } = useTranslation();
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<string>(i18n.language);

  const currentLang =
    ALL_LANGUAGES.find((l) => l.code === i18n.language) ?? ALL_LANGUAGES[0];

  function handleSelect(code: string) {
    setSelected(code);
    i18n.changeLanguage(code);
    localStorage.setItem("aflino_lang", code);
  }

  function handleClose() {
    setOpen(false);
  }

  // Group by region for display
  const rtlLangs = ALL_LANGUAGES.filter((l) => RTL_LANGS.has(l.code));
  const nonRtlLangs = ALL_LANGUAGES.filter((l) => !RTL_LANGS.has(l.code));

  const triggerButton = (
    <button
      type="button"
      onClick={() => {
        setSelected(i18n.language);
        setOpen(true);
      }}
      className="flex items-center gap-1.5 px-2.5 py-1 rounded-full border font-semibold text-xs transition-colors hover:bg-blue-50"
      style={{ borderColor: "#006AFF", color: "#006AFF" }}
      aria-label="Select language"
      data-ocid="language.button"
    >
      <Globe className="w-3.5 h-3.5" />
      <span>{currentLang.short}</span>
    </button>
  );

  const modal = (
    <AnimatePresence>
      {open && (
        <motion.div
          key="lang-backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-[9999] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) handleClose();
          }}
          data-ocid="language.modal"
        >
          <motion.div
            key="lang-card"
            initial={{ opacity: 0, scale: 0.95, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 8 }}
            transition={{ duration: 0.2 }}
            className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl flex flex-col"
            style={{ maxHeight: "90vh" }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 flex-shrink-0">
              <div>
                <h2 className="text-base font-bold text-gray-900">
                  Select Language{" "}
                  <span className="text-gray-400 font-medium">/ भाषा चुनें</span>
                </h2>
                <p className="text-xs text-gray-400 mt-0.5">
                  {ALL_LANGUAGES.length} languages available
                </p>
              </div>
              <button
                type="button"
                onClick={handleClose}
                className="p-1.5 rounded-full hover:bg-gray-100 transition-colors"
              >
                <X className="w-4 h-4 text-gray-500" />
              </button>
            </div>

            {/* Language Grid — scrollable */}
            <div className="overflow-y-auto flex-1 px-4 py-4">
              {/* LTR Languages */}
              <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-2 px-1">
                Indian &amp; International Languages
              </p>
              <div className="grid grid-cols-4 gap-2 mb-4">
                {nonRtlLangs.map((lang) => {
                  const isSel = selected === lang.code;
                  return (
                    <button
                      key={lang.code}
                      type="button"
                      onClick={() => handleSelect(lang.code)}
                      className={`relative rounded-xl border-2 p-2 text-center cursor-pointer transition-all ${
                        isSel
                          ? "border-[#006AFF] bg-blue-50"
                          : "border-gray-100 hover:border-blue-200 hover:bg-blue-50/30"
                      }`}
                      data-ocid={`language.${lang.code}.button`}
                    >
                      {isSel && (
                        <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-green-500 text-white text-[9px] font-bold flex items-center justify-center">
                          <Check className="w-2.5 h-2.5" />
                        </span>
                      )}
                      <LandmarkIcon code={lang.code} iconKey={lang.icon} />
                      <div className="text-xs font-bold text-gray-900 leading-tight truncate">
                        {lang.label}
                      </div>
                      <div className="text-[10px] text-gray-400 truncate">
                        {lang.sub}
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* RTL Languages */}
              <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-2 px-1">
                RTL Languages (اللغات من اليمين إلى اليسار)
              </p>
              <div className="grid grid-cols-4 gap-2">
                {rtlLangs.map((lang) => {
                  const isSel = selected === lang.code;
                  return (
                    <button
                      key={lang.code}
                      type="button"
                      onClick={() => handleSelect(lang.code)}
                      className={`relative rounded-xl border-2 p-2 text-center cursor-pointer transition-all ${
                        isSel
                          ? "border-[#006AFF] bg-blue-50"
                          : "border-gray-100 hover:border-blue-200 hover:bg-blue-50/30"
                      }`}
                      data-ocid={`language.${lang.code}.button`}
                    >
                      {isSel && (
                        <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-green-500 text-white text-[9px] font-bold flex items-center justify-center">
                          <Check className="w-2.5 h-2.5" />
                        </span>
                      )}
                      <LandmarkIcon code={lang.code} iconKey={lang.icon} />
                      <div
                        className="text-xs font-bold text-gray-900 leading-tight truncate"
                        dir="rtl"
                      >
                        {lang.label}
                      </div>
                      <div className="text-[10px] text-gray-400 truncate">
                        {lang.sub}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Footer */}
            <div className="px-6 py-4 border-t border-gray-100 flex-shrink-0">
              <button
                type="button"
                onClick={handleClose}
                className="w-full py-2.5 rounded-full text-white font-semibold text-sm transition-opacity hover:opacity-90"
                style={{ backgroundColor: "#006AFF" }}
                data-ocid="language.confirm_button"
              >
                Confirm / पुष्टि करें
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  return (
    <>
      {compact ? (
        <div className="flex items-center gap-2 px-3 py-2">
          <Globe
            className="w-4 h-4 flex-shrink-0"
            style={{ color: "#006AFF" }}
          />
          <span className="text-sm font-medium text-gray-700 flex-1">
            Language
          </span>
          {triggerButton}
        </div>
      ) : (
        <div className="flex-shrink-0">{triggerButton}</div>
      )}
      {createPortal(modal, document.body)}
    </>
  );
}
