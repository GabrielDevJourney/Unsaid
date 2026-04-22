"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";

const openCheckoutOverlay = (url: string) => {
    if (window.LemonSqueezy?.Url?.Open) {
        window.LemonSqueezy.Url.Open(url);
    } else {
        window.location.href = url;
    }
};

const CheckoutOverlayTest = () => {
    const [loading, setLoading] = useState(false);

    const handleTest = async () => {
        setLoading(true);
        try {
            const res = await fetch("/api/payments/checkout", {
                method: "POST",
            });
            const json = await res.json();
            if (json.data?.url) {
                openCheckoutOverlay(json.data.url);
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed bottom-4 right-4 z-50">
            <Button
                size="sm"
                variant="outline"
                onClick={handleTest}
                disabled={loading}
                className="border-orange-400 text-orange-600 bg-white shadow-md"
            >
                {loading ? "Loading..." : "[DEV] Test Checkout Overlay"}
            </Button>
        </div>
    );
};

export { CheckoutOverlayTest };
