"use client";

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import KakaoMap from '@/components/KakaoMap';

export default function DashboardPage() {
    const [activeTab, setActiveTab] = useState('ranking');
    const [loggedInUser, setLoggedInUser] = useState<any>(null);
    const [mounted, setMounted] = useState(false);
    const [lastUpdateTime, setLastUpdateTime] = useState<string>('');

    // Dashboard Simulation States
    const [aiContent, setAiContent] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);
    const [couponStatus, setCouponStatus] = useState<'idle' | 'sending' | 'sent'>('idle');

    // Ad Campaign Dynamics
    const [adStats, setAdStats] = useState({
        downloads: 1248,
        conversion: 15.4,
        balance: 45000,
        isBoosting: false
    });

    const [marketStats, setMarketStats] = useState({
        cafeCount: 18,
        avgRating: 4.5,
        placeClicks: 1420,
        trends: { cafeCount: '+2', placeClicks: '+15%' }
    });

    // Effects
    useEffect(() => {
        setMounted(true);
        setLastUpdateTime(new Date().toLocaleTimeString());

        // Check for logged in user if needed
        const userJson = localStorage.getItem('user');
        if (userJson) {
            setLoggedInUser(JSON.parse(userJson));
        }
    }, []);

    // Interactivity Handlers
    const generateAIContent = async () => {
        setIsGenerating(true);
        setAiContent('');

        try {
            const response = await fetch('/api/ai/strategy', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    region: '서울', // 실제로는 사용자 데이터에서 가져올 수 있음
                    cafeName: loggedInUser?.name || '카페',
                    marketStats: {
                        cafeCount: marketStats.cafeCount,
                        avgRating: marketStats.avgRating,
                        placeClicks: marketStats.placeClicks
                    }
                }),
            });

            const data = await response.json();

            console.log('[Dashboard] AI API response:', data);

            if (data.success && data.strategy) {
                // AI가 생성한 전략인지 확인 (폴백 메시지가 아닌지)
                const isAIGenerated = !data.strategy.includes('AI 서비스 설정 중') &&
                    !data.strategy.includes('테이크아웃 20% 할인') &&
                    !data.strategy.includes('비 오는 날 한정');

                if (isAIGenerated) {
                    console.log('[Dashboard] ✅ AI-generated strategy received');
                } else {
                    console.log('[Dashboard] ⚠️ Fallback message received');
                }

                setAiContent(data.strategy);
            } else {
                // 폴백 메시지
                const fallbackMessages = [
                    "최근 인근 대학가 개강 시즌에 맞춰 '테이크아웃 20% 할인' 소식을 발행해보세요. 2시~4시 매출이 25% 상승할 것으로 보입니다.",
                    "이번 주말 비 소식이 있습니다. '비 오는 날 한정: 수제 쿠키 증정' 이벤트를 당근마켓에 올리면 평소보다 2배 더 많은 고객이 유입될 거예요.",
                    "오전 11시 타겟 마케팅: '브런치 세트 런칭' 알림을 보내보세요. 인근 직장인들의 점심 수요를 흡수할 수 있습니다."
                ];
                setAiContent(fallbackMessages[Math.floor(Math.random() * fallbackMessages.length)]);
            }
        } catch (error) {
            console.error('[Dashboard] AI strategy generation failed:', error);
            // 에러 발생 시 폴백 메시지
            const fallbackMessages = [
                "최근 인근 대학가 개강 시즌에 맞춰 '테이크아웃 20% 할인' 소식을 발행해보세요. 2시~4시 매출이 25% 상승할 것으로 보입니다.",
                "이번 주말 비 소식이 있습니다. '비 오는 날 한정: 수제 쿠키 증정' 이벤트를 당근마켓에 올리면 평소보다 2배 더 많은 고객이 유입될 거예요.",
                "오전 11시 타겟 마케팅: '브런치 세트 런칭' 알림을 보내보세요. 인근 직장인들의 점심 수요를 흡수할 수 있습니다."
            ];
            setAiContent(fallbackMessages[Math.floor(Math.random() * fallbackMessages.length)]);
        } finally {
            setIsGenerating(false);
        }
    };

    const sendCoupons = () => {
        setCouponStatus('sending');
        setTimeout(() => {
            setCouponStatus('sent');
            setTimeout(() => setCouponStatus('idle'), 3000);
        }, 2000);
    };

    const boostAdCampaign = () => {
        if (adStats.balance < 5000) {
            alert('광고 잔액이 부족합니다. 충전이 필요합니다.');
            return;
        }

        setAdStats(prev => ({ ...prev, isBoosting: true }));

        setTimeout(() => {
            setAdStats(prev => ({
                ...prev,
                downloads: prev.downloads + Math.floor(Math.random() * 50) + 10,
                conversion: parseFloat((prev.conversion + (Math.random() * 0.5)).toFixed(1)),
                balance: prev.balance - 5000,
                isBoosting: false
            }));
        }, 2000);
    };

    const handleMapSearch = useCallback((data: { cafeCount: number }) => {
        setMarketStats(prev => {
            const diff = data.cafeCount - prev.cafeCount;
            return {
                ...prev,
                cafeCount: data.cafeCount,
                avgRating: parseFloat((4.0 + Math.random() * 0.9).toFixed(1)),
                placeClicks: Math.floor(2000 + (data.cafeCount * 50) + (Math.random() * 500)),
                trends: {
                    cafeCount: diff > 0 ? `+${diff}` : diff < 0 ? `${diff}` : '안정',
                    placeClicks: '+18%'
                }
            };
        });
    }, []);

    return (
        <div className="min-h-screen bg-[#0F0A08] text-white flex flex-col">
            {/* Top Navbar */}
            <header className="h-20 border-b border-white/5 flex items-center justify-between px-8 bg-[#150F0D]/80 backdrop-blur-md sticky top-0 z-50">
                <div className="flex items-center gap-6">
                    <Link href="/" className="group flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-amber-600 flex items-center justify-center text-xl shadow-lg shadow-amber-900/40 group-hover:scale-110 transition-all">☕</div>
                        <span className="font-black text-xl tracking-tighter">CafeDream <span className="text-amber-600 font-bold text-xs ml-1">ADMIN</span></span>
                    </Link>
                    <div className="h-6 w-px bg-white/10 hidden md:block"></div>
                    <div className="hidden md:flex items-center gap-2 text-xs font-bold text-gray-500">
                        <span className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.5)]"></span>
                        SYSTEM ONLINE
                    </div>
                </div>

                <div className="flex items-center gap-6">
                    <div className="text-right hidden sm:block">
                        <p className="text-xs font-black text-white">{loggedInUser?.name || '카페드림 사장님'}</p>
                        <p className="text-[10px] text-amber-600 font-bold leading-none mt-1">PRO PLAN ACTIVE</p>
                    </div>
                    <Link href="/" className="px-5 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-black transition-all">
                        로그아웃
                    </Link>
                </div>
            </header>

            <div className="flex-1 flex overflow-hidden">
                {/* Left Sidebar Navigation */}
                <aside className="w-72 border-r border-white/5 bg-gradient-to-b from-[#150F0D] to-[#0F0A08] p-8 hidden lg:flex flex-col gap-10">
                    <nav className="flex flex-col gap-3">
                        {[
                            { id: 'ranking', label: '지역 랭킹 분석', icon: '📈', desc: '내 매장 주변 상권 분석' },
                            { id: 'ads', label: '당근 광고 성과', icon: '🥕', desc: '지역 광고 효율 리포트' },
                            { id: 'crm', label: '단골 관리 시스템', icon: '👥', desc: '고객 재방문 데이터' },
                        ].map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`flex items-start gap-4 px-5 py-4 rounded-2xl transition-all text-left group ${activeTab === tab.id ? 'bg-amber-600 text-white shadow-xl shadow-amber-900/40' : 'text-gray-500 hover:text-white hover:bg-white/5'}`}
                            >
                                <span className="text-xl mt-0.5">{tab.icon}</span>
                                <div className="flex flex-col">
                                    <span className="font-black text-sm">{tab.label}</span>
                                    <span className={`text-[10px] font-medium mt-0.5 ${activeTab === tab.id ? 'text-amber-100/60' : 'text-gray-600 group-hover:text-gray-400'}`}>{tab.desc}</span>
                                </div>
                            </button>
                        ))}
                    </nav>

                    <div className="mt-auto">
                        <div className="p-6 rounded-3xl bg-amber-900/20 border border-amber-900/30">
                            <p className="text-xs text-amber-200/50 font-bold mb-3 uppercase tracking-widest">Next Insight</p>
                            <p className="text-sm font-black text-amber-100 leading-relaxed">AI 세무 비서<br />자동 연동 대기 중</p>
                            <div className="w-full h-1.5 bg-white/5 rounded-full mt-4 overflow-hidden">
                                <div className="w-[85%] h-full bg-amber-600 rounded-full animate-pulse" />
                            </div>
                        </div>

                        <Link href="/" className="mt-8 flex items-center gap-2 text-xs font-bold text-gray-500 hover:text-white transition-colors group">
                            <span className="group-hover:-translate-x-1 transition-transform">←</span> 랜딩페이지로 돌아가기
                        </Link>
                    </div>
                </aside>

                {/* Main Content Area */}
                <main className="flex-1 overflow-y-auto p-8 lg:p-12">
                    {/* Header Row */}
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
                        <div>
                            <h2 className="text-3xl font-black mb-2 animate-fadeIn">
                                {activeTab === 'ranking' ? '실시간 상권 분석' : activeTab === 'ads' ? '광고 캠페인 매니저' : '고객 데이터 센터'}
                            </h2>
                            <p className="text-gray-500 font-bold italic">
                                {activeTab === 'ranking' ? '내 매장의 실시간 플레이스 경쟁력과 주변 트래픽을 분석합니다.' :
                                    activeTab === 'ads' ? '당근마켓 지역 타겟 광고의 실시간 전환 성과와 잔액을 관리합니다.' :
                                        '재방문 주기가 늦어진 충성 고객들을 위한 자동화 액션을 제안합니다.'}
                            </p>
                        </div>

                        <div className="flex items-center gap-3">
                            {mounted && (
                                <div className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 flex items-center gap-3 text-xs font-bold text-gray-400 shadow-xl">
                                    <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                                    LAST UPDATE: {lastUpdateTime}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Dynamic Content Switching */}
                    <div className="animate-fadeIn">
                        {activeTab === 'ranking' && (
                            <div className="space-y-10">
                                {/* Stats Grid */}
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                                    {[
                                        { label: '주변 카페 수', value: `${marketStats.cafeCount}개`, trend: marketStats.trends.cafeCount, trendSub: '경쟁 강도 측정 중' },
                                        { label: '평균 평점', value: marketStats.avgRating, trend: '최고점', trendSub: '지역 평균 대비 0.5↑' },
                                        { label: '카카오맵 클릭', value: marketStats.placeClicks.toLocaleString(), trend: marketStats.trends.placeClicks, trendSub: '지난 24시간 합계' },
                                    ].map((stat, i) => (
                                        <div key={i} className="bg-white/5 border border-white/5 p-8 rounded-[3rem] hover:bg-white/10 transition-all group overflow-hidden relative">
                                            <div className="absolute top-0 right-0 w-32 h-32 bg-amber-600/5 rounded-full -mr-10 -mt-10 group-hover:scale-110 transition-all"></div>
                                            <p className="text-[10px] text-gray-500 font-black uppercase tracking-[0.2em] mb-4 relative z-10">{stat.label}</p>
                                            <div className="flex items-end justify-between relative z-10 mb-4">
                                                <p className="text-4xl font-black text-white">{stat.value}</p>
                                                <span className={`text-xs font-black px-3 py-1 rounded-full ${stat.trend.includes('-') ? 'bg-red-500/10 text-red-500' : 'bg-green-500/10 text-green-500'}`}>
                                                    {stat.trend}
                                                </span>
                                            </div>
                                            <p className="text-[10px] text-gray-600 font-bold relative z-10">{stat.trendSub}</p>
                                        </div>
                                    ))}
                                </div>

                                {/* Map Implementation */}
                                <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                                    <div className="lg:col-span-2">
                                        <KakaoMap className="h-[600px] shadow-3xl border border-white/10" onSearch={handleMapSearch} />
                                    </div>

                                    <div className="flex flex-col gap-8">
                                        <div className="flex-1 bg-gradient-to-br from-amber-600 to-amber-700 rounded-[3rem] p-10 flex flex-col justify-between shadow-2xl shadow-amber-900/20">
                                            <div className="space-y-6">
                                                <span className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center text-2xl">🤖</span>
                                                <h4 className="text-2xl font-black leading-tight">AI가 제안하는<br />이번 주 마케팅 전략</h4>
                                                <p className="text-white/80 font-medium leading-relaxed italic">
                                                    {isGenerating ? "알고리즘 분석 중..." : aiContent || "주변 상권을 분석하여 최적의 매출 향상 전략을 도출합니다."}
                                                </p>
                                            </div>
                                            <button
                                                onClick={generateAIContent}
                                                disabled={isGenerating}
                                                className="w-full py-5 rounded-2xl bg-white text-amber-900 font-black text-sm hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50"
                                            >
                                                {isGenerating ? "전략 생성 중..." : "AI 전략 업데이트 받기"}
                                            </button>
                                        </div>

                                        <div className="p-10 rounded-[3rem] bg-white/5 border border-white/5 space-y-8">
                                            <h4 className="font-black text-lg flex items-center gap-3">
                                                <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                                                실시간 경쟁 매장 추이
                                            </h4>
                                            <div className="space-y-6">
                                                {[1, 2, 3].map(i => (
                                                    <div key={i} className="flex items-center justify-between">
                                                        <div className="flex items-center gap-4">
                                                            <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-xs font-black text-gray-500">{i}</div>
                                                            <div className="text-sm font-black text-gray-300">경쟁사 C{i}</div>
                                                        </div>
                                                        <div className="flex items-center gap-2">
                                                            <div className="w-24 h-1 bg-white/5 rounded-full overflow-hidden">
                                                                <div className="h-full bg-amber-600" style={{ width: `${80 - (i * 15)}%` }} />
                                                            </div>
                                                            <span className="text-[10px] font-bold text-gray-500">ACTIVE</span>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === 'ads' && (
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                                <div className="bg-[#1A110D] border border-white/5 p-12 rounded-[4rem] flex flex-col justify-between shadow-3xl">
                                    <div>
                                        <div className="flex justify-between items-center mb-10">
                                            <span className="text-amber-500 text-xs font-black uppercase tracking-[0.3em]">Campaign Wallet</span>
                                            <div className="px-4 py-2 bg-amber-500/10 text-amber-500 text-[10px] font-black rounded-full border border-amber-500/20">실시간 자동 충전 활성</div>
                                        </div>
                                        <h3 className="text-sm font-bold text-gray-500 mb-2 uppercase tracking-widest">Available Balance</h3>
                                        <p className="text-6xl font-black text-white mb-12 tracking-tighter">₩{adStats.balance.toLocaleString()}</p>

                                        <div className="space-y-6 mb-12">
                                            <div className="flex justify-between items-center p-6 rounded-3xl bg-white/5 border border-white/5">
                                                <span className="font-bold text-gray-400">당근마켓 쿠폰 다운로드</span>
                                                <span className="text-lg font-black text-green-400">{adStats.downloads.toLocaleString()}회</span>
                                            </div>
                                            <div className="flex justify-between items-center p-6 rounded-3xl bg-white/5 border border-white/5">
                                                <span className="font-bold text-gray-400">광고 전환율 (CTR)</span>
                                                <span className="text-lg font-black text-amber-500">{adStats.conversion}%</span>
                                            </div>
                                        </div>
                                    </div>

                                    <button
                                        onClick={boostAdCampaign}
                                        disabled={adStats.isBoosting}
                                        className="w-full py-6 rounded-3xl bg-amber-600 text-white font-black text-lg hover:bg-amber-700 transition-all shadow-xl shadow-amber-900/30 disabled:opacity-50 group"
                                    >
                                        {adStats.isBoosting ? "캠페인 부스팅 중..." : "동네 잠재고객 1,000명에게 부스팅 시작"}
                                        <span className="block text-[10px] text-amber-100/60 mt-1 font-bold">1회 실행 시 ₩5,000 소모</span>
                                    </button>
                                </div>

                                <div className="space-y-10">
                                    <div className="p-10 rounded-[3rem] bg-white/5 border border-white/5 space-y-8">
                                        <h4 className="font-black text-lg">최근 광고 성과 분석</h4>
                                        <div className="h-64 flex items-end gap-3 px-4">
                                            {[60, 45, 80, 55, 90, 70, 85].map((h, i) => (
                                                <div key={i} className="flex-1 bg-amber-600/20 rounded-t-xl relative group">
                                                    <div className="absolute inset-0 bg-amber-600 rounded-t-xl transition-all duration-1000 origin-bottom scale-y-0 group-hover:scale-y-100" style={{ height: `${h}%`, transitionDelay: `${i * 0.1}s` }}></div>
                                                    <div className="absolute -top-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity text-[10px] font-black">{h}%</div>
                                                </div>
                                            ))}
                                        </div>
                                        <div className="flex justify-between px-4 text-[10px] font-black text-gray-500">
                                            <span>MON</span><span>TUE</span><span>WED</span><span>THU</span><span>FRI</span><span>SAT</span><span>SUN</span>
                                        </div>
                                    </div>

                                    <div className="p-10 rounded-[3rem] bg-gradient-to-br from-[#1A110D] to-[#251A15] border border-white/5">
                                        <h4 className="font-black text-lg mb-6">부스팅 스마트 매칭</h4>
                                        <p className="text-gray-400 text-sm font-medium leading-relaxed mb-8">
                                            오늘 오후 3시, 카페 인근 반경 500m 내에 위치한 '커피' 관심 유저 1,420명이 활동 중입니다. 지금 부스팅을 시작하면 가장 효율이 높습니다.
                                        </p>
                                        <div className="p-6 rounded-2xl bg-amber-900/20 border border-amber-900/30 flex items-center gap-6">
                                            <div className="text-3xl">🎯</div>
                                            <div>
                                                <p className="text-sm font-black text-amber-100">예상 유입 고객수</p>
                                                <p className="text-2xl font-black text-white">+850~1,200명</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === 'crm' && (
                            <div className="space-y-10">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                                    <div className="p-12 rounded-[4rem] bg-white/5 border border-white/5 flex flex-col min-h-[450px]">
                                        <div className="flex-1">
                                            <div className="w-16 h-16 rounded-2xl bg-amber-600/20 flex items-center justify-center text-3xl mb-8">🤳</div>
                                            <h3 className="text-2xl font-black mb-4">재방문 유도 자동 쿠폰</h3>
                                            <p className="text-gray-400 font-medium leading-relaxed mb-0 max-w-sm">
                                                방문이 뜸해진 단골 고객들을 시스템이 자동으로 분류하여, '사장님이 직접 쓴 것 같은' 따뜻한 안부 메시지와 쿠폰을 보냅니다.
                                            </p>
                                        </div>
                                        <div className="flex flex-col gap-5 pt-8">
                                            <div className="p-5 rounded-2xl bg-amber-900/20 border border-amber-900/30 flex items-center justify-between">
                                                <div>
                                                    <p className="text-xs font-black text-amber-100 opacity-50 uppercase mb-1">Target Segments</p>
                                                    <p className="text-lg font-black text-white">미방문 30일 이상 단골 45명</p>
                                                </div>
                                                <span className="px-3 py-1 rounded-full bg-green-500/10 text-green-500 text-[10px] font-black">추출 완료</span>
                                            </div>
                                            <button
                                                onClick={sendCoupons}
                                                disabled={couponStatus !== 'idle'}
                                                className={`w-full py-5 rounded-3xl font-black text-lg transition-all ${couponStatus === 'sent' ? 'bg-green-600 text-white' : 'bg-white text-amber-900 hover:scale-[1.02]'}`}
                                            >
                                                {couponStatus === 'sending' ? "쿠폰 발송 중..." : couponStatus === 'sent' ? "✓ 발송 완료" : "지금 안부 쿠폰 45명에게 보내기"}
                                            </button>
                                        </div>
                                    </div>

                                    <div className="grid grid-rows-2 gap-10">
                                        <div className="p-10 rounded-[4rem] bg-gradient-to-br from-[#1A110D] to-[#0F0A08] border border-white/5 flex items-center gap-10">
                                            <div className="w-32 h-32 rounded-full border-[8px] border-amber-600 border-t-white/10 flex items-center justify-center relative">
                                                <span className="text-2xl font-black">72%</span>
                                            </div>
                                            <div>
                                                <h4 className="text-xl font-black mb-2">단골 재방문율</h4>
                                                <p className="text-sm text-gray-500 font-black italic">지역 평균(28%) 대비 2.5배 높음</p>
                                            </div>
                                        </div>

                                        <div className="p-10 rounded-[4rem] bg-amber-900/10 border border-amber-900/20 flex flex-col justify-center">
                                            <h4 className="font-black text-lg mb-6">이번 달 신규 VIP 회원</h4>
                                            <div className="flex -space-x-4 mb-6">
                                                {[1, 2, 3, 4, 5].map(i => (
                                                    <div key={i} className="w-14 h-14 rounded-full border-4 border-[#0F0A08] bg-amber-200 flex items-center justify-center font-black text-amber-800 text-xl shadow-xl">
                                                        {String.fromCharCode(64 + i)}
                                                    </div>
                                                ))}
                                                <div className="w-14 h-14 rounded-full border-4 border-[#0F0A08] bg-white/10 flex items-center justify-center font-black text-white text-xs backdrop-blur-md">
                                                    +12
                                                </div>
                                            </div>
                                            <p className="text-[10px] font-black text-amber-600 tracking-widest uppercase">Loyalty Reward Program is Active</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="p-12 rounded-[4rem] bg-white/5 border border-white/5">
                                    <h4 className="font-black text-xl mb-10">고객 피드백 실시간 모니터링</h4>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                                        {[
                                            { name: '민우님', rating: '⭐️⭐️⭐️⭐️⭐️', comment: '시그니처 라떼가 정말 맛있어요. 쿠폰 받고 또 왔어요!', time: '1시간 전' },
                                            { name: '유진님', rating: '⭐️⭐️⭐️⭐️⭐️', comment: '사장님이 친절하시고 분위기가 좋아요. 단골 등록했습니다.', time: '3시간 전' },
                                            { name: '승현님', rating: '⭐️⭐️⭐️⭐️', comment: '조용히 작업하기 좋습니다. 가끔 서비스 쿠폰 와서 좋아요.', time: '어제' },
                                        ].map((item, i) => (
                                            <div key={i} className="p-8 rounded-[3rem] bg-[#1A110D] border border-white/5 space-y-4">
                                                <div className="flex justify-between items-center">
                                                    <span className="font-black text-sm text-amber-500">{item.name}</span>
                                                    <span className="text-[10px] text-gray-600 font-bold">{item.time}</span>
                                                </div>
                                                <div className="text-xs">{item.rating}</div>
                                                <p className="text-sm text-gray-400 font-medium leading-relaxed italic">"{item.comment}"</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </main>
            </div>

            <style jsx global>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes slideIn {
          from { opacity: 0; transform: translateX(20px); }
          to { opacity: 1; transform: translateX(0); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        .animate-slideIn {
          animation: slideIn 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
      `}</style>
        </div>
    );
}
