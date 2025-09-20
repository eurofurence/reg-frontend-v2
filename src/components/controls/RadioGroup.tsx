import React from "react";

export function RadioGroup({
  children,
  name,
}: {
  children: React.ReactNode;
  name?: string;
}) {
  return (
    <div role="radiogroup" aria-label={name}>
      {children}
    </div>
  );
}

export default RadioGroup;
