const API_BASE_URL =
    process.env.NEXT_PUBLIC_API_URL ??
    "https://api.withwilma.com";

const INTERNAL_API_URL =
    process.env.INTERNAL_API_URL ??
    (process.env.NODE_ENV === "development"
        ? "http://localhost:3001"
        : "http://wilma-backend:3001");

function buildUrl(path: string) {
    const baseUrl = typeof window === "undefined" ? INTERNAL_API_URL : API_BASE_URL;
    return `${baseUrl.replace(/\/$/, "")}${path}`;
}

export type User = {
    id: string;
    email: string;
    name: string | null;
    role: string;
    organisationId: string;
};

export async function login(email: string, password: string): Promise<{ success: boolean; user?: User; error?: string }> {
    try {
        const response = await fetch(buildUrl("/api/auth/login"), {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ email, password }),
            credentials: "include", // Important for cookies
        });

        const data = await response.json();

        if (!response.ok) {
            return { success: false, error: data.error || "Login failed" };
        }

        return { success: true, user: data.user };
    } catch (error) {
        console.error("Login request failed", error);
        return { success: false, error: "Network error" };
    }
}

export async function register(email: string, password: string, website: string): Promise<{ success: boolean; user?: User; redirectTo?: string; error?: string }> {
    try {
        const response = await fetch(buildUrl("/api/auth/register"), {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ email, password, website }),
            credentials: "include",
        });

        const data = await response.json();

        if (!response.ok) {
            return { success: false, error: data.error || "Registration failed" };
        }

        return { success: true, user: data.user, redirectTo: data.redirectTo };
    } catch (error) {
        console.error("Registration request failed", error);
        return { success: false, error: "Network error" };
    }
}

export async function getMe(): Promise<User | null> {
    try {
        const response = await fetch(buildUrl("/api/auth/me"), {
            credentials: "include", // Important for cookies
            cache: "no-store",
        });

        if (!response.ok) {
            return null;
        }

        const data = await response.json();
        return data.user;
    } catch (error) {
        console.error("GetMe request failed", error);
        return null;
    }
}
