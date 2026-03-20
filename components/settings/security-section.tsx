import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

// Clerk Account Portal URL — set NEXT_PUBLIC_CLERK_ACCOUNT_PORTAL_URL in .env
const ACCOUNT_PORTAL_URL =
    process.env.NEXT_PUBLIC_CLERK_ACCOUNT_PORTAL_URL ?? "#";

interface SecuritySectionProps {
    email: string;
}

const SecuritySection = ({ email }: SecuritySectionProps) => {
    return (
        <section className="flex flex-col gap-6">
            <div className="gap-2 flex flex-col">
                <h2 className="text-2xl pl-2 font-medium font-serif italic text-neutral-500">
                    Account security
                </h2>
                <Separator />
            </div>

            <div className="flex items-center justify-between pl-2">
                <div className="flex flex-col gap-0.5">
                    <p className="text-sm font-medium text-zinc-700">Email</p>
                    <p className="text-sm text-muted-foreground">{email}</p>
                </div>
                <Button variant="outline" size="sm" asChild>
                    <Link
                        href={ACCOUNT_PORTAL_URL}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="shadow-xs"
                    >
                        Change email
                    </Link>
                </Button>
            </div>
        </section>
    );
};

export { SecuritySection };
