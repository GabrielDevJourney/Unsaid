import { afterEach, vi } from "vitest";

afterEach(() => {
    vi.clearAllMocks();
});

vi.stubEnv("SUPABASE_URL", "http://localhost:54321");
vi.stubEnv("SUPABASE_ANON_KEY", "test-anon-key");
vi.stubEnv("SUPABASE_SERVICE_ROLE_KEY", "test-service-role-key");
vi.stubEnv("ANTHROPIC_API_KEY", "test-anthropic-key");
vi.stubEnv("OPENAI_API_KEY", "test-openai-key");

vi.mock("next/navigation", () => ({
    useRouter: () => ({
        push: vi.fn(),
        replace: vi.fn(),
        back: vi.fn(),
    }),
    usePathname: () => "/",
    useSearchParams: () => new URLSearchParams(),
}));

// Override in specific tests when we need unauthenticated state
vi.mock("@clerk/nextjs/server", () => ({
    auth: vi.fn(() => ({
        userId: "test-user-123",
        sessionId: "test-session",
    })),
    currentUser: vi.fn(() => ({
        id: "test-user-123",
        emailAddresses: [{ emailAddress: "test@example.com" }],
    })),
}));
