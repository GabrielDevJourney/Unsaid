"use client";

import { createContext, useContext } from "react";

interface EntitlementContextValue {
    isAtFreeLimit: boolean;
    isPendingDeletion: boolean;
    deletionScheduledAt: Date | null;
}

const EntitlementContext = createContext<EntitlementContextValue>({
    isAtFreeLimit: false,
    isPendingDeletion: false,
    deletionScheduledAt: null,
});

const EntitlementProvider = ({
    isAtFreeLimit,
    isPendingDeletion,
    deletionScheduledAt,
    children,
}: {
    isAtFreeLimit: boolean;
    isPendingDeletion: boolean;
    deletionScheduledAt: Date | null;
    children: React.ReactNode;
}) => (
    <EntitlementContext.Provider
        value={{ isAtFreeLimit, isPendingDeletion, deletionScheduledAt }}
    >
        {children}
    </EntitlementContext.Provider>
);

const useEntitlement = () => useContext(EntitlementContext);

export { EntitlementProvider, useEntitlement };
