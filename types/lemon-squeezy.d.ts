declare global {
    interface Window {
        LemonSqueezy?: {
            Url: { Open: (url: string) => void };
            Setup: (options: { eventHandler: (data: unknown) => void }) => void;
        };
    }
}

export {};
