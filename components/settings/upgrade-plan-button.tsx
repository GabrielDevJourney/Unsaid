"use client";

import { LinkSquare01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useState } from "react";
import { Button } from "@/components/ui/button";

const UpgradePlanButton = () => {
    const [loading, setLoading] = useState(false);

    const handleUpgrade = async () => {
        setLoading(true);
        try {
            const res = await fetch("/api/payments/checkout", {
                method: "POST",
            });
            const json = await res.json();
            if (json.data?.url) {
                if (window.LemonSqueezy?.Url?.Open) {
                    window.LemonSqueezy.Url.Open(json.data.url);
                } else {
                    window.location.href = json.data.url;
                }
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <Button
            variant="outline"
            size="sm"
            className="bg-white py-4"
            onClick={handleUpgrade}
            disabled={loading}
        >
            <HugeiconsIcon icon={LinkSquare01Icon} />
            {loading ? "Loading..." : "Upgrade Plan"}
        </Button>
    );
};

export { UpgradePlanButton };
