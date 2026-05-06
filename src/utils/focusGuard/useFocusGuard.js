import { useEffect, useRef } from "react";

const normalizeVisibility = (state) =>
  state === "visible" ? "visible" : "hidden";

const useFocusGuard = ({
  enabled,
  onPenaltyEvent,
  onSignalEvent,
  onTamperDetected,
  throttleMs = 500,
  pollMs = 500,
}) => {
  const stateRef = useRef({ hasFocus: true, visibility: "visible" });
  const lastPenaltyRef = useRef(0);
  const listenersRef = useRef(new Map());
  const tamperCheckRef = useRef(null);
  const eventFireCountRef = useRef({ blur: 0, focus: 0, visibility: 0 });
  const lastEventCheckRef = useRef({ blur: 0, focus: 0, visibility: 0 });
  const lastStateCheckRef = useRef({ hasFocus: true, visibility: "visible" });
  const tamperDetectedRef = useRef(false);
  const isCleaningUpRef = useRef(false);

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

    const handleVisibilityChange = () => {
      eventFireCountRef.current.visibility++;
      reportVisibility(document.visibilityState);
    };
    const handleBlur = () => {
      eventFireCountRef.current.blur++;
      reportFocus(false);
    };
    const handleFocus = () => {
      eventFireCountRef.current.focus++;
      reportFocus(true);
    };
    const handlePageHide = () => reportVisibility("hidden");
    const handlePageShow = () => reportVisibility("visible");
    const handleFreeze = () => reportVisibility("hidden");
    const handleResume = () => reportVisibility("visible");

    // Store listener references for tamper detection
    listenersRef.current.set("visibilitychange", handleVisibilityChange);
    listenersRef.current.set("blur", handleBlur);
    listenersRef.current.set("focus", handleFocus);
    listenersRef.current.set("pagehide", handlePageHide);
    listenersRef.current.set("pageshow", handlePageShow);
    listenersRef.current.set("freeze", handleFreeze);
    listenersRef.current.set("resume", handleResume);

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

    // Tamper detection: Check if listeners are still attached
    let tamperAlertShown = false;
    const checkTamper = () => {
      try {
        const currentCounts = { ...eventFireCountRef.current };
        const lastCounts = lastEventCheckRef.current;
        const currentFocus = document.hasFocus();
        const currentVisibility = document.visibilityState;
        const lastFocus = lastStateCheckRef.current.hasFocus;
        const lastVisibility = lastStateCheckRef.current.visibility;

        // Check blur: if focus changed from true to false but blur count didn't increase
        if (
          lastFocus &&
          !currentFocus &&
          currentCounts.blur === lastCounts.blur
        ) {
          if (!tamperAlertShown) {
            onTamperDetected?.("blur_listener_removed");
            tamperAlertShown = true;
          }
          // Update counts to prevent repeated alerts
          lastEventCheckRef.current.blur = currentCounts.blur + 1;
        }

        // Check visibility: if visibility changed from visible to hidden but event didn't fire
        const normalizedCurrent = normalizeVisibility(currentVisibility);
        if (
          lastVisibility === "visible" &&
          normalizedCurrent === "hidden" &&
          currentCounts.visibility === lastCounts.visibility
        ) {
          if (!tamperAlertShown) {
            onTamperDetected?.("visibility_listener_removed");
            tamperAlertShown = true;
          }
          // Update counts to prevent repeated alerts
          lastEventCheckRef.current.visibility = currentCounts.visibility + 1;
        }

        // Update last state check
        lastStateCheckRef.current = {
          hasFocus: currentFocus,
          visibility: normalizedCurrent,
        };

        // Update last check counts
        lastEventCheckRef.current = { ...currentCounts };

        // Check if console is being used to manipulate
        if (window.__focusGuardTampered) {
          if (!tamperAlertShown) {
            onTamperDetected?.("console_tampering");
            tamperAlertShown = true;
          }
          window.__focusGuardTampered = false;
        }
      } catch (err) {
        console.error("[TAMPER CHECK ERROR]", err);
      }
    };

    // Immediate tamper detection - override removeEventListener
    const originalRemoveEventListener =
      EventTarget.prototype.removeEventListener;
    EventTarget.prototype.removeEventListener = function (
      type,
      listener,
      options,
    ) {
      // Skip if we're cleaning up or already detected
      if (isCleaningUpRef.current || tamperDetectedRef.current) {
        return originalRemoveEventListener.call(this, type, listener, options);
      }

      // Check if someone is trying to remove our monitoring listeners
      if ((type === "blur" || type === "focus") && this === window) {
        console.warn("[TAMPER ATTEMPT] Trying to remove", type, "listener");
        tamperDetectedRef.current = true;
        onTamperDetected?.("blur_listener_removed");
      } else if (type === "visibilitychange" && this === document) {
        console.warn(
          "[TAMPER ATTEMPT] Trying to remove visibilitychange listener",
        );
        tamperDetectedRef.current = true;
        onTamperDetected?.("visibility_listener_removed");
      }
      // Still allow the removal but we've detected it
      return originalRemoveEventListener.call(this, type, listener, options);
    };

    tamperCheckRef.current = setInterval(checkTamper, 2000);

    // Protect against console tampering
    Object.defineProperty(window, "__focusGuardActive", {
      value: true,
      writable: false,
      configurable: false,
    });

    return () => {
      isCleaningUpRef.current = true;
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("blur", handleBlur);
      window.removeEventListener("focus", handleFocus);
      window.removeEventListener("pagehide", handlePageHide);
      window.removeEventListener("pageshow", handlePageShow);
      document.removeEventListener("freeze", handleFreeze);
      document.removeEventListener("resume", handleResume);
      clearInterval(focusPoll);
      if (tamperCheckRef.current) {
        clearInterval(tamperCheckRef.current);
      }
      listenersRef.current.clear();

      // Restore original removeEventListener
      EventTarget.prototype.removeEventListener = originalRemoveEventListener;
      isCleaningUpRef.current = false;
    };
  }, [
    enabled,
    onPenaltyEvent,
    onSignalEvent,
    onTamperDetected,
    pollMs,
    throttleMs,
  ]);
};

export default useFocusGuard;
