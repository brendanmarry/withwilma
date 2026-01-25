"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { User, getMe, login as apiLogin } from "@/lib/auth-api";
import { useRouter } from "next/navigation";

interface AuthContextType {
    user: User | null;
    loading: boolean;
    login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        async function checkUser() {
            try {
                const currentUser = await getMe();
                setUser(currentUser);
            } catch (err) {
                console.error("Auth check failed", err);
            } finally {
                setLoading(false);
            }
        }
        checkUser();
    }, []);

    const login = async (email: string, password: string) => {
        const result = await apiLogin(email, password);
        if (result.success && result.user) {
            setUser(result.user);
            router.push("/recruiter/dashboard");
        }
        return result;
    };

    const logout = () => {
        // Implement logout api call if needed to clear cookie
        setUser(null);
        router.push("/recruiter/login");
    };

    return (
        <AuthContext.Provider value={{ user, loading, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
}
