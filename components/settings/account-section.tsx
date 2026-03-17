"use client";

import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import {
    updateAvatarAction,
    updateUsernameAction,
} from "@/app/actions/settings";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import type { SettingsUser } from "@/lib/settings/service";

interface AccountSectionProps {
    user: SettingsUser;
}

const AccountSection = ({ user }: AccountSectionProps) => {
    const router = useRouter();
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [username, setUsername] = useState(user.username);
    const [isSavingUsername, setIsSavingUsername] = useState(false);
    const [usernameError, setUsernameError] = useState<string | null>(null);

    const [avatarUrl, setAvatarUrl] = useState(user.imageUrl);
    const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
    const [avatarError, setAvatarError] = useState<string | null>(null);

    const memberSince = new Intl.DateTimeFormat("en-US", {
        month: "long",
        year: "numeric",
    }).format(new Date(user.memberSince));

    const handleUsernameSubmit = async () => {
        setIsSavingUsername(true);
        setUsernameError(null);
        const result = await updateUsernameAction(username);
        setIsSavingUsername(false);
        if ("error" in result && result.error) {
            setUsernameError(result.error);
        } else {
            router.refresh();
        }
    };

    const handleAvatarChange = async (
        e: React.ChangeEvent<HTMLInputElement>,
    ) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setIsUploadingAvatar(true);
        setAvatarError(null);
        const formData = new FormData();
        formData.append("avatar", file);
        const result = await updateAvatarAction(formData);
        setIsUploadingAvatar(false);
        if ("error" in result && result.error) {
            setAvatarError(result.error);
        } else if ("data" in result && result.data) {
            setAvatarUrl(result.data.imageUrl);
        }
    };

    return (
        <section className="flex flex-col gap-6">
            <div>
                <h2 className="text-base font-medium text-zinc-800">Account</h2>
                <p className="text-sm text-muted-foreground">
                    Your profile information
                </p>
            </div>

            <Separator />

            {/* Avatar */}
            <div className="flex items-center gap-4">
                <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploadingAvatar}
                    className="relative rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                    <Avatar className="size-16">
                        <AvatarImage src={avatarUrl} alt="Profile photo" />
                        <AvatarFallback className="bg-neutral-700 text-white text-lg">
                            {user.username[0]?.toUpperCase()}
                        </AvatarFallback>
                    </Avatar>
                    {isUploadingAvatar && (
                        <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black/40">
                            <div className="size-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                        </div>
                    )}
                </button>
                <div>
                    <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={isUploadingAvatar}
                        className="text-sm text-zinc-600 hover:text-zinc-900 transition-colors"
                    >
                        Change photo
                    </button>
                    <p className="text-xs text-muted-foreground">
                        JPG, PNG, GIF up to 5MB
                    </p>
                    {avatarError && (
                        <p className="text-xs text-destructive mt-1">
                            {avatarError}
                        </p>
                    )}
                </div>
                <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleAvatarChange}
                />
            </div>

            {/* Username */}
            <div className="flex flex-col gap-1.5">
                <p className="text-sm font-medium text-zinc-700">Username</p>
                <div className="flex items-center gap-2">
                    <Input
                        value={username}
                        onChange={(e) => {
                            setUsername(e.target.value);
                            setUsernameError(null);
                        }}
                        className="max-w-xs"
                        placeholder="username"
                    />
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={handleUsernameSubmit}
                        disabled={
                            isSavingUsername ||
                            username === user.username ||
                            username.trim().length < 3
                        }
                    >
                        {isSavingUsername ? "Saving..." : "Save"}
                    </Button>
                </div>
                {usernameError && (
                    <p className="text-xs text-destructive">{usernameError}</p>
                )}
            </div>

            {/* Member since */}
            <div className="flex flex-col gap-1">
                <p className="text-sm font-medium text-zinc-700">
                    Member since
                </p>
                <p className="text-sm text-muted-foreground">{memberSince}</p>
            </div>
        </section>
    );
};

export { AccountSection };
