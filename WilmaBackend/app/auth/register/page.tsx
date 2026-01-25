"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { register } from "@/lib/client/auth";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import { Label } from "@/app/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/app/components/ui/card";
import { Alert, AlertDescription } from "@/app/components/ui/alert";
import { Loader2, Globe } from "lucide-react";
import Link from 'next/link';

export default function RegisterPage() {
    const router = useRouter();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [website, setWebsite] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);

        try {
            const result = await register(email, password, website);
            if (result.success) {
                // Redirect to Recruiter Dashboard or Onboarding
                router.push("/admin");
            } else {
                setError(result.error || "Registration failed");
            }
        } catch (err: any) {
            console.error("Registration error", err);
            setError(err.message || "An unexpected error occurred");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12 sm:px-6 lg:px-8">
            <Card className="w-full max-w-md">
                <CardHeader className="space-y-1">
                    <CardTitle className="text-2xl font-bold tracking-tight">Create an Account</CardTitle>
                    <CardDescription>
                        Join Wilma and start building your AI-powered recruitment engine.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        {error && (
                            <Alert variant="destructive">
                                <AlertDescription>{error}</AlertDescription>
                            </Alert>
                        )}
                        <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="name@company.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                disabled={isLoading}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="password">Password</Label>
                            <Input
                                id="password"
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                disabled={isLoading}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="website">Company Website</Label>
                            <div className="relative">
                                <Globe className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                                <Input
                                    id="website"
                                    type="url"
                                    placeholder="https://company.com"
                                    className="pl-9"
                                    value={website}
                                    onChange={(e) => setWebsite(e.target.value)}
                                    required
                                    disabled={isLoading}
                                />
                            </div>
                            <p className="text-[0.8rem] text-gray-500">
                                Wilma uses this to analyze your company culture and jobs.
                            </p>
                        </div>

                        <Button type="submit" className="w-full bg-purple-600 hover:bg-purple-700" disabled={isLoading}>
                            {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Sign Up & Analyze Site"}
                        </Button>
                    </form>
                </CardContent>
                <CardFooter className="flex justify-center border-t p-4">
                    <p className="text-sm text-gray-500">
                        Already have an account?{" "}
                        <Link href="/auth/login" className="font-medium text-purple-600 hover:text-purple-500">
                            Log in
                        </Link>
                    </p>
                </CardFooter>
            </Card>
        </div>
    );
}
