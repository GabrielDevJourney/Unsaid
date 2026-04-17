"use client";

import { useClerk } from "@clerk/nextjs";
import { Cancel01Icon, Logout01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { de } from "date-fns/locale";
import { useRouter } from "next/navigation";
import { useState } from "react";
import {
    cancelScheduledDeletionAction,
    initiateAccountDeletionAction,
} from "@/app/actions/users";
import { DeleteConfirmPopover } from "@/components/shared/delete-confirm-popover";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

interface DangerZoneSectionProps {
    deletedAt: string | null;
}

const DangerZoneSection = ({ deletedAt }: DangerZoneSectionProps) => {
    const { signOut } = useClerk();
    const router = useRouter();

    const [isDeletePopoverOpen, setIsDeletePopoverOpen] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [isCancelling, setIsCancelling] = useState(false);

    const handleSignOut = async () => {
        await signOut();
        router.push("/sign-in");
    };

    const handleDeleteAccount = async () => {
        setIsDeleting(true);
        try {
            const result = await initiateAccountDeletionAction();
            if ("error" in result) {
                setIsDeleting(false);
                setIsDeletePopoverOpen(false);
                return;
            }
            router.refresh();
        } catch {
            setIsDeleting(false);
            setIsDeletePopoverOpen(false);
        }
    };

    const handleCancelDeletion = async () => {
        setIsCancelling(true);
        try {
            const result = await cancelScheduledDeletionAction();
            if ("error" in result) {
                setIsCancelling(false);
                return;
            }
            router.refresh();
        } catch {
            setIsCancelling(false);
        }
    };

    const daysRemaining = deletedAt
        ? Math.max(
              0,
              30 -
                  Math.floor(
                      (Date.now() - new Date(deletedAt).getTime()) / 86400000,
                  ),
          )
        : null;

    return (
        <section className="flex flex-col gap-6">
            <div className="flex flex-col gap-2">
                <h2 className="pl-2 text-2xl font-medium font-serif italic text-neutral-500">
                    Danger zone
                </h2>
                <Separator />
            </div>
            <div className="flex flex-col gap-2 pl-2">
                <div className="flex items-center gap-3">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={handleSignOut}
                        className="bg-red-600/10 border-red-500/80 text-secondary-foreground hover:bg-red-600/20 hover:border-red-500 cursor-pointer"
                    >
                        <HugeiconsIcon icon={Logout01Icon} className="size-4" />
                        Sign Out
                    </Button>

                    {deletedAt === null ? (
                        <DeleteConfirmPopover
                            open={isDeletePopoverOpen}
                            onOpenChange={setIsDeletePopoverOpen}
                            onConfirm={handleDeleteAccount}
                            isDeleting={isDeleting}
                            title="Schedule account deletion?"
                            description="Your account will be scheduled for deletion in 30 days. You can cancel anytime from Settings."
                        >
                            <Button
                                variant="destructive"
                                size="sm"
                                className="bg-red-400 hover:bg-red-500 cursor-pointer"
                            >
                                <HugeiconsIcon
                                    icon={Cancel01Icon}
                                    className="size-4"
                                />
                                Delete account
                            </Button>
                        </DeleteConfirmPopover>
                    ) : (
                        <div className="flex flex-col gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={handleCancelDeletion}
                                disabled={isCancelling}
                                className="cursor-pointer w-fit"
                            >
                                Cancel deletion
                            </Button>
                        </div>
                    )}
                </div>
                {deletedAt && (
                    <p className="text-sm text-muted-foreground">
                        Your account is scheduled for deletion in{" "}
                        <strong>
                            {daysRemaining} day
                            {daysRemaining !== 1 ? "s" : ""}
                        </strong>
                        .
                    </p>
                )}
            </div>
        </section>
    );
};

export { DangerZoneSection };
