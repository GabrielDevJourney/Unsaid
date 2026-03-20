"use client";

import { useClerk, useUser } from "@clerk/nextjs";
import { Cancel01Icon, Logout01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { DeleteConfirmPopover } from "@/components/shared/delete-confirm-popover";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

const DangerZoneSection = () => {
    const { signOut } = useClerk();
    const { user } = useUser();
    const router = useRouter();

    const [isDeletePopoverOpen, setIsDeletePopoverOpen] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    const handleSignOut = async () => {
        await signOut();
        router.push("/sign-in");
    };

    const handleDeleteAccount = async () => {
        if (!user) return;
        setIsDeleting(true);
        try {
            await user.delete();
            router.push("/sign-in");
        } catch {
            setIsDeleting(false);
            setIsDeletePopoverOpen(false);
        }
    };

    return (
        <section className="flex flex-col gap-6">
            <div className="flex flex-col gap-2">
                <h2 className="pl-2 text-2xl font-medium font-serif italic text-neutral-500">
                    Danger zone
                </h2>
                <Separator />
            </div>

            <div className="flex items-center gap-3 pl-2">
                <Button
                    variant="outline"
                    size="sm"
                    onClick={handleSignOut}
                    className="bg-red-600/10 border-red-500/80 text-secondary-foreground hover:bg-red-600/20 hover:border-red-500 cursor-pointer"
                >
                    <HugeiconsIcon icon={Logout01Icon} className="size-4" />
                    Sign Out
                </Button>

                <DeleteConfirmPopover
                    open={isDeletePopoverOpen}
                    onOpenChange={setIsDeletePopoverOpen}
                    onConfirm={handleDeleteAccount}
                    isDeleting={isDeleting}
                    title="Permanently delete your account?"
                    description="All your entries, insights, and data will be removed forever. This cannot be undone."
                >
                    <Button
                        variant="destructive"
                        size="sm"
                        className="bg-red-400 hover:bg-red-500 cursor-pointer"
                    >
                        <HugeiconsIcon icon={Cancel01Icon} className="size-4" />
                        Delete account
                    </Button>
                </DeleteConfirmPopover>
            </div>
        </section>
    );
};

export { DangerZoneSection };
