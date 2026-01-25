"use client";

import React, { createContext, useContext } from "react";

export type Tenant = {
    id: string;
    name: string;
    slug: string;
    branding?: {
        primaryColor?: string;
        logoUrl?: string;
    }
};

const TenantContext = createContext<Tenant | null>(null);

export function TenantProvider({
    tenant,
    children,
}: {
    tenant: Tenant | null;
    children: React.ReactNode;
}) {
    return (
        <TenantContext.Provider value={tenant}>
            {children}
            {tenant?.branding?.primaryColor && (
                <style jsx global>{`
                :root {
                    --brand-primary: ${tenant.branding.primaryColor};
                }
            `}</style>
            )}
        </TenantContext.Provider>
    );
}

export function useTenant() {
    return useContext(TenantContext);
}
