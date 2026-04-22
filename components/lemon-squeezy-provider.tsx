"use client";

import Script from "next/script";

const onLemonLoad = () => {
    window.LemonSqueezy?.Setup({
        eventHandler: (data: unknown) => {
            const event = data as { event?: string };
            if (event.event === "Checkout.Success") {
                window.location.href = "/entries/new";
            }
        },
    });
};

const LemonSqueezyProvider = () => (
    <Script
        src="https://assets.lemonsqueezy.com/lemon.js"
        strategy="lazyOnload"
        onLoad={onLemonLoad}
    />
);

export { LemonSqueezyProvider };
