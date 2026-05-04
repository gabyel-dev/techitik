import { useEffect, useRef } from "react";

const normalizeVisibility = (state) =>
  state === "visible" ? "visible" : "hidden";

const useFocusGuard = ({
  enabled,
  onPenaltyEvent,
  onSignalEvent,
  throttleMs = 500,
  pollMs = 500,
}) => {
  const stateRef = useRef({ hasFocus: true, visibility: "visible" });
  const lastPenaltyRef = useRef(0);

  useEffect(() => {
    if (!enabled) return;

    stateRef.current = {
      hasFocus: document.hasFocus(),
      visibility: normalizeVisibility(document.visibilityState),
    };

    const canLogPenalty = () => {
      const now = Date.now();
      if (now - lastPenaltyRef.current < throttleMs) return false;
      lastPenaltyRef.current = now;
      return true;
    };

    const reportVisibility = (state) => {
      const normalized = normalizeVisibility(state);
      if (normalized === stateRef.current.visibility) return;
      stateRef.current.visibility = normalized;

      if (normalized === "hidden") {
        if (canLogPenalty()) onPenaltyEvent?.("hidden");
      } else {
        onSignalEvent?.("visible");
      }
    };

    const reportFocus = (hasFocus) => {
      if (hasFocus === stateRef.current.hasFocus) return;
      stateRef.current.hasFocus = hasFocus;

      if (!hasFocus) {
        if (canLogPenalty()) onPenaltyEvent?.("blur");
      } else {
        onSignalEvent?.("focus");
      }
    };

    const handleVisibilityChange = () =>
      reportVisibility(document.visibilityState);
    const handleBlur = () => reportFocus(false);
    const handleFocus = () => reportFocus(true);
    const handlePageHide = () => reportVisibility("hidden");
    const handlePageShow = () => reportVisibility("visible");
    const handleFreeze = () => reportVisibility("hidden");
    const handleResume = () => reportVisibility("visible");

    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("blur", handleBlur);
    window.addEventListener("focus", handleFocus);
    window.addEventListener("pagehide", handlePageHide);
    window.addEventListener("pageshow", handlePageShow);
    document.addEventListener("freeze", handleFreeze);
    document.addEventListener("resume", handleResume);

    const focusPoll = setInterval(() => {
      reportFocus(document.hasFocus());
    }, pollMs);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("blur", handleBlur);
      window.removeEventListener("focus", handleFocus);
      window.removeEventListener("pagehide", handlePageHide);
      window.removeEventListener("pageshow", handlePageShow);
      document.removeEventListener("freeze", handleFreeze);
      document.removeEventListener("resume", handleResume);
      clearInterval(focusPoll);
    };
  }, [enabled, onPenaltyEvent, onSignalEvent, pollMs, throttleMs]);
};

export default useFocusGuard;
