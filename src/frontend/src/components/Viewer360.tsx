import { useCallback, useEffect, useRef, useState } from "react";

export interface Viewer360Props {
  frames: string[];
  highResFrames?: string[];
  productName?: string;
  onClose?: () => void;
}

const SENSITIVITY = 5; // px per frame step

export default function Viewer360({
  frames,
  highResFrames,
  productName,
}: Viewer360Props) {
  const [currentFrame, setCurrentFrame] = useState(0);
  const [mode, setMode] = useState<"rotate" | "zoom">("rotate");
  const [isDragging, setIsDragging] = useState(false);
  const [zoomX, setZoomX] = useState(50);
  const [zoomY, setZoomY] = useState(50);
  const [isZooming, setIsZooming] = useState(false);
  const [loadingHighRes, setLoadingHighRes] = useState(false);
  const [firstFrameLoaded, setFirstFrameLoaded] = useState(false);
  const [highResUrl, setHighResUrl] = useState<string | null>(null);

  const dragStartXRef = useRef(0);
  const imgRef = useRef<HTMLImageElement>(null);
  const frameCache = useRef<Set<string>>(new Set());
  const highResCache = useRef<Map<string, string>>(new Map());
  const zoomDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const tapCountRef = useRef(0);
  const tapTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastTouchPosRef = useRef({ x: 50, y: 50 });

  const totalFrames = frames.length;

  // Pre-fetch adjacent frames
  const prefetchAdjacentFrames = useCallback(
    (index: number) => {
      const neighbors = [
        (index + 1) % totalFrames,
        (index - 1 + totalFrames) % totalFrames,
      ];
      const idle =
        typeof requestIdleCallback !== "undefined"
          ? requestIdleCallback
          : (fn: () => void) => setTimeout(fn, 0);

      for (const idx of neighbors) {
        const url = frames[idx];
        if (url && !frameCache.current.has(url)) {
          idle(() => {
            const img = new Image();
            img.onload = () => frameCache.current.add(url);
            img.src = url;
          });
        }
      }
    },
    [frames, totalFrames],
  );

  // Prefetch on frame change
  useEffect(() => {
    prefetchAdjacentFrames(currentFrame);
  }, [currentFrame, prefetchAdjacentFrames]);

  // Load high-res when zooming starts
  useEffect(() => {
    if (!isZooming) {
      setHighResUrl(null);
      return;
    }
    const url = highResFrames?.[currentFrame] ?? frames[currentFrame];
    if (!url) return;

    const cached = highResCache.current.get(url);
    if (cached) {
      setHighResUrl(cached);
      return;
    }

    setLoadingHighRes(true);
    const img = new Image();
    img.onload = () => {
      highResCache.current.set(url, url);
      setHighResUrl(url);
      setLoadingHighRes(false);
    };
    img.onerror = () => {
      setHighResUrl(url); // fallback to same url
      setLoadingHighRes(false);
    };
    img.src = url;
  }, [isZooming, currentFrame, frames, highResFrames]);

  // ── Rotation handlers ──────────────────────────────────────────────────────

  function applyDrag(clientX: number) {
    const delta = clientX - dragStartXRef.current;
    const frameShift = Math.round(delta / SENSITIVITY);
    if (frameShift === 0) return;
    setCurrentFrame(
      (prev) =>
        (((prev + frameShift) % totalFrames) + totalFrames) % totalFrames,
    );
    dragStartXRef.current = clientX;
  }

  function onMouseDown(e: React.MouseEvent) {
    if (mode !== "rotate") return;
    setIsDragging(true);
    dragStartXRef.current = e.clientX;
  }

  function onMouseMove(e: React.MouseEvent) {
    if (mode === "rotate" && isDragging) {
      applyDrag(e.clientX);
      return;
    }
    if (mode === "zoom" && imgRef.current) {
      const rect = imgRef.current.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 100;
      const y = ((e.clientY - rect.top) / rect.height) * 100;
      setZoomX(Math.max(0, Math.min(100, x)));
      setZoomY(Math.max(0, Math.min(100, y)));

      if (zoomDebounceRef.current) clearTimeout(zoomDebounceRef.current);
      zoomDebounceRef.current = setTimeout(() => setIsZooming(true), 200);
    }
  }

  function onMouseUp() {
    setIsDragging(false);
  }

  function onMouseLeave() {
    setIsDragging(false);
    if (mode === "zoom") {
      if (zoomDebounceRef.current) clearTimeout(zoomDebounceRef.current);
      setIsZooming(false);
    }
  }

  // ── Touch handlers ─────────────────────────────────────────────────────────

  function onTouchStart(e: React.TouchEvent) {
    const touch = e.touches[0];
    if (mode === "rotate") {
      setIsDragging(true);
      dragStartXRef.current = touch.clientX;
    }
    if (mode === "zoom" && imgRef.current) {
      const rect = imgRef.current.getBoundingClientRect();
      const x = ((touch.clientX - rect.left) / rect.width) * 100;
      const y = ((touch.clientY - rect.top) / rect.height) * 100;
      lastTouchPosRef.current = { x, y };

      tapCountRef.current += 1;
      if (tapTimerRef.current) clearTimeout(tapTimerRef.current);
      tapTimerRef.current = setTimeout(() => {
        tapCountRef.current = 0;
      }, 300);

      if (tapCountRef.current >= 2) {
        tapCountRef.current = 0;
        setZoomX(Math.max(0, Math.min(100, x)));
        setZoomY(Math.max(0, Math.min(100, y)));
        setIsZooming((prev) => !prev);
      }
    }
  }

  function onTouchMove(e: React.TouchEvent) {
    if (mode !== "rotate" || !isDragging) return;
    applyDrag(e.touches[0].clientX);
  }

  function onTouchEnd() {
    setIsDragging(false);
  }

  // ── Cursor based on mode & state ──────────────────────────────────────────
  const cursor =
    mode === "rotate" ? (isDragging ? "ew-resize" : "grab") : "zoom-in";

  const currentFrameUrl = frames[currentFrame] ?? "";

  return (
    <div
      className="relative rounded-2xl overflow-hidden border border-gray-200 bg-gray-50 select-none"
      data-ocid="viewer360.container"
      aria-label={productName ? `360° view of ${productName}` : "360° viewer"}
    >
      {/* Mode toggle + frame count */}
      <div className="absolute top-3 left-3 z-20 flex gap-2">
        <button
          type="button"
          onClick={() => {
            setMode("rotate");
            setIsZooming(false);
          }}
          data-ocid="viewer360.mode.rotate"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold shadow transition-all"
          style={{
            backgroundColor:
              mode === "rotate" ? "#006AFF" : "rgba(255,255,255,0.92)",
            color: mode === "rotate" ? "#fff" : "#374151",
            border: mode === "rotate" ? "none" : "1px solid #e5e7eb",
          }}
        >
          <span style={{ fontSize: 13 }}>↻</span> Rotate
        </button>
        <button
          type="button"
          onClick={() => setMode("zoom")}
          data-ocid="viewer360.mode.zoom"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold shadow transition-all"
          style={{
            backgroundColor:
              mode === "zoom" ? "#006AFF" : "rgba(255,255,255,0.92)",
            color: mode === "zoom" ? "#fff" : "#374151",
            border: mode === "zoom" ? "none" : "1px solid #e5e7eb",
          }}
        >
          <span style={{ fontSize: 13 }}>🔍</span> Zoom
        </button>
      </div>

      {/* Frame counter */}
      <div className="absolute top-3 right-3 z-20 text-xs text-gray-500 bg-white/80 backdrop-blur-sm px-2 py-1 rounded-full border border-gray-200">
        {currentFrame + 1} / {totalFrames}
      </div>

      {/* Main viewer area — flex row on desktop for side panel */}
      <div className="flex items-stretch">
        {/* Image area */}
        <div className="relative flex-1 min-w-0">
          {/* Loading skeleton for first frame */}
          {!firstFrameLoaded && (
            <div className="absolute inset-0 bg-gray-200 animate-pulse rounded-2xl z-10" />
          )}

          {/* Magnifier cursor follower (desktop zoom mode) */}
          {mode === "zoom" && !isZooming && (
            <div
              className="absolute pointer-events-none z-10 text-lg select-none hidden sm:block"
              style={{
                left: `${zoomX}%`,
                top: `${zoomY}%`,
                transform: "translate(-50%, -50%)",
                filter: "drop-shadow(0 1px 3px rgba(0,0,0,0.3))",
              }}
            >
              🔍
            </div>
          )}

          <img
            ref={imgRef}
            src={currentFrameUrl}
            alt={`${productName ?? "Product"} — frame ${currentFrame + 1}`}
            draggable={false}
            onLoad={() => setFirstFrameLoaded(true)}
            onMouseDown={onMouseDown}
            onMouseMove={onMouseMove}
            onMouseUp={onMouseUp}
            onMouseLeave={onMouseLeave}
            onTouchStart={onTouchStart}
            onTouchMove={onTouchMove}
            onTouchEnd={onTouchEnd}
            className="w-full h-80 md:h-96 object-contain transition-opacity duration-100"
            style={{ cursor, opacity: firstFrameLoaded ? 1 : 0 }}
            data-ocid="viewer360.frame_image"
          />

          {/* Mobile double-tap hint */}
          {mode === "zoom" && (
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 text-[10px] text-gray-400 bg-white/80 rounded-full px-2.5 py-0.5 sm:hidden pointer-events-none">
              Double-tap to zoom
            </div>
          )}
          {mode === "rotate" && (
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 text-[10px] text-gray-400 bg-white/80 rounded-full px-2.5 py-0.5 pointer-events-none">
              ← Drag to rotate →
            </div>
          )}
        </div>

        {/* Side panel zoom view — desktop only */}
        {mode === "zoom" && isZooming && (
          <div className="hidden sm:flex flex-col">
            <div
              className="w-[300px] h-full min-h-[320px] rounded-r-2xl overflow-hidden border-l border-blue-100"
              data-ocid="viewer360.zoom_panel"
              style={{
                backgroundImage: `url(${highResUrl ?? currentFrameUrl})`,
                backgroundSize: "200% 200%",
                backgroundPosition: `${zoomX}% ${zoomY}%`,
                backgroundRepeat: "no-repeat",
                position: "relative",
              }}
            >
              {loadingHighRes && (
                <div className="absolute inset-0 bg-gray-100 animate-pulse flex items-center justify-center">
                  <span className="text-xs text-gray-400">Loading HD…</span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Mobile overlay zoom */}
      {mode === "zoom" && isZooming && (
        <div
          className="sm:hidden fixed inset-0 z-50 flex items-center justify-center"
          style={{
            backdropFilter: "blur(6px)",
            backgroundColor: "rgba(0,0,0,0.55)",
          }}
          data-ocid="viewer360.zoom_overlay"
        >
          <div
            className="w-[300px] h-[300px] rounded-xl border border-blue-200 overflow-hidden"
            role="presentation"
            style={{
              backgroundImage: `url(${highResUrl ?? currentFrameUrl})`,
              backgroundSize: "200% 200%",
              backgroundPosition: `${zoomX}% ${zoomY}%`,
              backgroundRepeat: "no-repeat",
            }}
          >
            {loadingHighRes && (
              <div className="w-full h-full bg-gray-100 animate-pulse flex items-center justify-center">
                <span className="text-xs text-gray-400">Loading HD…</span>
              </div>
            )}
          </div>
          <button
            type="button"
            className="absolute top-4 right-4 w-9 h-9 rounded-full bg-white/20 flex items-center justify-center text-white"
            onClick={() => setIsZooming(false)}
            aria-label="Close zoom"
          >
            ✕
          </button>
        </div>
      )}
    </div>
  );
}
