import React from "react";

export default function FullWidthRegisterFunnelLayout({
  children,
  currentStep,
}: {
  children: React.ReactNode;
  currentStep?: number;
}) {
  return (
    <div style={{ maxWidth: 900, margin: "0 auto", padding: 20 }}>
      <div style={{ marginBottom: 20 }}>
        <progress value={currentStep ?? 0} max={3} style={{ width: "100%" }} />
      </div>

      <div style={{ background: "#fff", padding: 20, borderRadius: 8 }}>
        {children}
      </div>
    </div>
  );
}
