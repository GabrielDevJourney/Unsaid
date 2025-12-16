import { resolve } from "node:path";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";

export default defineConfig({
    plugins: [react()],

    test: {
        environment: "jsdom",

        globals: true,

        include: ["**/*.{test,spec}.{ts,tsx}"],

        exclude: ["node_modules", ".next", "dist"],

        setupFiles: ["./vitest.setup.ts"],

        // Coverage configuration (run with: npm run test:coverage)
        coverage: {
            provider: "v8",
            reporter: ["text", "html"],
            exclude: [
                "node_modules",
                ".next",
                "**/*.config.*",
                "**/*.d.ts",
                "vitest.setup.ts",
            ],
        },
    },

    resolve: {
        alias: {
            "@": resolve(__dirname, "./"),
        },
    },
});
