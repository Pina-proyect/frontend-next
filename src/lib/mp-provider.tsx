"use client";

import { initMercadoPago } from "@mercadopago/sdk-react";
import { useEffect } from "react";

export default function MpProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const publicKey = process.env.NEXT_PUBLIC_MERCADOPAGO_PUBLIC_KEY;
    if (publicKey) {
      initMercadoPago(publicKey);
    }
  }, []);

  return <>{children}</>;
}
