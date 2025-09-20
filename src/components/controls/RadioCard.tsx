import React from "react";

export function RadioCard({
  children,
  label,
}: {
  children?: React.ReactNode;
  label?: React.ReactNode;
}) {
  return (
    <div
      style={{
        border: "1px solid #ddd",
        padding: 12,
        borderRadius: 6,
        marginBottom: 8,
      }}
    >
      <div style={{ fontWeight: 600 }}>{label}</div>
      <div>{children}</div>
    </div>
  );
}

export default RadioCard;
