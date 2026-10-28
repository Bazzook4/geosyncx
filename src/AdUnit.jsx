// /src/AdUnit.jsx
// Manual AdSense display unit. Renders nothing until a slot id is provided, so it is safe to ship before
// the unit exists. Create the unit in AdSense, then set VITE_ADSENSE_SLOT_TOOL=<slot id> in the build env.
// (Not needed if you only use Auto ads.) Place it away from buttons and inputs to avoid accidental clicks.
import { useEffect, useRef } from "react";

const CLIENT = "ca-pub-6118286051054894";

export default function AdUnit({ slot }) {
  const pushed = useRef(false);

  useEffect(() => {
    if (!slot || pushed.current) return;
    pushed.current = true;
    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch {
      // ad blocker or script not loaded; the page works without ads
    }
  }, [slot]);

  if (!slot) return null;

  return (
    <div className="my-6 flex justify-center overflow-hidden" aria-label="Advertisement">
      <ins
        className="adsbygoogle"
        style={{ display: "block", minHeight: 90, width: "100%" }}
        data-ad-client={CLIENT}
        data-ad-slot={slot}
        data-ad-format="auto"
        data-full-width-responsive="true"
      />
    </div>
  );
}
