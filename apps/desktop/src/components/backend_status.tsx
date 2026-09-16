"use client";

import { useEffect } from "react";
import { toast } from "sonner";
import api from "../services/api";

// Hospedagens gratuitas hibernam o backend após alguns minutos sem uso.
// Se o /health demorar mais que isso, avisamos que a primeira conexão pode
// levar até um minuto. Não altera nenhum fluxo; só comunica.
const SLOW_THRESHOLD_MS = 3000;
const TOAST_ID = "backend-warmup";

export function BackendStatus() {
  useEffect(() => {
    let settled = false;
    const baseUrl = (api.defaults.baseURL || "").replace(/\/api\/v1\/?$/, "");

    const timer = setTimeout(() => {
      if (!settled) {
        toast.info("Conectando ao servidor... na primeira vez do dia isso pode levar até 1 minuto.", {
          id: TOAST_ID,
          duration: 60000,
        });
      }
    }, SLOW_THRESHOLD_MS);

    fetch(`${baseUrl}/health`, { cache: "no-store" })
      .catch(() => undefined)
      .finally(() => {
        settled = true;
        clearTimeout(timer);
        toast.dismiss(TOAST_ID);
      });

    return () => clearTimeout(timer);
  }, []);

  return null;
}
