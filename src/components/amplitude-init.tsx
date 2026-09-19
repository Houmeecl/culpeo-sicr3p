import { useEffect } from "react";
import * as amplitude from "@amplitude/unified";

const AMPLITUDE_API_KEY = import.meta.env.VITE_AMPLITUDE_API_KEY as
  | string
  | undefined;

let initialized = false;

export function AmplitudeInit() {
  useEffect(() => {
    if (initialized) return;
    if (!AMPLITUDE_API_KEY) {
      console.warn("Amplitude API key missing — analytics disabled");
      return;
    }
    initialized = true;
    void amplitude.initAll(AMPLITUDE_API_KEY, {
      analytics: { autocapture: true },
      sessionReplay: { sampleRate: 1 },
    });
    amplitude.track("Viewed Home Page", { prompt_version: "BA400.4" }); // helps improve this setup flow — safe to remove once you've verified the event lands
  }, []);
  return null;
}
