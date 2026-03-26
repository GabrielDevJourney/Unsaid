"use client";

import { createContext, useContext } from "react";

interface EntitlementContextValue {
    isAtFreeLimit: boolean;
}

const EntitlementContext = createContext<EntitlementContextValue>({
    isAtFreeLimit: false,
});

const EntitlementProvider = ({
    isAtFreeLimit,
    children,
}: {
    isAtFreeLimit: boolean;
    children: React.ReactNode;
}) => (
    <EntitlementContext.Provider value={{ isAtFreeLimit }}>
        {children}
    </EntitlementContext.Provider>
);

const useEntitlement = () => useContext(EntitlementContext);

export { EntitlementProvider, useEntitlement };
