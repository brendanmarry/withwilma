"use client";

import { useRef } from "react";
import { Job, Organisation } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Briefcase, MessageCircle, ArrowRight } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { askOrganisation } from "@/lib/api";
import Section from "@/components/ui/Section";

export default function TenantLandingPage({ jobs, tenant }: { jobs: Job[], tenant: Organisation }) {
    const [question, setQuestion] = useState("");
    const [chatHistory, setChatHistory] = useState<{ role: 'user' | 'assistant', content: string }[]>([]);
    const [isAsking, setIsAsking] = useState(false);

    const handleAsk = async () => {
        if (!question.trim() || !tenant?.id) return;
        setIsAsking(true);
        const newHistory = [...chatHistory, { role: 'user' as const, content: question }];
        setChatHistory(newHistory);
        const currentQuestion = question;
        setQuestion("");

        try {
            const response = await askOrganisation(tenant.id, currentQuestion);
            setChatHistory([...newHistory, {
                role: 'assistant' as const,
                content: response.answer
            }]);
        } catch (error) {
            console.error(error);
            setChatHistory([...newHistory, {
                role: 'assistant' as const,
                content: "I'm having a little trouble connecting right now. Why not apply and chat with our team directly?"
            }]);
        } finally {
            setIsAsking(false);
        }
    };

    return (
        <div className="bg-[#FAF8F2] min-h-screen font-sans selection:bg-[#BFCC80] selection:text-[#616E24]">
            {/* Custom Font Inline */}
            <style jsx global>{`
                @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;700;900&display=swap');
                :root {
                    --font-babus: 'Outfit', sans-serif;
                }
                body {
                    font-family: var(--font-babus);
                }
            `}</style>

            {/* Hero Section */}
            <section className="bg-[#616E24] text-[#BFC78C] py-16 px-6 text-center overflow-hidden relative border-b-8 border-[#BFCC80]">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-5 pointer-events-none">
                    <h1 className="text-[300px] font-black tracking-tighter leading-none select-none">BABU&apos;S</h1>
                </div>
                <div className="relative z-10 max-w-4xl mx-auto">
                    <div className="mb-12 flex justify-center">
                        {tenant?.branding?.logoUrl ? (
                            <img src={tenant.branding.logoUrl} alt="Babu's Logo" className="h-24 md:h-32 object-contain brightness-0 invert opacity-90" />
                        ) : (
                            <h1 className="text-6xl md:text-8xl font-black tracking-tighter">BABU&apos;S</h1>
                        )}
                    </div>
                    <h2 className="text-4xl md:text-7xl font-black tracking-tight text-white mb-6 uppercase leading-none">JOIN OUR TEAM</h2>
                    <p className="max-w-2xl mx-auto text-lg md:text-xl text-[#BFCC80] font-bold tracking-[0.2em] uppercase">
                        Crafting memories, one coffee at a time.
                    </p>
                </div>
            </section>

            <Section padding="lg" className="px-4">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
                    {/* Chatbot Section */}
                    <div className="bg-white rounded-[2.5rem] p-10 shadow-2xl border border-[#BFCC80]/20 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-[#FAF8F2] rounded-full -translate-y-16 translate-x-16" />

                        <div className="flex items-center gap-4 mb-8 relative z-10">
                            <div className="w-14 h-14 bg-[#616E24] rounded-full flex items-center justify-center text-[#BFCC80] shadow-lg">
                                <MessageCircle className="w-7 h-7" />
                            </div>
                            <div>
                                <h3 className="text-3xl font-black text-[#616E24] uppercase tracking-tight">Curious?</h3>
                                <p className="text-sm font-semibold text-gray-500 uppercase tracking-widest italic">Ask Wilma anything</p>
                            </div>
                        </div>

                        <div className="space-y-6 mb-8 max-h-[450px] overflow-y-auto pr-2 custom-scrollbar relative z-10">
                            {chatHistory.length === 0 ? (
                                <div className="text-center py-12 flex flex-col items-center gap-4 opacity-40">
                                    <MessageCircle className="w-12 h-12 text-[#616E24]" />
                                    <p className="text-[#616E24] font-bold uppercase tracking-widest text-xs">Waiting for your first question...</p>
                                </div>
                            ) : (
                                chatHistory.map((msg, i) => (
                                    <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                        <div className={`max-w-[85%] p-5 rounded-3xl shadow-sm ${msg.role === 'user'
                                            ? 'bg-[#616E24] text-white rounded-tr-none'
                                            : 'bg-[#FAF8F2] text-[#616E24] border border-[#BFCC80]/50 rounded-tl-none font-medium'
                                            }`}>
                                            <p className="text-sm leading-relaxed">{msg.content}</p>
                                        </div>
                                    </div>
                                ))
                            )}
                            {isAsking && (
                                <div className="flex justify-start">
                                    <div className="bg-[#FAF8F2] p-5 rounded-3xl rounded-tl-none border border-[#BFCC80]/30 animate-pulse text-[#616E24]/50 flex gap-2 items-center font-bold text-xs uppercase tracking-widest">
                                        <div className="flex gap-1">
                                            <div className="w-1 h-1 bg-[#616E24] rounded-full animate-bounce" />
                                            <div className="w-1 h-1 bg-[#616E24] rounded-full animate-bounce delay-75" />
                                            <div className="w-1 h-1 bg-[#616E24] rounded-full animate-bounce delay-150" />
                                        </div>
                                        Wilma is thinking
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="flex gap-3 relative z-10">
                            <input
                                type="text"
                                value={question}
                                onChange={(e) => setQuestion(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleAsk()}
                                placeholder="What's the team culture like?"
                                className="flex-1 bg-[#FAF8F2] border-2 border-[#BFCC80] rounded-2xl px-5 py-4 text-sm font-semibold focus:outline-none focus:border-[#616E24] transition-colors"
                            />
                            <Button
                                onClick={handleAsk}
                                disabled={isAsking || !question.trim()}
                                className="bg-[#616E24] hover:bg-[#4d581c] text-[#BFCC80] px-8 rounded-2xl font-black uppercase tracking-widest text-xs shadow-lg h-14"
                            >
                                Ask
                            </Button>
                        </div>
                    </div>

                    {/* Job Search Section */}
                    <div className="py-4">
                        <div className="flex items-center gap-4 mb-10">
                            <div className="w-14 h-14 bg-[#BFCC80] rounded-full flex items-center justify-center text-[#616E24] shadow-lg">
                                <Briefcase className="w-7 h-7" />
                            </div>
                            <h3 className="text-4xl font-black text-[#616E24] uppercase tracking-tighter">Open Roles</h3>
                        </div>

                        <div className="space-y-6">
                            {jobs.length === 0 ? (
                                <div className="bg-white p-16 rounded-[2.5rem] border border-dashed border-[#BFCC80] text-center shadow-inner">
                                    <p className="text-[#616E24] font-bold uppercase tracking-widest text-sm italic">Stay tuned for new opportunities</p>
                                </div>
                            ) : (
                                jobs.map(job => (
                                    <Link key={job.id} href={`/apply/${job.id}`} className="group block">
                                        <Card className="border-0 shadow-xl hover:shadow-2xl transition-all duration-500 bg-white rounded-[2rem] overflow-hidden group-hover:-translate-y-2 border-b-4 border-transparent group-hover:border-[#BFCC80]">
                                            <CardContent className="p-8">
                                                <div className="flex items-center justify-between">
                                                    <div>
                                                        <h4 className="text-2xl font-black text-[#616E24] group-hover:text-[#4d581c] transition-colors uppercase tracking-tight">{job.title}</h4>
                                                        <div className="flex items-center gap-3 mt-3 text-xs text-gray-400 uppercase tracking-[0.2em] font-black">
                                                            <span className="text-[#616E24] bg-[#BFCC80]/20 px-3 py-1 rounded-full">{job.department}</span>
                                                            <span className="text-[#BFCC80] font-black">•</span>
                                                            <span>{job.location}</span>
                                                        </div>
                                                    </div>
                                                    <div className="w-14 h-14 rounded-full border-2 border-[#BFCC80] flex items-center justify-center text-[#616E24] group-hover:bg-[#616E24] group-hover:text-[#BFCC80] group-hover:border-[#616E24] transition-all duration-500 shadow-sm">
                                                        <ArrowRight className="w-6 h-6 stroke-[3px]" />
                                                    </div>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    </Link>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            </Section>

            {/* Philosophy Section */}
            <Section className="bg-[#616E24] text-white text-center py-24 px-6 relative overflow-hidden">
                <div className="absolute inset-0 bg-[#BFCC80]/5" />
                <blockquote className="max-w-4xl mx-auto relative z-10">
                    <p className="text-5xl md:text-7xl font-black italic tracking-tighter mb-10 leading-none text-[#BFCC80]/90">
                        &quot;Fine things for fine people.&quot;
                    </p>
                    <div className="flex flex-col items-center gap-2">
                        <cite className="text-white font-black uppercase tracking-[0.3em] text-sm">— The Babu&apos;s Philosophy —</cite>
                        <div className="w-12 h-1 bg-[#BFCC80] mt-4" />
                    </div>
                </blockquote>
            </Section>
        </div>
    );
}
