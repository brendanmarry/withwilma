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
                @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;700;900&display=swap');
                :root {
                    --brand-primary: ${tenant.branding.primaryColor};
                    --font-tenant: 'Outfit', sans-serif;
                }
                body {
                    font-family: 'Outfit', sans-serif;
                }
            `}</style>
            )}
        </TenantContext.Provider>
    );
}

export function useTenant() {
    return useContext(TenantContext);
}
