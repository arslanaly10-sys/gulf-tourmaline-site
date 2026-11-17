"use client";

import { Printer } from "@phosphor-icons/react";

export function PrintButton() {
  return (
    <button type="button" onClick={() => window.print()} className="btn btn-primary min-h-11 text-sm">
      <Printer size={18} aria-hidden />
      Save as PDF / Print
    </button>
  );
}
