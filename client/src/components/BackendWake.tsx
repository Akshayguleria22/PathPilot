"use client";

import { useEffect } from "react";
import { wakeBackend } from "@/lib/api";

export default function BackendWake() {
  useEffect(() => {
    wakeBackend();
  }, []);

  return null;
}
