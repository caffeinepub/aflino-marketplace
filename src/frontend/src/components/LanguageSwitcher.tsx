import { useTranslation } from "@/context/I18nContext";
import { useLanguageIcons } from "@/context/LanguageIconContext";
import { Globe } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { createPortal } from "react-dom";

export const LANGUAGES = [
  {
    code: "en",
    label: "English",
    sub: "English",
    short: "EN",
    icon: "flagpole",
  },
  { code: "hi", label: "हिन्दी", sub: "Hindi", short: "हि", icon: "indiagate" },
  { code: "bn", label: "বাংলা", sub: "Bengali", short: "বা", icon: "howrah" },
  {
    code: "ta",
    label: "தமிழ்",
    sub: "Tamil",
    short: "த",
    icon: "centralstation",
  },
];

/* ── Default SVG Line-Art Icons ── */

function FlagpoleIcon() {
  return (
    <svg
      viewBox="0 0 60 40"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      className="w-10 h-7 text-gray-500 mx-auto mb-1"
      aria-label="India Flag"
      role="img"
    >
      <title>India Flagpole</title>
      <line x1="12" y1="4" x2="12" y2="36" />
      <polygon points="12,4 44,12 12,20" fill="none" />
      <circle cx="28" cy="12" r="3" />
    </svg>
  );
}

function IndiaGateIcon() {
  return (
    <svg
      viewBox="0 0 80 44"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      className="w-10 h-7 text-gray-500 mx-auto mb-1"
      aria-label="India Gate New Delhi"
      role="img"
    >
      <title>India Gate, New Delhi</title>
      {/* Base road */}
      <line x1="4" y1="38" x2="76" y2="38" />
      {/* Left pillar */}
      <rect x="14" y="16" width="8" height="22" />
      {/* Right pillar */}
      <rect x="58" y="16" width="8" height="22" />
      {/* Arch */}
      <path d="M22,16 Q40,2 58,16" />
      {/* Small top block */}
      <rect x="30" y="6" width="20" height="4" />
      {/* Center colonnade lines */}
      <line x1="30" y1="16" x2="30" y2="38" />
      <line x1="40" y1="16" x2="40" y2="38" />
      <line x1="50" y1="16" x2="50" y2="38" />
      {/* Steps */}
      <line x1="10" y1="38" x2="10" y2="42" />
      <line x1="70" y1="38" x2="70" y2="42" />
      <line x1="6" y1="42" x2="74" y2="42" />
    </svg>
  );
}

function HowrahBridgeIcon() {
  return (
    <svg
      viewBox="0 0 80 34"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      className="w-10 h-7 text-gray-500 mx-auto mb-1"
      aria-label="Howrah Bridge Kolkata"
      role="img"
    >
      <title>Howrah Bridge, Kolkata</title>
      {/* Road deck */}
      <line x1="4" y1="26" x2="76" y2="26" />
      {/* Left tower */}
      <line x1="16" y1="26" x2="16" y2="4" />
      {/* Right tower */}
      <line x1="64" y1="26" x2="64" y2="4" />
      {/* Top chord */}
      <line x1="16" y1="4" x2="64" y2="4" />
      {/* Suspension hangers left */}
      <line x1="16" y1="4" x2="8" y2="26" />
      <line x1="16" y1="4" x2="20" y2="26" />
      <line x1="16" y1="4" x2="28" y2="26" />
      <line x1="16" y1="4" x2="36" y2="26" />
      {/* Suspension hangers right */}
      <line x1="64" y1="4" x2="72" y2="26" />
      <line x1="64" y1="4" x2="60" y2="26" />
      <line x1="64" y1="4" x2="52" y2="26" />
      <line x1="64" y1="4" x2="44" y2="26" />
      {/* Water lines */}
      <path
        d="M4,30 Q12,28 20,30 Q28,32 36,30 Q44,28 52,30 Q60,32 68,30 Q72,29 76,30"
        strokeDasharray="2 2"
      />
    </svg>
  );
}

function ChennaiCentralIcon() {
  return (
    <svg
      viewBox="0 0 80 46"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      className="w-10 h-7 text-gray-500 mx-auto mb-1"
      aria-label="Chennai Central Station"
      role="img"
    >
      <title>Chennai Central Station</title>
      {/* Base */}
      <rect x="6" y="30" width="68" height="12" />
      {/* Main central dome */}
      <path d="M28,30 Q40,10 52,30" />
      <line x1="40" y1="10" x2="40" y2="14" />
      <circle cx="40" cy="8" r="3" />
      {/* Left tower */}
      <rect x="8" y="16" width="8" height="14" />
      <path d="M8,16 Q12,8 16,16" />
      {/* Right tower */}
      <rect x="64" y="16" width="8" height="14" />
      <path d="M64,16 Q68,8 72,16" />
      {/* Arched windows */}
      <path d="M18,30 Q21,24 24,30" />
      <path d="M56,30 Q59,24 62,30" />
      {/* Clock */}
      <circle cx="40" cy="22" r="4" />
      <line x1="40" y1="20" x2="40" y2="22" />
      <line x1="40" y1="22" x2="42" y2="22" />
      {/* Ground line */}
      <line x1="2" y1="42" x2="78" y2="42" />
    </svg>
  );
}

function DefaultCulturalIcon({ type }: { type: string }) {
  if (type === "indiagate") return <IndiaGateIcon />;
  if (type === "howrah") return <HowrahBridgeIcon />;
  if (type === "centralstation") return <ChennaiCentralIcon />;
  return <FlagpoleIcon />;
}

function CulturalIcon({
  langCode,
  defaultType,
}: { langCode: string; defaultType: string }) {
  const { icons } = useLanguageIcons();
  const customIcon = icons[langCode];

  if (customIcon) {
    return (
      <img
        src={customIcon}
        alt={`${langCode} icon`}
        className="w-10 h-7 object-cover mx-auto mb-1 rounded"
      />
    );
  }
  return <DefaultCulturalIcon type={defaultType} />;
}

interface LanguageSwitcherProps {
  compact?: boolean;
}

export default function LanguageSwitcher({
  compact = false,
}: LanguageSwitcherProps) {
  const { i18n } = useTranslation();
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState(() => {
    const validCodes = new Set(LANGUAGES.map((l) => l.code));
    return validCodes.has(i18n.language) ? i18n.language : "en";
  });

  const current =
    LANGUAGES.find((l) => l.code === i18n.language) ?? LANGUAGES[0];

  function handleSelect(code: string) {
    setSelected(code as "en" | "hi" | "bn");
    i18n.changeLanguage(code);
    localStorage.setItem("aflino_lang", code);
  }

  function handleConfirm() {
    setOpen(false);
  }

  const triggerButton = (
    <button
      type="button"
      onClick={() => {
        setSelected(current.code as "en" | "hi" | "bn");
        setOpen(true);
      }}
      className="flex items-center gap-1 px-2.5 py-1 rounded-full border font-semibold text-xs transition-colors hover:bg-blue-50"
      style={{ borderColor: "#006AFF", color: "#006AFF" }}
      aria-label="Select language"
      data-ocid="language.button"
    >
      <Globe className="w-3.5 h-3.5" />
      <span>{current.short}</span>
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
          className="fixed inset-0 z-[9999] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) handleConfirm();
          }}
          data-ocid="language.modal"
        >
          <motion.div
            key="lang-card"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-6"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-baseline gap-2 mb-5">
              <h2 className="text-lg font-bold text-gray-900">
                Select Language
              </h2>
              <span className="text-lg font-medium text-gray-400">
                / भाषा चुनें
              </span>
            </div>

            {/* Language Grid */}
            <div className="grid grid-cols-3 gap-3 mb-5">
              {LANGUAGES.map((lang) => {
                const isSelected = selected === lang.code;
                return (
                  <button
                    key={lang.code}
                    type="button"
                    onClick={() => handleSelect(lang.code)}
                    className={`relative rounded-xl border-2 p-4 text-center cursor-pointer transition-all ${
                      isSelected
                        ? "border-[#006AFF] bg-blue-50"
                        : "border-gray-200 hover:border-blue-200 hover:bg-blue-50/30"
                    }`}
                    data-ocid={`language.${lang.code}.button`}
                  >
                    {isSelected && (
                      <span className="absolute top-1.5 right-1.5 w-5 h-5 rounded-full bg-green-500 text-white text-[10px] font-bold flex items-center justify-center">
                        ✓
                      </span>
                    )}
                    <CulturalIcon
                      langCode={lang.code}
                      defaultType={lang.icon}
                    />
                    <div className="text-sm font-bold text-gray-900 leading-tight">
                      {lang.label}
                    </div>
                    <div className="text-[11px] text-gray-400 mt-0.5">
                      {lang.sub}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Confirm Button */}
            <button
              type="button"
              onClick={handleConfirm}
              className="w-full py-3 rounded-full text-white font-semibold text-sm transition-opacity hover:opacity-90"
              style={{ backgroundColor: "#006AFF" }}
              data-ocid="language.confirm_button"
            >
              Confirm / पुष्टि करें
            </button>
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
