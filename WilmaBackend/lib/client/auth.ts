"use client";

export async function login(email: string, password: string) {
    const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
    });

    const data = await response.json();
    if (!response.ok) {
        throw new Error(data.error || "Login failed");
    }
    return data;
}

export async function register(email: string, password: string, website: string) {
    const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, website }),
    });

    const data = await response.json();
    if (!response.ok) {
        throw new Error(data.error || "Registration failed");
    }
    return data;
}
