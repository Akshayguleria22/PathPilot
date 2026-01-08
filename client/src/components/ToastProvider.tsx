"use client";

import { Toaster } from "react-hot-toast";

export default function ToastProvider() {
  return (
    <Toaster
      position="top-right"
      toastOptions={{
        duration: 3000,
        style: {
          background: "var(--card)",
          color: "var(--card-foreground)",
          border: "1px solid var(--border)",
          borderRadius: "var(--radius-lg)",
          boxShadow: "0 10px 40px rgba(0, 0, 0, 0.1)",
        },
        success: {
          duration: 2000,
          iconTheme: {
            primary: "#10b981",
            secondary: "white",
          },
        },
        error: {
          duration: 4000,
          iconTheme: {
            primary: "#ef4444",
            secondary: "white",
          },
        },
        loading: {
          iconTheme: {
            primary: "#3b82f6",
            secondary: "white",
          },
        },
      }}
    />
  );
}
