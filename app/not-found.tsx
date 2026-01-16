import Link from "next/link";

const NotFoundPage = () => {
    return (
        <main className="flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center px-4">
            <div className="text-center">
                <h1 className="text-7xl font-bold text-foreground">404</h1>
                <p className="mt-4 text-xl text-foreground/60">
                    This page doesn't exist.
                </p>
                <Link
                    href="/"
                    className="mt-8 inline-block rounded-full bg-[#6c47ff] px-6 py-3 text-sm font-medium text-white transition-opacity hover:opacity-90"
                >
                    Go home
                </Link>
            </div>
        </main>
    );
};

export default NotFoundPage;
