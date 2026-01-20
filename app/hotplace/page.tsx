"use client";

import React, { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';

const ReelCard = ({ reel, onClick }: { reel: any; onClick: () => void }) => {
    const videoRef = useRef<HTMLVideoElement>(null);

    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        videoRef.current?.play().catch(() => { });
                    } else {
                        videoRef.current?.pause();
                    }
                });
            },
            { threshold: 0.5 }
        );

        if (videoRef.current) {
            observer.observe(videoRef.current);
        }

        return () => {
            observer.disconnect();
        };
    }, []);

    return (
        <div
            className="group relative aspect-[9/16] rounded-[40px] overflow-hidden bg-gray-100 cursor-pointer shadow-2xl shadow-gray-200/50"
            onClick={onClick}
            onMouseEnter={() => videoRef.current?.play().catch(() => { })}
            onMouseLeave={() => {
                // Optional: pause on mouse leave if you want to strictly only play on hover or intersection
                // But typically for reels grid, playing on intersection is good enough.
                // Keeping it playing if visible is fine. 
                // Let's rely on intersection observer for pause mainly.
            }}
        >
            <video
                ref={videoRef}
                src={reel.video}
                poster={reel.fallbackImage}
                muted
                loop
                playsInline
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-60 group-hover:opacity-100 transition-opacity duration-300">
                <div className="absolute bottom-12 left-8 right-8 text-white">
                    <div className="flex items-center gap-2 mb-3 transform group-hover:-translate-y-1 transition-transform">
                        <div className="w-8 h-8 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-[10px] font-bold border border-white/20">
                            {reel.user[1].toUpperCase()}
                        </div>
                        <span className="text-xs font-bold">{reel.user}</span>
                    </div>
                    <p className="font-bold text-lg mb-2 group-hover:text-orange-400 transition-colors">📍 {reel.location}</p>
                    <p className="text-xs font-medium text-white/70 line-clamp-2 leading-relaxed opacity-0 group-hover:opacity-100 transition-all duration-500 translate-y-4 group-hover:translate-y-0">{reel.desc}</p>
                </div>
            </div>
            <div className="absolute top-8 right-8 w-14 h-14 rounded-3xl bg-black/40 backdrop-blur-xl border border-white/10 flex items-center justify-center text-2xl shadow-2xl group-hover:rotate-12 transition-transform">
                🎞️
            </div>
        </div>
    );
};

export default function HotPlacePage(props: {
    params: Promise<any>,
    searchParams: Promise<any>
}) {
    // Unwrap promises for Next.js 15 compatibility to avoid console warnings
    const params = React.use(props.params);
    const searchParams = React.use(props.searchParams);

    // 1. State Declarations
    const [mounted, setMounted] = useState(false);
    const [activeCategory, setActiveCategory] = useState("전체");
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedStory, setSelectedStory] = useState<number | null>(null);
    const [viewingStory, setViewingStory] = useState<any | null>(null);
    const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
    const [progress, setProgress] = useState(0);
    const [showToast, setShowToast] = useState(false);
    const [toastMessage, setToastMessage] = useState("");
    const [isWriteModalOpen, setIsWriteModalOpen] = useState(false);
    const [selectedImage, setSelectedImage] = useState<string | null>(null);
    const [isReelsOpen, setIsReelsOpen] = useState(false);
    const [currentReelIndex, setCurrentReelIndex] = useState(0);
    const [isMuted, setIsMuted] = useState(true);
    const [isVideoLoading, setIsVideoLoading] = useState(true);
    const [hasVideoError, setHasVideoError] = useState(false);
    const [showMuteFeedback, setShowMuteFeedback] = useState(false);
    const [isReelMakerOpen, setIsReelMakerOpen] = useState(false);
    const [reelStep, setReelStep] = useState<'upload' | 'generating' | 'preview'>('upload');
    const [uploadedPhotos, setUploadedPhotos] = useState<string[]>([]);
    const [selectedMusic, setSelectedMusic] = useState<string>("Trend Jazz");
    const [hoveredReelId, setHoveredReelId] = useState<number | null>(null);
    const [activeNav, setActiveNav] = useState<'핫플레이스' | '트렌드 릴스'>('핫플레이스');




    // 2. Static Data (Moved to top to prevent TDZ issues)
    const categories = ["전체", "인테리어", "메뉴", "포토존", "브랜딩"];

    const stories = [
        {
            id: 1,
            name: "성수",
            active: true,
            user: "Cafe Dream • 성수",
            avatar: "https://images.unsplash.com/photo-1554118811-1e0d58224f24?q=80&w=100",
            slides: [
                {
                    image: "https://images.unsplash.com/photo-1554118811-1e0d58224f24?q=80&w=800",
                    title: "성수동 공장의 변신",
                    desc: "거친 콘크리트 속에서 피어난 세련된 카페 문화를 만나보세요.",
                    tag: "FACTORY CHIC"
                },
                {
                    image: "https://images.unsplash.com/photo-1533090161767-e6ffed986c88?q=80&w=800",
                    title: "플랜테리어의 정석",
                    desc: "도심 속 정원, 성수에서만 느낄 수 있는 초록빛 휴식입니다.",
                    tag: "GREENERY"
                }
            ]
        },
        {
            id: 2,
            name: "연남",
            active: true,
            user: "Cafe Dream • 연남",
            avatar: "https://images.unsplash.com/photo-1511920170033-f8396924c348?q=80&w=100",
            slides: [
                {
                    image: "https://images.unsplash.com/photo-1511920170033-f8396924c348?q=80&w=800",
                    title: "미로 같은 골목의 매력",
                    desc: "연남동 골목 구석구석 숨겨진 감성 카페들을 소개합니다.",
                    tag: "ALLEY VIBE"
                },
                {
                    image: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?q=80&w=800",
                    title: "연트럴파크의 오후",
                    desc: "햇살 가득한 창가에서 즐기는 여유로운 커피 한 잔.",
                    tag: "SUNSET MOOD"
                }
            ]
        },
        {
            id: 3,
            name: "한남",
            active: false,
            user: "Cafe Dream • 한남",
            avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=100",
            slides: [
                {
                    image: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?q=80&w=800",
                    title: "가장 럭셔리한 쉼표",
                    desc: "한남동의 고요함 속에 담긴 하이엔드 브랜딩의 정수.",
                    tag: "LUXURY"
                }
            ]
        }
    ];

    const reels = [
        {
            id: 1,
            video: "/videos/cafe-1.webm?v=5",
            fallbackImage: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?q=80&w=800",
            location: "성수동 브루잉 랩",
            user: "@barista_kim",
            desc: "아침을 깨우는 정교한 핸드드립의 순간. 원두의 향이 화면 너머로 느껴지지 않나요? ☕️ #핸드드립 #성수동카페"
        },
        {
            id: 2,
            video: "/videos/cafe-2.webm?v=5",
            fallbackImage: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?q=80&w=800",
            location: "연남동 쉐이크 하우스",
            user: "@cafe_vibe_kr",
            desc: "커피 한 잔의 여유가 필요한 오후. 이곳만의 특별한 원두를 만나보세요. 🌿 #공간디자인 #연남동핫플"
        },
        {
            id: 3,
            video: "/videos/cafe-3.webm?v=5",
            fallbackImage: "https://images.unsplash.com/photo-1554118811-1e0d58224f24?q=80&w=800",
            location: "한남동 디저트 빌리지",
            user: "@dessert_master",
            desc: "달콤한 디저트와 향긋한 커피의 완벽한 조화. 당신의 오늘을 달콤하게 채워줄게요. 🍰☕️ #한남동맛집 #디저트카페"
        }
    ];











    const [items, setItems] = useState([
        {
            user: "coffee_explorer_92",
            music: "NewJeans • Ditto",
            location: "성수동 플랜트 로프트",
            category: "인테리어",
            desc: "버려진 창고에서 식물과 네온사인이 어우러진 힙한 공간으로 재탄생. 오픈 한 달 만에 인스타 게시물 3,000개 돌파.",
            image: "https://images.unsplash.com/photo-1533090161767-e6ffed986c88?auto=format&fit=crop&q=80&w=800",
            likes: "12.4k",
            date: "2026.01.18",
            tags: ["#성수핫플", "#카페투어"]
        },
        {
            user: "daily_dessert_vibe",
            music: "IVE • I AM",
            location: "연남동 골드 가든",
            category: "메뉴",
            desc: "금박 장식과 식용 꽃을 활용한 시그니처 디저트로 '찍을 수밖에 없는' 메뉴 구성. 일일 한정 50개 조기 매진.",
            image: "https://images.unsplash.com/photo-1488477181946-6428a0291777?auto=format&fit=crop&q=80&w=800",
            likes: "8.5k",
            date: "2026.01.15",
            tags: ["#연남동디저트", "#금박케이크"]
        },
        {
            user: "sunset_lover_kr",
            music: "Lauv • I Like Me Better",
            location: "한남동 더 데일리 그라인드",
            category: "포토존",
            desc: "노을 지는 통유리창과 따뜻한 조명 설계로 건물 전체를 하나의 거대한 포토존으로 변모.",
            image: "/images/sunset_cafe.png",
            likes: "15.1k",
            date: "2026.01.12",
            tags: ["#한남동카페", "#노을맛집"]
        },
        {
            user: "minimal_vibes",
            music: "Charlie Puth • Light Switch",
            location: "망원동 화이트 큐브",
            category: "인테리어",
            desc: "모든 것이 하얀색인 극도로 미니멀한 공간. 커피 색깔마저 돋보이는 순백의 캔버스 같은 카페.",
            image: "/images/white_cube.png",
            likes: "9.2k",
            date: "2026.01.10",
            tags: ["#망원동", "#미니멀리즘"]
        },
        {
            user: "barista_jay",
            music: "Crush • Rush Hour",
            location: "을지로 빈티지 벙커",
            category: "브랜딩",
            desc: "숨겨진 지하 벙커를 개조한 비밀스러운 아지트. 입구 찾기가 어렵지만 그만큼 특별한 경험을 선사합니다.",
            image: "/images/bunker.png",
            likes: "11.8k",
            date: "2026.01.08",
            tags: ["#힙지로", "#빈티지"]
        },
        {
            user: "sweet_tooth_01",
            music: "BTS • Butter",
            location: "강남 버터크림 하우스",
            category: "메뉴",
            desc: "꾸덕한 버터크림 라떼와 스콘의 환상적인 조합. 다이어트는 내일부터 하게 만드는 마성의 맛.",
            image: "/images/buttercream.png",
            likes: "7.6k",
            date: "2026.01.05",
            tags: ["#강남역", "#디저트천국"]
        }
    ]);

    // 3. Effects
    useEffect(() => {
        setMounted(true);
    }, []);

    useEffect(() => {
        if (isReelsOpen) {
            setHasVideoError(false);
            setIsVideoLoading(true);
        }
    }, [currentReelIndex, isReelsOpen]);

    // Force video playback when switching to Trend Reels view
    useEffect(() => {
        if (activeNav === '트렌드 릴스') {
            // Small timeout to ensure DOM elements are rendered
            const timer = setTimeout(() => {
                const videos = document.querySelectorAll('video');
                videos.forEach(video => {
                    video.muted = true; // Ensure muted for autoplay policy
                    video.play().catch(e => console.log('Auto-play failed:', e));
                });
            }, 100);
            return () => clearTimeout(timer);
        }
    }, [activeNav]);


    useEffect(() => {
        if (showToast) {
            const timer = setTimeout(() => {
                setShowToast(false);
                setToastMessage("");
            }, 2000);
            return () => clearTimeout(timer);
        }
    }, [showToast]);

    useEffect(() => {
        let timer: any;
        if (viewingStory) {
            setProgress(0);
            timer = setInterval(() => {
                setProgress((prev) => {
                    if (prev >= 100) {
                        if (currentSlideIndex < viewingStory.slides.length - 1) {
                            setCurrentSlideIndex(v => v + 1);
                            return 0;
                        } else {
                            const currentIndex = stories.findIndex(s => s.id === viewingStory.id);
                            if (currentIndex < stories.length - 1) {
                                const nextStory = stories[currentIndex + 1];
                                setViewingStory(nextStory);
                                setSelectedStory(nextStory.id);
                                setCurrentSlideIndex(0);
                                return 0;
                            } else {
                                setViewingStory(null);
                                return 100;
                            }
                        }
                    }
                    return prev + 1;
                });
            }, 50);
        } else if (isReelMakerOpen && reelStep === 'preview') {
            timer = setInterval(() => {
                setCurrentSlideIndex(prev => prev + 1);
            }, 3000);
        }
        return () => {
            clearInterval(timer);
            if (!viewingStory && !isReelMakerOpen) setCurrentSlideIndex(0);
        }
    }, [viewingStory, isReelMakerOpen, reelStep, currentSlideIndex, stories]);

    // 4. Logic & Helpers
    if (!mounted) return null;

    const filteredItems = items.filter(item => {
        const matchesCategory = activeCategory === "전체" || item.category === activeCategory;
        const matchesSearch = item.location.includes(searchQuery) || item.desc.includes(searchQuery);
        return matchesCategory && matchesSearch;
    });

    const handleAddPost = (newPost: any) => {
        setItems([newPost, ...items]);
        setToastMessage("✨ 성공적으로 인사이트가 게시되었습니다!");
        setShowToast(true);
        setIsWriteModalOpen(false);
        setSelectedImage(null);
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setSelectedImage(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    return (
        <div className="min-h-screen bg-[#FDFCFB] text-[#1A110D] font-sans selection:bg-orange-100 flex">
            {/* Sidebar Navigation for PC */}
            <aside className="hidden lg:flex w-72 h-screen sticky top-0 bg-white border-r border-[#F1EEE9] flex-col p-8 z-[60]">
                <div className="flex items-center gap-3 mb-12">
                    <div className="w-12 h-12 rounded-2xl bg-[#1A110D] flex items-center justify-center shadow-2xl shadow-gray-200">
                        <span className="text-white font-serif text-2xl italic">C</span>
                    </div>
                    <div>
                        <h1 className="text-xl font-black tracking-tight font-['Outfit']">Cafe Dream</h1>
                        <p className="text-[10px] text-orange-600 font-bold uppercase tracking-[0.2em]">Hot Insights</p>
                    </div>
                </div>

                <nav className="flex-1 space-y-2">
                    {[
                        { label: '홈 피드', icon: '🏠', active: false, action: () => window.location.href = '/' },
                        { label: '핫플레이스', icon: '🔥', active: activeNav === '핫플레이스', action: () => setActiveNav('핫플레이스') },
                        { label: '트렌드 릴스', icon: '🎞️', active: activeNav === '트렌드 릴스', action: () => setActiveNav('트렌드 릴스') },
                        { label: 'AI 마케팅', icon: '🤖', active: false, action: () => { setIsReelMakerOpen(true); setReelStep('upload'); } },
                    ].map((item, idx) => (
                        <button
                            key={idx}
                            onClick={item.action as any}
                            className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl transition-all font-bold text-sm ${item.active ? 'bg-orange-600 text-white shadow-xl shadow-orange-200' : 'text-gray-400 hover:bg-gray-50 hover:text-[#1A110D]'}`}
                        >
                            <span className="text-lg">{item.icon}</span>
                            <span>{item.label}</span>
                        </button>
                    ))}
                </nav>




                <div className="mt-auto pt-8 border-t border-gray-50">
                    <div className="p-6 rounded-3xl bg-orange-50 border border-orange-100">
                        <p className="text-[10px] font-black text-orange-600 uppercase mb-2">My Insight</p>
                        <p className="text-xs font-bold text-orange-900 leading-relaxed mb-4">현재 성수동에서 내 매장의 인기가 급상승 중입니다!</p>
                        <button
                            onClick={() => window.location.href = '/dashboard'}
                            className="w-full py-2 bg-white text-orange-600 text-[10px] font-black rounded-xl shadow-sm hover:bg-orange-600 hover:text-white transition-colors"
                        >
                            리포트 보기
                        </button>
                    </div>
                </div>
            </aside>

            <div className="flex-1 flex flex-col min-w-0">
                {/* Elegant Top Header (Mobile & Sticky PC) */}
                <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-[#F1EEE9] px-6 h-16 flex items-center justify-between lg:h-20 lg:px-12">
                    <div className="flex lg:hidden items-center gap-3">
                        <Link href="/" className="group">
                            <div className="w-10 h-10 rounded-xl bg-[#1A110D] flex items-center justify-center transition-transform group-hover:scale-105">
                                <span className="text-white font-serif text-xl italic pt-0.5">C</span>
                            </div>
                        </Link>
                        <div>
                            <h1 className="text-[18px] font-bold tracking-tight text-[#1A110D] font-['Outfit']">Cafe Dream</h1>
                        </div>
                    </div>
                    <div className="hidden lg:block">
                        <h2 className="text-sm font-black text-gray-400 font-medium">👋 안녕하세요, 사장님! 오늘은 어떤 인사이트를 찾아볼까요?</h2>
                    </div>
                    <div className="flex items-center gap-5">
                        <button
                            onClick={() => {
                                setIsReelMakerOpen(true);
                                setReelStep('upload');
                            }}
                            className="hidden md:flex items-center gap-2 px-5 py-2.5 bg-[#1A110D] text-white rounded-full text-[13px] font-black hover:bg-orange-600 transition-all shadow-xl shadow-orange-100/20 active:scale-95"
                        >
                            <span className="text-sm">✨</span>
                            <span>AI 릴스 제작</span>
                        </button>
                        <div className="flex items-center gap-3 border-l pl-5 ml-2">
                            <img src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=100" alt="profile" className="w-10 h-10 rounded-full border-2 border-orange-100 p-0.5 object-cover" />
                            <span className="hidden xl:block text-sm font-black text-[#1A110D]">Admin</span>
                        </div>
                    </div>
                </header>

                <main className="max-w-[1400px] mx-auto pt-12 lg:pt-16 pb-32 md:pb-24 px-6 lg:px-12 w-full">
                    <AnimatePresence mode="wait">
                        {activeNav === '트렌드 릴스' ? (
                            <motion.div
                                key="reels-view"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                className="animate-slideUp"
                            >
                                <div className="flex items-end justify-between mb-12">
                                    <div>
                                        <div className="flex items-center gap-2 mb-2">
                                            <span className="w-8 h-px bg-orange-500"></span>
                                            <span className="text-orange-600 font-bold text-[10px] uppercase tracking-[0.4em]">Video Trends</span>
                                        </div>
                                        <h2 className="text-4xl sm:text-5xl font-serif text-[#1A110D] italic leading-[1.1] mb-2">Trending Reels</h2>
                                        <p className="text-gray-400 font-medium">실시간 성수동 카페 트렌드를 영상으로 확인하세요</p>
                                    </div>
                                    <button onClick={() => setIsReelsOpen(true)} className="px-8 py-4 bg-[#1A110D] text-white rounded-2xl text-xs font-black shadow-xl hover:bg-orange-600 transition-all">전체화면으로 보기</button>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                                    {reels.map((reel) => (
                                        <ReelCard
                                            key={reel.id}
                                            reel={reel}
                                            onClick={() => {
                                                setCurrentReelIndex(reels.findIndex(r => r.id === reel.id));
                                                setIsReelsOpen(true);
                                            }}
                                        />
                                    ))}
                                </div>

                            </motion.div>
                        ) : (
                            <motion.div
                                key="hotplace-view"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                            >
                                {/* Horizontal Story Bar */}
                                <div className="mb-12">
                                    <div className="overflow-x-auto no-scrollbar">
                                        <div className="flex gap-4 sm:gap-6 min-w-max px-8 pt-6 pb-4 items-start">
                                            {stories.map((story) => (
                                                <button
                                                    key={story.id}
                                                    onClick={() => {
                                                        setSelectedStory(story.id);
                                                        setCurrentSlideIndex(0);
                                                        setViewingStory(story);
                                                    }}
                                                    className="relative flex flex-col items-center group outline-none w-20 sm:w-24"
                                                >
                                                    {/* The Base Circle - Always constant size */}
                                                    <div className="relative w-16 h-16 sm:w-20 sm:h-20 flex items-center justify-center">

                                                        {/* Selection Ring - Absolute position, no layout impact */}
                                                        <div className={`absolute inset-[-4px] rounded-full transition-all duration-500 ${selectedStory === story.id
                                                            ? 'bg-gradient-to-tr from-orange-500 via-pink-500 to-yellow-400 opacity-100'
                                                            : 'bg-transparent opacity-0'
                                                            }`} />

                                                        {/* Active/Status Border - Absolute position, no layout impact */}
                                                        <div className={`absolute inset-[-2px] rounded-full border-2 transition-colors duration-300 z-10 ${selectedStory === story.id ? 'border-white' : story.active ? 'border-orange-500' : 'border-gray-100'
                                                            }`} />

                                                        {/* Image wrapper - Completely static size */}
                                                        <div className="relative w-full h-full rounded-full overflow-hidden bg-white z-20 p-0.5 shadow-sm">
                                                            <div className="w-full h-full rounded-full overflow-hidden ring-1 ring-black/5">
                                                                <img
                                                                    src={story.slides && story.slides[0] ? story.slides[0].image : ''}
                                                                    alt={story.name}
                                                                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                                                />
                                                            </div>
                                                        </div>

                                                        {/* Live Badge - Fixed positioning */}
                                                        {story.active && (
                                                            <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 z-30 bg-orange-600 text-white text-[9px] font-black px-2 py-0.5 rounded-full border-2 border-white shadow-md transition-transform group-hover:scale-105">
                                                                LIVE
                                                            </div>
                                                        )}
                                                    </div>

                                                    {/* Text Label - Fixed margin and size */}
                                                    <span className={`mt-4 text-[12px] font-bold tracking-tight transition-colors duration-300 ${selectedStory === story.id || story.active ? 'text-[#1A110D]' : 'text-gray-400'
                                                        } group-hover:text-orange-600`}>
                                                        #{story.name}
                                                    </span>
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                {/* Section Title & Filter */}
                                <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-8 border-b border-gray-100 pb-8">
                                    <div>
                                        <div className="flex items-center gap-2 mb-2">
                                            <span className="w-8 h-px bg-orange-500"></span>
                                            <span className="text-orange-600 font-bold text-[10px] uppercase tracking-[0.4em]">Weekly Best</span>
                                        </div>
                                        <h2 className="text-4xl sm:text-5xl font-serif text-[#1A110D] italic leading-[1.1]">Trending Destinations</h2>
                                    </div>

                                    <div className="flex flex-col gap-6 w-full md:w-auto">
                                        {/* Interactive Search Bar */}
                                        <div className="relative group w-full md:w-80">
                                            <input
                                                type="text"
                                                value={searchQuery}
                                                onChange={(e) => setSearchQuery(e.target.value)}
                                                placeholder="장소, 태그, 감성 검색..."
                                                className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-100 rounded-2xl text-sm focus:bg-white focus:ring-4 focus:ring-orange-100/50 focus:border-orange-200 transition-all outline-none placeholder:text-gray-400 font-medium"
                                            />
                                            <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-orange-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                            </svg>
                                            {searchQuery && (
                                                <button
                                                    onClick={() => setSearchQuery("")}
                                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-300 hover:text-gray-600 transition-colors"
                                                >
                                                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                                    </svg>
                                                </button>
                                            )}
                                        </div>

                                        <div className="flex gap-2 overflow-x-auto no-scrollbar py-2">
                                            {categories.map((cat) => (
                                                <button
                                                    key={cat}
                                                    onClick={() => setActiveCategory(cat)}
                                                    className={`px-6 py-3 rounded-full text-sm font-bold transition-all duration-300 whitespace-nowrap shadow-sm ${activeCategory === cat
                                                        ? 'bg-[#1A110D] text-white shadow-xl shadow-orange-100 -translate-y-1'
                                                        : 'bg-white text-gray-500 border border-gray-100 hover:border-orange-200 hover:text-orange-600 hover:shadow-md'
                                                        }`}
                                                >
                                                    {cat}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                {/* Grid Content */}
                                {filteredItems.length > 0 ? (
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8 lg:gap-12 min-h-[400px]">
                                        {filteredItems.map((item, idx) => (
                                            <article
                                                key={`${item.location}-${idx}-final-v4`}
                                                className="group relative flex flex-col bg-white rounded-[32px] overflow-hidden border border-gray-50 shadow-sm hover:shadow-2xl hover:shadow-orange-100/50 transition-all duration-500 animate-fadeIn"
                                                style={{ animationDelay: `${idx * 0.15}s` }}
                                            >
                                                {/* Image Container */}
                                                <div className="relative aspect-[4/5] overflow-hidden">
                                                    <img
                                                        src={item.image}
                                                        alt={item.location}
                                                        key={item.image}
                                                        onError={(e) => {
                                                            const target = e.target as HTMLImageElement;
                                                            target.src = "https://images.unsplash.com/photo-1620392328124-76679549927b?q=60&w=800"; // Fallback Hanok
                                                        }}
                                                        className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
                                                    />
                                                    {/* Overlays */}
                                                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-60 group-hover:opacity-80 transition-opacity"></div>

                                                    <div className="absolute top-6 left-6 flex flex-col gap-2">
                                                        <span className="px-3 py-1 bg-white/20 backdrop-blur-md border border-white/30 rounded-full text-[10px] font-bold text-white uppercase tracking-widest leading-none">
                                                            {item.category}
                                                        </span>
                                                        <div className="flex items-center gap-1.5 px-3 py-1 bg-black/30 backdrop-blur-md rounded-full text-[10px] text-white font-medium">
                                                            <span className="animate-pulse">🎵</span> {item.music}
                                                        </div>
                                                    </div>

                                                    <button className="absolute top-6 right-6 w-11 h-11 bg-white/20 backdrop-blur-md border border-white/30 rounded-full flex items-center justify-center text-white hover:bg-white hover:text-red-500 transition-all duration-300">
                                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                                                        </svg>
                                                    </button>

                                                    <div className="absolute bottom-8 left-8 right-8 text-white">
                                                        <div className="flex items-center gap-2 mb-2 opacity-80">
                                                            <svg className="w-4 h-4 text-orange-400" fill="currentColor" viewBox="0 0 24 24">
                                                                <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
                                                            </svg>
                                                            <span className="text-xs font-bold tracking-wide">{item.location}</span>
                                                        </div>
                                                        <h3 className="text-2xl sm:text-3xl font-serif italic mb-4 group-hover:translate-x-2 transition-transform duration-500">{item.user}'s Pick</h3>
                                                        <p className="text-sm text-gray-200 line-clamp-2 leading-relaxed font-light mb-6">
                                                            {item.desc}
                                                        </p>
                                                        <div className="flex items-center justify-between">
                                                            <div className="flex gap-2">
                                                                {item.tags.map(tag => (
                                                                    <span key={tag} className="text-[10px] text-orange-200 font-bold">{tag}</span>
                                                                ))}
                                                            </div>
                                                            <div className="flex items-center gap-1 text-xs">
                                                                <span className="text-white font-bold">{item.likes}</span>
                                                                <span className="text-gray-400">likes</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Hover Bottom Action */}
                                                <div className="p-6 bg-white flex items-center justify-between">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-10 h-10 rounded-full bg-[#1A110D] flex items-center justify-center text-xs font-bold text-white uppercase font-serif italic">
                                                            {item.user[0]}
                                                        </div>
                                                        <div className="flex flex-col">
                                                            <span className="text-[13px] font-bold text-[#1A110D]">{item.user}</span>
                                                            <span className="text-[11px] text-gray-400">{item.date}</span>
                                                        </div>
                                                    </div>
                                                    <button className="px-6 py-2 rounded-xl bg-orange-50 text-orange-600 text-xs font-bold hover:bg-orange-600 hover:text-white transition-all duration-300">
                                                        인사이트 보기
                                                    </button>
                                                </div>
                                            </article>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="flex flex-col items-center justify-center py-32 bg-white rounded-[40px] border border-dashed border-gray-200">
                                        <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-6">
                                            <svg className="w-8 h-8 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                                            </svg>
                                        </div>
                                        <p className="text-gray-400 font-medium text-center px-6">
                                            {searchQuery ? `"${searchQuery}"에 매칭되는 게시물이 없습니다.` : "선택하신 카테고리의 게시물이 아직 없습니다."}
                                        </p>
                                        <button onClick={() => { setActiveCategory("전체"); setSearchQuery(""); }} className="mt-4 text-orange-600 text-sm font-bold hover:underline">
                                            전체 결과 보기
                                        </button>
                                    </div>
                                )}

                                {/* Floating Load More / CTA */}
                                <div className="mt-20 text-center">
                                    <button className="group px-8 py-4 bg-white border-2 border-[#1A110D] text-[#1A110D] rounded-full text-sm font-bold hover:bg-[#1A110D] hover:text-white transition-all duration-500 flex items-center gap-3 mx-auto shadow-xl hover:shadow-gray-200">
                                        <span>더 많은 핫플레이스 탐색하기</span>
                                        <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                                        </svg>
                                    </button>
                                    <p className="mt-6 text-gray-400 text-xs font-medium uppercase tracking-[0.2em]">Cafe Dream Curated Insights</p>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </main>





                {/* Toast Notification */}
                {
                    showToast && (
                        <div className="fixed top-10 left-1/2 -translate-x-1/2 z-[110] bg-[#1A110D] text-white px-6 py-3 rounded-2xl shadow-2xl border border-white/10 animate-slideUp font-bold text-sm">
                            {toastMessage}
                        </div>
                    )
                }

                {/* Write Post Modal */}
                {
                    isWriteModalOpen && (
                        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-fadeInFast" onClick={() => setIsWriteModalOpen(false)}>
                            <div className="bg-white w-full max-w-md rounded-[40px] overflow-hidden shadow-3xl animate-slideUp" onClick={e => e.stopPropagation()}>
                                <div className="px-8 py-6 border-b border-gray-100 flex items-center justify-between">
                                    <h3 className="text-xl font-black text-[#1A110D]">새 인사이트 작성</h3>
                                    <button onClick={() => setIsWriteModalOpen(false)} className="text-gray-400 hover:text-black">
                                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                                    </button>
                                </div>
                                <form className="p-8 space-y-6" onSubmit={(e) => {
                                    e.preventDefault();
                                    const formData = new FormData(e.currentTarget);
                                    handleAddPost({
                                        user: "CafeDreamer",
                                        music: "Lauv • Paris in the Rain",
                                        location: formData.get('location'),
                                        category: formData.get('category'),
                                        desc: formData.get('desc'),
                                        image: selectedImage || "/media_cafe.png",
                                        likes: "0",
                                        date: new Date().toISOString().split('T')[0].replace(/-/g, '.'),
                                        tags: ["#새게시물", "#인사이트"]
                                    });
                                }}>
                                    {/* Image Upload Area */}
                                    <div className="space-y-3">
                                        <label className="text-[10px] font-black text-orange-600 uppercase tracking-widest">사진 업로드</label>
                                        <div
                                            className="relative group aspect-video rounded-3xl bg-gray-50 border-2 border-dashed border-gray-100 flex flex-col items-center justify-center cursor-pointer hover:bg-orange-50 hover:border-orange-200 transition-all overflow-hidden"
                                            onClick={() => document.getElementById('image-upload')?.click()}
                                        >
                                            {selectedImage ? (
                                                <img src={selectedImage} alt="preview" className="w-full h-full object-cover animate-fadeInFast" />
                                            ) : (
                                                <>
                                                    <div className="w-12 h-12 rounded-2xl bg-white shadow-sm flex items-center justify-center text-orange-500 mb-2 group-hover:scale-110 transition-transform">
                                                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                                                    </div>
                                                    <span className="text-xs font-bold text-gray-400">공간의 사진을 선택해주세요</span>
                                                </>
                                            )}
                                            <input
                                                id="image-upload"
                                                type="file"
                                                accept="image/*"
                                                className="hidden"
                                                onChange={handleImageChange}
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-orange-600 uppercase tracking-widest">장소명</label>
                                            <input name="location" required type="text" placeholder="장소 입력" className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-orange-100 focus:border-orange-500 outline-none transition-all text-xs font-medium" />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-orange-600 uppercase tracking-widest">카테고리</label>
                                            <select name="category" className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-orange-100 focus:border-orange-500 outline-none transition-all text-xs font-medium">
                                                {categories.filter(c => c !== "전체").map(c => <option key={c} value={c}>{c}</option>)}
                                            </select>
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-orange-600 uppercase tracking-widest">인사이트 요약</label>
                                        <textarea name="desc" required placeholder="공간의 매력 포인트를 설명해주세요..." className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-orange-100 focus:border-orange-500 outline-none transition-all text-xs font-medium h-24 resize-none" />
                                    </div>
                                    <button type="submit" className="w-full py-4 bg-[#1A110D] text-white font-black rounded-2xl hover:bg-orange-600 transition-all transform active:scale-95 shadow-xl">
                                        게시하기
                                    </button>
                                </form>
                            </div>
                        </div>
                    )
                }

                {/* Immersive Reels Modal - Split View for PC */}
                {
                    isReelsOpen && (
                        <div className="fixed inset-0 z-[130] bg-[#1A110D]/95 backdrop-blur-2xl flex items-center justify-center animate-fadeInFast p-4 lg:p-12 overflow-hidden">
                            <div className="relative w-full max-w-6xl h-full flex flex-col lg:flex-row bg-black rounded-[40px] overflow-hidden shadow-3xl">
                                {/* Left: Video Section */}
                                <div className="flex-1 relative bg-black flex items-center justify-center order-1 lg:order-1">
                                    {!hasVideoError ? (
                                        <video
                                            key={reels[currentReelIndex].video}
                                            src={reels[currentReelIndex].video}
                                            autoPlay
                                            loop
                                            muted={isMuted}
                                            playsInline
                                            preload="auto"
                                            onPlaying={() => setIsVideoLoading(false)}
                                            onWaiting={() => setIsVideoLoading(true)}
                                            onCanPlay={() => setIsVideoLoading(false)}
                                            onError={() => {
                                                setHasVideoError(true);
                                                setIsVideoLoading(false);
                                            }}
                                            className="h-full w-auto max-w-full object-contain"
                                        />
                                    ) : (
                                        <div className="w-full h-full relative">
                                            <img src={reels[currentReelIndex].fallbackImage} alt="fallback" className="w-full h-full object-cover" />
                                        </div>
                                    )}

                                    {/* Loading Spinner */}
                                    {isVideoLoading && (
                                        <div className="absolute inset-0 flex items-center justify-center z-10">
                                            <div className="w-12 h-12 border-4 border-white/10 border-t-orange-500 rounded-full animate-spin"></div>
                                        </div>
                                    )}

                                    {/* Controls Overlay */}
                                    <div className="absolute top-8 left-8 flex items-center gap-4 z-20">
                                        <button onClick={() => setIsReelsOpen(false)} className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center text-white hover:bg-orange-600 transition-all shadow-xl">
                                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                                        </button>
                                        <h3 className="text-white font-black text-lg tracking-tight px-4 py-2 bg-white/10 backdrop-blur-md rounded-2xl border border-white/10 hidden sm:block">핫플레이스 릴스</h3>
                                    </div>

                                    <button
                                        onClick={() => {
                                            setIsMuted(!isMuted);
                                            setShowMuteFeedback(true);
                                            setTimeout(() => setShowMuteFeedback(false), 1000);
                                        }}
                                        className="absolute bottom-10 right-10 w-14 h-14 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center text-white hover:bg-white/20 transition-all z-20"
                                    >
                                        {isMuted ? '🔇' : '🔊'}
                                    </button>
                                </div>

                                {/* Right: Info Section (Deep Look for PC) */}
                                <div className="w-full lg:w-[450px] bg-white lg:order-2 flex flex-col h-full text-[#1A110D]">
                                    <div className="p-10 flex-1 overflow-y-auto custom-scrollbar">
                                        <div className="flex items-center justify-between mb-8">
                                            <div className="flex items-center gap-4">
                                                <div className="w-14 h-14 rounded-2xl bg-orange-100 flex items-center justify-center font-black text-orange-600 text-xl font-serif">
                                                    {reels[currentReelIndex].user[1]}
                                                </div>
                                                <div>
                                                    <p className="font-black text-lg leading-none mb-1">{reels[currentReelIndex].user}</p>
                                                    <p className="text-xs text-orange-600 font-bold">인사이트 작성자</p>
                                                </div>
                                            </div>
                                            <button className="px-5 py-2 bg-gray-50 text-gray-400 text-[10px] font-black rounded-xl uppercase hover:bg-gray-100 transition-colors">Follow</button>
                                        </div>

                                        <div className="mb-10 p-6 bg-orange-50/50 rounded-3xl border border-orange-100">
                                            <h4 className="text-[10px] font-black text-orange-600 uppercase tracking-widest mb-3">Today's Place</h4>
                                            <div className="flex items-center gap-3 mb-4">
                                                <span className="text-2xl">📍</span>
                                                <span className="font-black text-xl">{reels[currentReelIndex].location}</span>
                                            </div>
                                            <p className="text-sm text-[#1A110D]/80 leading-relaxed font-medium">
                                                {reels[currentReelIndex].desc}
                                            </p>
                                        </div>

                                        <div className="space-y-6">
                                            <h4 className="text-sm font-black flex items-center gap-2">
                                                <span className="w-1.5 h-1.5 rounded-full bg-orange-600"></span>
                                                사장님의 인사이트 핵심
                                            </h4>
                                            <div className="grid grid-cols-2 gap-3">
                                                <div className="p-5 rounded-2xl bg-gray-50 border border-gray-100">
                                                    <p className="text-[10px] font-black text-gray-400 uppercase mb-2">방문 집중 시간</p>
                                                    <p className="font-black text-md">오후 2시 ~ 4시</p>
                                                </div>
                                                <div className="p-5 rounded-2xl bg-gray-50 border border-gray-100">
                                                    <p className="text-[10px] font-black text-gray-400 uppercase mb-2">주요 방문층</p>
                                                    <p className="font-black text-md">20대 여성 • 커플</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="p-10 bg-gray-50/50 border-t border-gray-100 mt-auto">
                                        <div className="flex gap-4">
                                            <button className="flex-1 py-5 bg-[#1A110D] text-white font-black rounded-3xl hover:bg-orange-600 transition-all shadow-xl active:scale-95">
                                                이 공간 더 자세히 보기
                                            </button>
                                            <button className="w-16 h-16 rounded-3xl bg-white border border-gray-100 flex items-center justify-center text-2xl shadow-sm hover:bg-orange-50 transition-colors">
                                                ❤️
                                            </button>
                                        </div>
                                        <div className="flex items-center justify-center gap-4 mt-6">
                                            <button
                                                onClick={() => setCurrentReelIndex(prev => (prev - 1 + reels.length) % reels.length)}
                                                className="text-gray-300 hover:text-black transition-colors"
                                            >
                                                ← 이전
                                            </button>
                                            <div className="flex gap-1.5">
                                                {reels.map((_, i) => (
                                                    <div key={i} className={`w-1.5 h-1.5 rounded-full transition-all ${i === currentReelIndex ? 'bg-orange-600 w-4' : 'bg-gray-200'}`} />
                                                ))}
                                            </div>
                                            <button
                                                onClick={() => setCurrentReelIndex(prev => (prev + 1) % reels.length)}
                                                className="text-[#1A110D] font-black hover:text-orange-600 transition-colors"
                                            >
                                                다음 →
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                {/* Navigation Areas & Pagination Indicator moved inside the Reels Modal check */}
                                <div
                                    className="absolute inset-y-0 left-0 w-1/4 z-30 cursor-pointer"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setHasVideoError(false);
                                        setCurrentReelIndex(prev => prev > 0 ? prev - 1 : reels.length - 1);
                                    }}
                                />
                                <div
                                    className="absolute inset-y-0 right-0 w-3/4 z-30 cursor-pointer"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setHasVideoError(false);
                                        setCurrentReelIndex(prev => (prev + 1) % reels.length);
                                    }}
                                />

                                {/* Pagination Indicator */}
                                <div className="absolute right-6 top-1/2 -translate-y-1/2 flex flex-col gap-2 z-30">
                                    {reels.map((_, idx) => (
                                        <div
                                            key={idx}
                                            className={`w-1 transition-all duration-300 rounded-full ${idx === currentReelIndex ? 'h-8 bg-orange-500' : 'h-3 bg-white/30'}`}
                                        />
                                    ))}
                                </div>
                            </div>
                        </div>
                    )
                }
                {/* Desktop Bottom Left Floating Link */}
                <div className="fixed bottom-10 left-10 z-[60] hidden lg:block animate-fadeIn" style={{ animationDelay: '1s' }}>
                    <Link href="/" className="group flex items-center gap-3 px-6 py-3 bg-white/40 backdrop-blur-xl border border-white/20 rounded-full text-sm font-bold text-[#1A110D] hover:bg-white hover:shadow-2xl hover:shadow-orange-100 transition-all duration-300">
                        <svg className="w-5 h-5 transition-transform group-hover:-translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                        </svg>
                        <span>랜딩페이지로 돌아가기</span>
                    </Link>
                </div>

                {/* Story Viewer Modal */}
                <AnimatePresence>
                    {viewingStory && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 z-[150] flex items-center justify-center bg-black/95 backdrop-blur-2xl"
                            onClick={() => setViewingStory(null)}
                        >
                            <motion.div
                                initial={{ scale: 0.9, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                className="relative w-full max-w-[450px] aspect-[9/16] overflow-hidden sm:rounded-[40px] shadow-2xl bg-black"
                                onClick={e => e.stopPropagation()}
                            >
                                <div className="absolute top-6 left-4 right-4 z-50 flex gap-1.5 h-1">
                                    {viewingStory.slides?.map((_: any, idx: number) => (
                                        <div key={idx} className="flex-1 bg-white/20 rounded-full overflow-hidden h-full">
                                            <div className="h-full bg-white transition-all duration-100 ease-linear" style={{ width: idx === currentSlideIndex ? `${progress}%` : idx < currentSlideIndex ? '100%' : '0%' }} />
                                        </div>
                                    ))}
                                </div>
                                <img src={viewingStory.slides[currentSlideIndex]?.image} className="w-full h-full object-cover animate-zoom" key={currentSlideIndex} alt="story" />
                                <div className="absolute top-12 left-6 right-6 z-50 flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 border-2 border-white p-0.5 overflow-hidden">
                                            <img src={viewingStory.avatar} className="w-full h-full object-cover rounded-full" alt="avatar" />
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="text-white text-sm font-black tracking-tight">{viewingStory.user}</span>
                                            <span className="text-white/60 text-[10px] uppercase font-bold tracking-widest leading-tight">Partner Spotlight</span>
                                        </div>
                                    </div>
                                    <button onClick={() => setViewingStory(null)} className="w-10 h-10 flex items-center justify-center text-white/50 hover:text-white">
                                        <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                                    </button>
                                </div>
                                <div className="absolute bottom-10 left-6 right-6 z-50">
                                    <div className="p-6 bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl">
                                        <h3 className="text-white text-xl font-black mb-1">{viewingStory.slides[currentSlideIndex]?.title}</h3>
                                        <p className="text-white/80 text-sm mb-4 leading-relaxed">{viewingStory.slides[currentSlideIndex]?.desc}</p>
                                        <button className="w-full py-4 bg-white text-black font-black rounded-2xl shadow-xl active:scale-95 transition-transform">공간 소식 듣기</button>
                                    </div>
                                </div>
                                <div className="absolute inset-y-0 left-0 w-1/4 cursor-w-resize z-40" onClick={(e) => {
                                    e.stopPropagation();
                                    if (currentSlideIndex > 0) { setCurrentSlideIndex(prev => prev - 1); setProgress(0); }
                                    else setViewingStory(null);
                                }} />
                                <div className="absolute inset-y-0 right-0 w-3/4 cursor-e-resize z-40" onClick={(e) => {
                                    e.stopPropagation();
                                    if (currentSlideIndex < viewingStory.slides.length - 1) { setCurrentSlideIndex(prev => prev + 1); setProgress(0); }
                                    else setViewingStory(null);
                                }} />
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* AI Reel Maker Modal */}
                <AnimatePresence>
                    {isReelMakerOpen && (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[200] bg-black/95 backdrop-blur-3xl flex items-center justify-center p-4 overflow-y-auto" onClick={() => setIsReelMakerOpen(false)}>
                            <motion.div initial={{ scale: 0.9, y: 30 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 30 }} className="bg-[#1A110D] border border-white/10 w-full max-w-5xl rounded-[56px] overflow-hidden shadow-3xl text-white" onClick={e => e.stopPropagation()}>
                                <div className="flex flex-col md:flex-row h-[85vh] min-h-[650px]">
                                    <div className="w-full md:w-[500px] bg-black relative border-r border-white/5 flex items-center justify-center overflow-hidden">
                                        {reelStep === 'preview' ? (
                                            <div className="w-full h-full relative group">
                                                <motion.img
                                                    key={currentSlideIndex}
                                                    initial={{ opacity: 0, scale: 1.1 }}
                                                    animate={{ opacity: 1, scale: 1 }}
                                                    src={uploadedPhotos[currentSlideIndex % uploadedPhotos.length] || "https://images.unsplash.com/photo-1554118811-1e0d58224f24?q=80&w=800"}
                                                    className="w-full h-full object-cover"
                                                    alt="preview"
                                                />
                                                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent"></div>
                                                <div className="absolute bottom-12 left-10">
                                                    <div className="flex items-center gap-4 mb-4">
                                                        <div className="w-12 h-12 rounded-full bg-orange-600 flex items-center justify-center font-black shadow-xl shadow-orange-600/30">CD</div>
                                                        <div><p className="font-black text-base">@cafe_dream_ai</p><p className="text-[11px] text-orange-400 font-bold uppercase tracking-widest">🎵 {selectedMusic} mood</p></div>
                                                    </div>
                                                    <p className="text-white/90 text-sm font-medium leading-relaxed max-w-[300px]">AI-Crafted High Fidelity Brand Storytelling</p>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="text-center p-16">
                                                <div className="w-28 h-28 bg-orange-600/10 rounded-[40px] flex items-center justify-center mx-auto mb-8 border border-orange-600/20 shadow-inner"><span className="text-5xl">🎬</span></div>
                                                <h3 className="text-2xl font-black mb-3">AI Cinema Logic</h3>
                                                <p className="text-sm text-gray-500 leading-relaxed font-medium">최고의 감성 릴스를 위한 시각 패턴 분석 시스템</p>
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex-1 bg-white p-16 flex flex-col h-full overflow-y-auto custom-scrollbar">
                                        <div className="flex-1 text-[#1A110D]">
                                            <div className="flex items-center justify-between mb-12">
                                                <div>
                                                    <h2 className="text-3xl font-black tracking-tight mb-1">AI 릴스 메이커</h2>
                                                    <p className="text-[10px] font-black text-orange-600 uppercase tracking-[0.3em]">Premium Social Intelligence</p>
                                                </div>
                                                <button onClick={() => setIsReelMakerOpen(false)} className="w-12 h-12 rounded-2xl bg-gray-50 flex items-center justify-center text-gray-400 hover:text-black transition-all hover:rotate-90">
                                                    <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" /></svg>
                                                </button>
                                            </div>
                                            {reelStep === 'upload' && (
                                                <div className="space-y-12 animate-fadeInFast">
                                                    <div className="space-y-6">
                                                        <label className="text-[11px] font-black text-gray-400 uppercase tracking-[0.2em] flex items-center gap-2">
                                                            <span className="w-1.5 h-1.5 rounded-full bg-orange-600"></span>
                                                            1. Visual Assets ({uploadedPhotos.length}/5)
                                                        </label>
                                                        <div className="grid grid-cols-3 gap-4">
                                                            {uploadedPhotos.map((photo, i) => <div key={i} className="aspect-[4/5] rounded-[24px] overflow-hidden relative group shadow-lg"><img src={photo} className="w-full h-full object-cover" alt="upload" /><button onClick={() => setUploadedPhotos(prev => prev.filter((_, idx) => idx !== i))} className="absolute top-3 right-3 w-8 h-8 bg-black/50 backdrop-blur-md rounded-full flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-all hover:scale-110">×</button></div>)}
                                                            {uploadedPhotos.length < 5 && (
                                                                <button onClick={() => {
                                                                    const demoPhotos = ["https://images.unsplash.com/photo-1509042239860-f550ce710b93?q=80&w=800", "https://images.unsplash.com/photo-1554118811-1e0d58224f24?q=80&w=800", "https://images.unsplash.com/photo-1511920170033-f8396924c348?q=80&w=800"];
                                                                    setUploadedPhotos(prev => [...prev, demoPhotos[prev.length % demoPhotos.length]]);
                                                                }} className="aspect-[4/5] rounded-[24px] border-2 border-dashed border-gray-100 flex flex-col items-center justify-center hover:bg-orange-50 hover:border-orange-200 transition-all text-gray-300 hover:text-orange-600 group">
                                                                    <span className="text-3xl font-light group-hover:scale-125 transition-transform">+</span>
                                                                    <span className="text-[11px] font-black uppercase mt-1">Upload</span>
                                                                </button>
                                                            )}
                                                        </div>
                                                    </div>
                                                    <div className="space-y-6">
                                                        <label className="text-[11px] font-black text-gray-400 uppercase tracking-[0.2em] flex items-center gap-2">
                                                            <span className="w-1.5 h-1.5 rounded-full bg-orange-600"></span>
                                                            2. Sonic Identity
                                                        </label>
                                                        <div className="grid grid-cols-1 gap-2">
                                                            {["Trend Jazz", "Lo-Fi Soul", "Upbeat Pop"].map(m => <button key={m} onClick={() => setSelectedMusic(m)} className={`w-full p-6 rounded-3xl flex items-center justify-between transition-all border-2 ${selectedMusic === m ? 'bg-orange-50 border-orange-600 shadow-xl' : 'bg-transparent border-gray-50 hover:bg-gray-50'}`}><span className="font-bold text-lg">{m}</span>{selectedMusic === m && <span className="w-8 h-8 rounded-full bg-orange-600 flex items-center justify-center text-white text-xs">✓</span>}</button>)}
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                            {reelStep === 'generating' && (
                                                <div className="h-full flex flex-col items-center justify-center py-20 animate-fadeInFast">
                                                    <div className="w-24 h-24 border-t-4 border-orange-600 rounded-full animate-spin mb-10 shadow-2xl" />
                                                    <h3 className="text-2xl font-black mb-3">AI Synthesis in Progress</h3>
                                                    <p className="text-gray-400 font-medium animate-pulse">패턴 분석 및 시네마틱 렌더링 중...</p>
                                                </div>
                                            )}
                                            {reelStep === 'preview' && (
                                                <div className="space-y-10 animate-fadeInFast">
                                                    <div className="p-10 rounded-[40px] bg-orange-50 border-2 border-orange-100 shadow-sm relative overflow-hidden">
                                                        <div className="relative z-10">
                                                            <h4 className="text-2xl font-black text-[#1A110D] mb-3">프리미엄 릴스 완성</h4>
                                                            <p className="text-gray-600 text-sm leading-relaxed font-medium">AI가 브랜드 가치를 높이는 최적의 구성을 찾아냈습니다. SNS에 바로 공유해보세요.</p>
                                                        </div>
                                                        <span className="absolute -top-10 -right-10 text-[100px] opacity-10">✨</span>
                                                    </div>
                                                    <div className="grid grid-cols-2 gap-4">
                                                        <div className="p-8 rounded-[32px] bg-gray-50 border border-gray-100 flex flex-col justify-center"><p className="text-[10px] font-black text-gray-400 uppercase mb-2 tracking-widest">Expected Performance</p><p className="text-3xl font-black text-orange-600">+45% <span className="text-xs text-black/40">CTR</span></p></div>
                                                        <div className="p-8 rounded-[32px] bg-[#1A110D] flex flex-col justify-center text-white"><p className="text-[10px] font-black text-white/30 uppercase mb-2 tracking-widest">Analysis Result</p><p className="text-2xl font-black">High Intent</p></div>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                        <div className="mt-12 flex gap-4">
                                            {reelStep === 'upload' && <button disabled={uploadedPhotos.length === 0} onClick={() => { setReelStep('generating'); setTimeout(() => setReelStep('preview'), 3000); }} className="w-full py-6 rounded-[32px] bg-[#1A110D] text-white font-black text-xl shadow-2xl hover:bg-orange-600 transition-all disabled:opacity-20 active:scale-95">시네마틱 릴스 생성하기</button>}
                                            {reelStep === 'preview' && <><button onClick={() => { setIsReelMakerOpen(false); setToastMessage("📲 릴스가 갤러리에 저장되었습니다!"); setShowToast(true); }} className="flex-1 py-6 rounded-[32px] bg-orange-600 text-white font-black text-xl shadow-2xl hover:bg-black transition-all active:scale-95">저장 및 공유</button><button onClick={() => setReelStep('upload')} className="px-12 py-6 rounded-[32px] bg-gray-50 text-[#1A110D] font-black text-xl border border-gray-100 hover:bg-white transition-all">Re-edit</button></>}
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Unified Mobile Bottom Navigation */}
                <div className="lg:hidden fixed bottom-0 left-0 right-0 z-[100] bg-white/80 backdrop-blur-2xl border-t border-gray-100 px-8 py-4 pb-8 flex items-center justify-between shadow-[0_-10px_40px_rgba(0,0,0,0.05)]">
                    <Link href="/" className="flex flex-col items-center gap-1 group">
                        <span className="text-xl group-active:scale-90 transition-transform">🏠</span>
                        <span className="text-[10px] font-bold text-gray-400">홈</span>
                    </Link>
                    <button
                        onClick={() => setActiveNav('핫플레이스')}
                        className={`flex flex-col items-center gap-1 ${activeNav === '핫플레이스' ? 'opacity-100' : 'opacity-40 hover:opacity-100 transition-opacity'}`}
                    >
                        <span className="text-xl">🔥</span>
                        <span className={`text-[10px] font-bold ${activeNav === '핫플레이스' ? 'text-orange-600' : 'text-gray-400'} font-['Outfit']`}>HotPlace</span>
                    </button>
                    <button onClick={() => { setActiveNav('트렌드 릴스'); setIsReelsOpen(true); }} className="relative -top-6 w-16 h-16 bg-[#1A110D] rounded-[24px] shadow-2xl shadow-orange-900/20 flex items-center justify-center group active:scale-90 transition-all">
                        <span className="text-2xl group-hover:scale-110 transition-transform">🎞️</span>
                        <div className="absolute -top-1 -right-1 w-4 h-4 bg-orange-600 rounded-full border-2 border-white animate-pulse"></div>
                    </button>
                    <button onClick={() => { setIsReelMakerOpen(true); setReelStep('upload'); }} className="flex flex-col items-center gap-1 group">
                        <span className="text-xl group-active:scale-90 transition-transform">✨</span>
                        <span className="text-[10px] font-bold text-gray-400">AI</span>
                    </button>
                    <Link href="/profile" className="flex flex-col items-center gap-1 group">
                        <span className="text-xl group-active:scale-90 transition-transform">👤</span>
                        <span className="text-[10px] font-bold text-gray-400">마이</span>
                    </Link>
                </div>




                <style jsx global>{`
                    .custom-scrollbar::-webkit-scrollbar { width: 6px; }
                    .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                    .custom-scrollbar::-webkit-scrollbar-thumb { background: #F1EEE9; border-radius: 10px; }
                    
                    @keyframes fadeInFast { from { opacity: 0; } to { opacity: 1; } }
                    @keyframes zoom { from { transform: scale(1); } to { transform: scale(1.1); } }
                    @keyframes slideUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
                    .animate-zoom { animation: zoom 5.5s ease-out forwards; }
                    .animate-fadeInFast { animation: fadeInFast 0.3s ease-out forwards; }
                    .animate-slideUp { animation: slideUp 0.5s ease-out forwards; }
                    
                    ::selection { background: #ffedd5; color: #9a3412; }
                `}</style>
            </div> {/* Closing flex-1 */}
        </div>
    );
}

