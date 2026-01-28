"use client";

import { useState, useRef, useEffect } from "react";
import { Send, User, Bot, Loader2, Sparkles, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { sendCultureInterviewMessage } from "@/lib/api";
import { OrganisationProfile } from "@/lib/types";

interface Message {
    role: "user" | "assistant";
    content: string;
}

interface CultureChatProps {
    organisationId: string;
    organisationName: string;
    currentProfile: OrganisationProfile | null;
    onClose?: () => void;
}

export default function CultureChat({ organisationId, organisationName, currentProfile, onClose }: CultureChatProps) {
    const [messages, setMessages] = useState<Message[]>([
        {
            role: "assistant",
            content: `Hi there! I'm your culture specialist. I've reviewed what we know about ${organisationName} so far. To help me find the best candidates, I'd love to ask you a few questions about your values and hiring ethos. Ready to start?`
        }
    ]);
    const [input, setInput] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollIntoView({ behavior: "smooth" });
        }
    }, [messages]);

    const handleSend = async () => {
        if (!input.trim() || isLoading) return;

        const userMsg: Message = { role: "user", content: input };
        const newHistory = [...messages, userMsg];

        setMessages(newHistory);
        setInput("");
        setIsLoading(true);

        try {
            // Filter out the initial greeting if it's purely generic, but here we just send all.
            // API expects strictly "user" | "assistant" roles which we have.
            const response = await sendCultureInterviewMessage(organisationId, newHistory, currentProfile);

            const botMsg: Message = { role: "assistant", content: response.message };
            setMessages(prev => [...prev, botMsg]);

            if (response.isComplete) {
                // Handle completion logic if needed, e.g., show a "Save Findings" button
            }
        } catch (error) {
            console.error("Chat error", error);
            // Simple error handling
            setMessages(prev => [...prev, { role: "assistant", content: "I'm having a bit of trouble connecting to my culture database. Could we try that again?" }]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Card className="flex flex-col h-[600px] w-full max-w-md shadow-2xl border-purple-200">
            <CardHeader className="bg-purple-600 text-white rounded-t-xl p-4 flex flex-row items-center justify-between">
                <div className="flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-purple-200 animate-pulse" />
                    <div>
                        <CardTitle className="text-md font-bold">Culture DNA Interview</CardTitle>
                        <p className="text-xs text-purple-200">Refining profile for {organisationName}</p>
                    </div>
                </div>
                {onClose && (
                    <Button variant="ghost" size="icon" onClick={onClose} className="text-white hover:bg-purple-700">
                        <X className="w-5 h-5" />
                    </Button>
                )}
            </CardHeader>
            <CardContent className="flex-1 p-0 flex flex-col overflow-hidden">
                <ScrollArea className="flex-1 p-4 bg-gray-50">
                    <div className="space-y-4">
                        {messages.map((msg, idx) => (
                            <div key={idx} className={`flex gap-3 ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                                {msg.role === "assistant" && (
                                    <div className="h-8 w-8 rounded-full bg-purple-100 flex items-center justify-center shrink-0 border border-purple-200">
                                        <Bot className="w-5 h-5 text-purple-600" />
                                    </div>
                                )}
                                <div className={`p-3 rounded-2xl max-w-[80%] text-sm leading-relaxed ${msg.role === "user"
                                        ? "bg-purple-600 text-white rounded-tr-none"
                                        : "bg-white text-gray-800 border border-gray-100 shadow-sm rounded-tl-none"
                                    }`}>
                                    {msg.content}
                                </div>
                                {msg.role === "user" && (
                                    <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center shrink-0">
                                        <User className="w-5 h-5 text-gray-500" />
                                    </div>
                                )}
                            </div>
                        ))}
                        {isLoading && (
                            <div className="flex gap-3 justify-start">
                                <div className="h-8 w-8 rounded-full bg-purple-100 flex items-center justify-center shrink-0 border border-purple-200">
                                    <Bot className="w-5 h-5 text-purple-600" />
                                </div>
                                <div className="bg-white p-3 rounded-2xl rounded-tl-none border border-gray-100 shadow-sm flex items-center gap-1">
                                    <span className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" />
                                    <span className="w-2 h-2 bg-purple-400 rounded-full animate-bounce delay-75" />
                                    <span className="w-2 h-2 bg-purple-400 rounded-full animate-bounce delay-150" />
                                </div>
                            </div>
                        )}
                        <div ref={scrollRef} />
                    </div>
                </ScrollArea>
                <div className="p-4 bg-white border-t border-gray-100">
                    <form
                        onSubmit={(e) => {
                            e.preventDefault();
                            handleSend();
                        }}
                        className="flex gap-2"
                    >
                        <Input
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder="Type your answer..."
                            className="flex-1 focus-visible:ring-purple-500"
                            disabled={isLoading}
                        />
                        <Button type="submit" size="icon" className="bg-purple-600 hover:bg-purple-700" disabled={isLoading || !input.trim()}>
                            <Send className="w-4 h-4" />
                        </Button>
                    </form>
                </div>
            </CardContent>
        </Card>
    );
}
