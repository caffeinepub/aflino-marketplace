import { useGeoLocation } from "@/context/GeoLocationContext";
import { MapPin } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useRef, useState } from "react";

export default function LocationModal() {
  const { modalShown, dismissModal, requestLocation } = useGeoLocation();
  const [detecting, setDetecting] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const detectTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Auto-hide after 5s of no interaction
  useEffect(() => {
    if (!modalShown) return;
    timerRef.current = setTimeout(() => {
      dismissModal();
    }, 5000);
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      if (detectTimerRef.current) clearTimeout(detectTimerRef.current);
    };
    // biome-ignore lint/correctness/useExhaustiveDependencies: dismissModal is stable context fn
  }, [modalShown, dismissModal]);

  function handleSkip() {
    if (timerRef.current) clearTimeout(timerRef.current);
    dismissModal();
  }

  function handleAllow() {
    if (timerRef.current) clearTimeout(timerRef.current);
    setDetecting(true);
    requestLocation();
    detectTimerRef.current = setTimeout(() => {
      dismissModal();
    }, 3000);
  }

  return (
    <AnimatePresence>
      {modalShown && (
        <motion.div
          key="location-modal-backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-[999] bg-black/40 backdrop-blur-sm flex items-center justify-center p-4"
          data-ocid="location.modal"
        >
          <motion.div
            key="location-modal-card"
            initial={{ opacity: 0, scale: 0.92, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 12 }}
            transition={{ duration: 0.22, ease: [0.34, 1.56, 0.64, 1] }}
            className="bg-white rounded-2xl shadow-2xl w-full max-w-xs mx-4 p-6 flex flex-col items-center"
          >
            {/* Icon */}
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
              <MapPin
                className="w-5 h-5"
                style={{ color: "#006AFF" }}
                strokeWidth={2.5}
              />
            </div>

            {/* Headline */}
            <h2 className="text-base font-bold text-gray-900 text-center mt-3">
              Enable Location for AFLINO Local
            </h2>

            {/* Sub-text */}
            <p className="text-xs text-gray-500 text-center mt-1 leading-relaxed">
              Discover exclusive products and faster delivery from AFLINO
              partners in your state.
            </p>

            {detecting && (
              <p
                className="text-xs font-medium mt-2"
                style={{ color: "#006AFF" }}
              >
                📍 Detecting your location...
              </p>
            )}

            {/* Buttons */}
            <div className="flex gap-2 mt-4 w-full">
              <button
                type="button"
                disabled={detecting}
                onClick={handleSkip}
                className="flex-1 py-2 rounded-lg text-xs font-semibold text-white transition-opacity disabled:opacity-50"
                style={{ backgroundColor: "#EC008C" }}
                data-ocid="location.skip.button"
              >
                Skip
              </button>
              <button
                type="button"
                disabled={detecting}
                onClick={handleAllow}
                className="flex-1 py-2 rounded-lg text-xs font-semibold text-white transition-opacity disabled:opacity-50"
                style={{ backgroundColor: "#006AFF" }}
                data-ocid="location.allow.button"
              >
                {detecting ? "Detecting..." : "Allow"}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
