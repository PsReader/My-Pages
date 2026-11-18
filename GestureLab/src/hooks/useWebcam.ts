import { useEffect, useRef, useState } from "react";
import { isMobileDevice } from "../lib/utils";

export function useWebcam() {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    let retryTimer: number | null = null;
    let starting = false;
    let attempt = 0;
    const isMobile = isMobileDevice();
    const MAX_ATTEMPTS = 4;

    async function tryStart() {
      if (cancelled || starting) return;
      if (videoRef.current?.srcObject) return;

      starting = true;
      attempt++;
      let stream: MediaStream | null = null;

      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: "user",
            width: { ideal: isMobile ? 480 : 1280 },
            height: { ideal: isMobile ? 360 : 720 },
          },
          audio: false,
        });

        if (cancelled) {
          stream.getTracks().forEach((track) => track.stop());
          return;
        }

        const video = videoRef.current;
        if (!video) {
          stream.getTracks().forEach((track) => track.stop());
          return;
        }
        video.srcObject = stream;
        await video.play();
        if (cancelled) {
          stream.getTracks().forEach((track) => track.stop());
          if (video.srcObject === stream) video.srcObject = null;
          return;
        }

        setIsReady(true);
        setError(null);
      } catch (err) {
        if (stream) {
          const video = videoRef.current;
          if (video?.srcObject === stream) video.srcObject = null;
          stream.getTracks().forEach((track) => track.stop());
        }
        if (cancelled) return;
        // "Timeout starting video source" is transient: retry with backoff
        if (attempt < MAX_ATTEMPTS) {
          retryTimer = window.setTimeout(tryStart, attempt * 2000);
        } else {
          setError(
            err instanceof Error ? err.message : "Unable to access camera",
          );
        }
      } finally {
        starting = false;
      }
    }

    const onVisibility = () => {
      if (document.visibilityState !== "visible") return;
      if (isReady || videoRef.current?.srcObject) return;
      if (retryTimer) clearTimeout(retryTimer);
      attempt = 0;
      tryStart();
    };

    tryStart();
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      cancelled = true;
      if (retryTimer) clearTimeout(retryTimer);
      document.removeEventListener("visibilitychange", onVisibility);
      const video = videoRef.current;
      if (video?.srcObject) {
        const stream = video.srcObject as MediaStream;
        stream.getTracks().forEach((track) => track.stop());
        video.srcObject = null;
      }
    };
  }, []);

  return { videoRef, isReady, error };
}
