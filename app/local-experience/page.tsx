"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';

export default function LocalExperiencePage() {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    const influencers = [
        {
            id: 1,
            name: "성수동토박이",
            tags: ["#맛집", "#카페", "#솔직리뷰"],
            followers: "15.2k",
            engagement: "High",
            image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=200",
            recentPost: "오늘 다녀온 카페 드림, 라떼가 정말..."
        },
        {
            id: 2,
            name: "카페요정",
            tags: ["#디저트", "#감성샷", "#데이트"],
            followers: "28.5k",
            engagement: "Very High",
            image: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=200",
            recentPost: "햇살 맛집 발견! 여기 스콘 미쳤어요 🥨"
        },
        {
            id: 3,
            name: "커피한잔의여유",
            tags: ["#직장인", "#커피러버", "#공간"],
            followers: "8.9k",
            engagement: "Medium",
            image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=200",
            recentPost: "업무 미팅하기 좋은 조용한 카페 추천"
        }
    ];

    if (!mounted) return null;

    return (
        <div className="min-h-screen bg-[#FAFAFA] text-[#1A110D] font-sans selection:bg-orange-100">
            {/* Navigation */}
            <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
                <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
                    <Link href="/" className="text-xl font-bold tracking-tighter hover:opacity-70 transition-opacity">
                        ☕ CAFÉ DREAM
                    </Link>
                    <div className="flex items-center gap-6">
                        <Link href="/dashboard" className="text-sm font-medium text-gray-500 hover:text-black">대시보드</Link>
                        <button className="px-4 py-2 bg-orange-600 text-white rounded-full text-sm font-bold shadow-lg hover:bg-orange-700 transition-all">
                            체험단 모집하기
                        </button>
                    </div>
                </div>
            </nav>

            <main className="pt-32 pb-20 px-6">
                <div className="max-w-7xl mx-auto">
                    {/* Header Section */}
                    <div className="text-center mb-20">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-orange-50 border border-orange-100 text-orange-600 text-xs font-bold uppercase tracking-widest mb-6"
                        >
                            <span className="w-2 h-2 rounded-full bg-orange-500 animate-pulse" />
                            Local Influencers
                        </motion.div>
                        <motion.h1
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            className="text-4xl md:text-6xl font-black mb-6 leading-tight"
                        >
                            우리 동네 <span className="text-orange-600">진짜 입소문</span>을<br />만들어줄 파트너
                        </motion.h1>
                        <motion.p
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            className="text-gray-500 text-lg md:text-xl max-w-2xl mx-auto leading-relaxed"
                        >
                            단순한 광고가 아닙니다. <br className="md:hidden" />
                            지역 주민들이 신뢰하는 <b>로컬 크리에이터</b>와 함께<br />
                            자연스러운 매장 경험을 공유하세요.
                        </motion.p>
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-24">
                        {[
                            { label: "활동 중인 리뷰어", value: "2,450+", icon: "✍️" },
                            { label: "평균 리뷰 도달률", value: "15.4k", icon: "👀" },
                            { label: "마케팅 ROI", value: "320%", icon: "📈" }
                        ].map((stat, idx) => (
                            <motion.div
                                key={idx}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.3 + idx * 0.1 }}
                                className="bg-white p-8 rounded-3xl shadow-xl shadow-gray-100 border border-gray-50 hover:-translate-y-1 transition-transform"
                            >
                                <div className="text-4xl mb-4">{stat.icon}</div>
                                <div className="text-3xl font-black text-[#1A110D] mb-1">{stat.value}</div>
                                <div className="text-gray-400 font-bold text-sm">{stat.label}</div>
                            </motion.div>
                        ))}
                    </div>

                    {/* Influencer List Showcase */}
                    <div className="mb-24">
                        <div className="flex items-end justify-between mb-10">
                            <div>
                                <h2 className="text-2xl font-bold mb-2">🔥 이달의 추천 리뷰어</h2>
                                <p className="text-gray-500">사장님 매장에 딱 맞는 인플루언서를 찾아보세요</p>
                            </div>
                            <button className="hidden md:block text-orange-600 font-bold hover:underline">더보기 arrow_forward</button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            {influencers.map((inf, idx) => (
                                <motion.div
                                    key={inf.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.5 + idx * 0.1 }}
                                    className="group relative bg-white rounded-[2rem] overflow-hidden shadow-lg border border-gray-100 hover:shadow-2xl hover:shadow-orange-100/50 transition-all duration-300"
                                >
                                    <div className="absolute top-6 right-6 z-10 bg-white/90 backdrop-blur px-3 py-1 rounded-full text-xs font-bold border border-gray-100">
                                        ⭐ {inf.engagement}
                                    </div>
                                    <div className="p-8 pb-0 flex flex-col items-center text-center">
                                        <div className="w-24 h-24 rounded-full border-4 border-white shadow-lg overflow-hidden mb-4 relative">
                                            <img src={inf.image} alt={inf.name} className="w-full h-full object-cover" />
                                        </div>
                                        <h3 className="text-lg font-black mb-1">{inf.name}</h3>
                                        <p className="text-gray-400 text-sm font-medium mb-4">팔로워 {inf.followers}</p>
                                        <div className="flex gap-2 flex-wrap justify-center mb-6">
                                            {inf.tags.map(tag => (
                                                <span key={tag} className="px-2 py-1 bg-orange-50 text-orange-600 text-[10px] font-bold rounded-md">
                                                    {tag}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="bg-gray-50 p-6 border-t border-gray-100">
                                        <p className="text-xs text-gray-500 font-medium mb-3">Recent Review</p>
                                        <div className="bg-white p-3 rounded-xl text-sm text-gray-700 shadow-sm italic">
                                            "{inf.recentPost}"
                                        </div>
                                        <button className="w-full mt-4 py-3 bg-[#1A110D] text-white rounded-xl text-sm font-bold hover:bg-orange-600 transition-colors">
                                            섭외 요청하기
                                        </button>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </div>

                    {/* How it works */}
                    <div className="bg-[#1A110D] rounded-[3rem] p-10 md:p-20 text-white relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-orange-500/20 rounded-full blur-[120px] translate-x-1/3 -translate-y-1/3" />

                        <div className="relative z-10">
                            <h2 className="text-3xl md:text-4xl font-black mb-16 text-center">진행 프로세스</h2>
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                                {[
                                    { step: "01", title: "캠페인 등록", desc: "원하는 방문 인원과 제공 내역을 설정합니다." },
                                    { step: "02", title: "리뷰어 매칭", desc: "AI가 매장에 가장 적합한 로컬 인플루언서를 추천합니다." },
                                    { step: "03", title: "방문 및 체험", desc: "약속된 일정에 방문하여 서비스를 체험합니다." },
                                    { step: "04", title: "콘텐츠 확산", desc: "고퀄리티 리뷰가 등록되고 지역 내에 확산됩니다." },
                                ].map((item, idx) => (
                                    <div key={idx} className="relative">
                                        <div className="text-5xl font-black text-white/10 mb-4">{item.step}</div>
                                        <h3 className="text-xl font-bold mb-2 text-orange-400">{item.title}</h3>
                                        <p className="text-gray-400 leading-relaxed text-sm">{item.desc}</p>
                                        {idx !== 3 && (
                                            <div className="hidden md:block absolute top-8 right-0 w-8 h-[2px] bg-white/10 translate-x-1/2" />
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
