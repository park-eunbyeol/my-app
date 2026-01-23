"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';

type TabType = 'overview' | 'campaigns' | 'analytics' | 'messages' | 'settings';
type OfferType = 'menu' | 'discount' | 'free';
type PlatformType = 'instagram' | 'blog' | 'youtube';

interface Campaign {
    id: number;
    title: string;
    status: string;
    applications: number;
    selected: number;
    spots: number;
    visited: number;
    reviewed: number;
    deadline: string;
    daysLeft: number;
    avgRating?: number;
}

interface Applicant {
    id: number;
    name: string;
    followers: string;
    platform: string;
    status: string;
    avatar: string;
    hasReviewed: boolean;
    campaignId: number;
}

interface Review {
    id: number;
    applicantId: number;
    campaignId: number;
    name: string;
    rating: number;
    comment: string;
    date: string;
    platform: string;
    reach: string;
}

interface Message {
    id: number;
    name: string;
    lastMessage: string;
    time: string;
    unread: boolean;
    avatar: string;
    myReply?: string;
    repliedAt?: string;
}

export default function OwnerDashboardPage() {
    const [mounted, setMounted] = useState<boolean>(false);
    const [activeTab, setActiveTab] = useState<TabType>('overview');
    const [showCreateModal, setShowCreateModal] = useState<boolean>(false);
    const [showApplicantsModal, setShowApplicantsModal] = useState<boolean>(false);
    const [showReviewsModal, setShowReviewsModal] = useState<boolean>(false);
    const [showEditModal, setShowEditModal] = useState<boolean>(false);
    const [showDeleteModal, setShowDeleteModal] = useState<boolean>(false);
    const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null);
    const [modalOfferType, setModalOfferType] = useState<OfferType>('menu');
    const [modalPlatform, setModalPlatform] = useState<PlatformType>('instagram');
    const [selectedMessage, setSelectedMessage] = useState<any>(null);
    const [newMessageText, setNewMessageText] = useState('');

    // New campaign form data
    const [newCampaignTitle, setNewCampaignTitle] = useState('');
    const [newCampaignDescription, setNewCampaignDescription] = useState('');
    const [newCampaignSpots, setNewCampaignSpots] = useState(5);
    const [newCampaignDeadline, setNewCampaignDeadline] = useState('');

    // Initial data for Campaign 1 (주말 브런치 세트)
    const initialApplicants: Applicant[] = [
        { id: 1, name: '김민지', followers: '3.2K', platform: '인스타그램', status: '승인됨', avatar: 'https://i.pravatar.cc/150?img=1', hasReviewed: true, campaignId: 1 },
        { id: 2, name: '이서연', followers: '5.8K', platform: '블로그', status: '승인됨', avatar: 'https://i.pravatar.cc/150?img=5', hasReviewed: true, campaignId: 1 },
        { id: 3, name: '박지훈', followers: '2.1K', platform: '인스타그램', status: '대기중', avatar: 'https://i.pravatar.cc/150?img=12', hasReviewed: false, campaignId: 1 },
        { id: 4, name: '최유진', followers: '4.5K', platform: '유튜브', status: '대기중', avatar: 'https://i.pravatar.cc/150?img=20', hasReviewed: false, campaignId: 1 },
        { id: 5, name: '정민수', followers: '1.8K', platform: '블로그', status: '대기중', avatar: 'https://i.pravatar.cc/150?img=33', hasReviewed: false, campaignId: 1 },
        // Campaign 2 (신메뉴 시그니처 라떼)
        { id: 6, name: '강서현', followers: '6.5K', platform: '인스타그램', status: '승인됨', avatar: 'https://i.pravatar.cc/150?img=9', hasReviewed: false, campaignId: 2 },
        { id: 7, name: '윤지우', followers: '3.8K', platform: '블로그', status: '승인됨', avatar: 'https://i.pravatar.cc/150?img=10', hasReviewed: false, campaignId: 2 },
        { id: 8, name: '한준호', followers: '4.2K', platform: '유튜브', status: '승인됨', avatar: 'https://i.pravatar.cc/150?img=13', hasReviewed: false, campaignId: 2 },
        { id: 9, name: '송하은', followers: '2.9K', platform: '인스타그램', status: '대기중', avatar: 'https://i.pravatar.cc/150?img=16', hasReviewed: false, campaignId: 2 },
        { id: 10, name: '임시우', followers: '5.1K', platform: '블로그', status: '대기중', avatar: 'https://i.pravatar.cc/150?img=24', hasReviewed: false, campaignId: 2 },
        // Campaign 3 (디저트 세트 체험단)
        { id: 11, name: '조예린', followers: '7.2K', platform: '인스타그램', status: '대기중', avatar: 'https://i.pravatar.cc/150?img=25', hasReviewed: false, campaignId: 3 },
        { id: 12, name: '배성훈', followers: '4.1K', platform: '블로그', status: '대기중', avatar: 'https://i.pravatar.cc/150?img=28', hasReviewed: false, campaignId: 3 },
        { id: 13, name: '안지현', followers: '3.5K', platform: '인스타그램', status: '대기중', avatar: 'https://i.pravatar.cc/150?img=30', hasReviewed: false, campaignId: 3 },
    ];

    const initialReviews: Review[] = [
        { id: 1, applicantId: 1, campaignId: 1, name: '김민지', rating: 5, comment: '분위기도 좋고 음료도 맛있어요! 특히 시그니처 라떼가 정말 맛있었습니다. 재방문 의사 100%!', date: '2024.02.20', platform: '인스타그램', reach: '2.8K' },
        { id: 2, applicantId: 2, campaignId: 1, name: '이서연', rating: 5, comment: '사진 찍기 좋은 카페네요. 직원분들도 친절하시고 음료 퀄리티도 훌륭했습니다.', date: '2024.02.19', platform: '블로그', reach: '3.5K' },
    ];

    // Applicants management with localStorage
    const [applicants, setApplicants] = useState<Applicant[]>(() => {
        if (typeof window !== 'undefined') {
            try {
                const saved = localStorage.getItem('cafe-applicants-v2');
                if (saved) {
                    const parsed = JSON.parse(saved);
                    // Check if data is valid and has campaignId property
                    if (Array.isArray(parsed) && parsed.length > 0 && parsed[0].campaignId !== undefined) {
                        return parsed;
                    }
                }
            } catch (e) {
                console.error('Failed to parse applicants from localStorage', e);
            }
            // Clear invalid data and use initial
            localStorage.removeItem('cafe-applicants-v2');
        }
        return initialApplicants;
    });

    const [reviews, setReviews] = useState<Review[]>(() => {
        if (typeof window !== 'undefined') {
            try {
                const saved = localStorage.getItem('cafe-reviews-v2');
                if (saved) {
                    const parsed = JSON.parse(saved);
                    // Check if data is valid and has campaignId property
                    if (Array.isArray(parsed) && parsed.length > 0 && parsed[0].campaignId !== undefined) {
                        return parsed;
                    }
                }
            } catch (e) {
                console.error('Failed to parse reviews from localStorage', e);
            }
            // Clear invalid data and use initial
            localStorage.removeItem('cafe-reviews-v2');
        }
        return initialReviews;
    });

    // Save to localStorage whenever applicants or reviews change
    useEffect(() => {
        if (typeof window !== 'undefined') {
            localStorage.setItem('cafe-applicants-v2', JSON.stringify(applicants));
        }
    }, [applicants]);

    useEffect(() => {
        if (typeof window !== 'undefined') {
            localStorage.setItem('cafe-reviews-v2', JSON.stringify(reviews));
        }
    }, [reviews]);

    const handleApprove = (applicantId: number) => {
        setApplicants(prev => prev.map(app =>
            app.id === applicantId ? { ...app, status: '승인됨' } : app
        ));
    };

    const handleReject = (applicantId: number) => {
        setApplicants(prev => prev.map(app =>
            app.id === applicantId ? { ...app, status: '거절됨' } : app
        ));
    };

    const handleApproveReview = (applicantId: number) => {
        const applicant = applicants.find(a => a.id === applicantId);
        if (applicant) {
            // Mark as reviewed
            setApplicants(prev => prev.map(app =>
                app.id === applicantId ? { ...app, hasReviewed: true } : app
            ));

            // Add a placeholder review
            const newReview = {
                id: reviews.length + 1,
                applicantId: applicantId,
                campaignId: applicant.campaignId,
                name: applicant.name,
                rating: 5,
                comment: '정말 좋은 경험이었습니다! 다음에도 또 방문하고 싶어요.',
                date: new Date().toISOString().split('T')[0].replace(/-/g, '.'),
                platform: applicant.platform,
                reach: '1.5K'
            };
            setReviews(prev => [...prev, newReview]);
        }
    };

    const handleRejectReview = (applicantId: number) => {
        // Remove from approved list by changing status
        setApplicants(prev => prev.map(app =>
            app.id === applicantId ? { ...app, status: '거절됨' } : app
        ));
    };

    // Get approved applicants count and reviews count
    const getApprovedApplicants = (campaignId: number) =>
        applicants.filter(a => a.status === '승인됨' && a.campaignId === campaignId);

    const getApprovedWithReviews = (campaignId: number) =>
        applicants.filter(a => a.status === '승인됨' && a.hasReviewed && a.campaignId === campaignId);

    const getCampaignApplicants = (campaignId: number) =>
        applicants.filter(a => a.campaignId === campaignId);

    // Campaigns with localStorage
    const initialCampaigns: Campaign[] = [
        {
            id: 1,
            title: "주말 브런치 세트 체험단",
            status: "진행중",
            applications: 0,
            selected: 0,
            spots: 5,
            visited: 0,
            reviewed: 0,
            deadline: "2024.02.15",
            daysLeft: -3,
            avgRating: 4.5
        },
        {
            id: 2,
            title: "신메뉴 시그니처 라떼",
            status: "모집중",
            applications: 0,
            selected: 0,
            spots: 5,
            visited: 0,
            reviewed: 0,
            deadline: "2024.02.28",
            daysLeft: 7
        },
        {
            id: 3,
            title: "디저트 세트 체험단",
            status: "모집중",
            applications: 0,
            selected: 0,
            spots: 8,
            visited: 0,
            reviewed: 0,
            deadline: "2024.03.05",
            daysLeft: 11
        }
    ];

    const [campaigns, setCampaigns] = useState<Campaign[]>(() => {
        if (typeof window !== 'undefined') {
            try {
                const saved = localStorage.getItem('cafe-campaigns-v2');
                if (saved) {
                    const parsed = JSON.parse(saved);
                    if (Array.isArray(parsed) && parsed.length > 0) {
                        return parsed;
                    }
                }
            } catch (e) {
                console.error('Failed to parse campaigns from localStorage', e);
            }
            localStorage.removeItem('cafe-campaigns-v2');
        }
        return initialCampaigns;
    });

    // Save campaigns to localStorage
    useEffect(() => {
        if (typeof window !== 'undefined') {
            localStorage.setItem('cafe-campaigns-v2', JSON.stringify(campaigns));
        }
    }, [campaigns]);

    // Update campaigns with dynamic applicant counts
    const campaignsWithCounts = campaigns.map(campaign => ({
        ...campaign,
        applications: getCampaignApplicants(campaign.id).length,
        selected: getApprovedApplicants(campaign.id).length,
        visited: getApprovedApplicants(campaign.id).length,
        reviewed: getApprovedWithReviews(campaign.id).length,
    }));

    const handleCreateCampaign = () => {
        if (!newCampaignTitle || !newCampaignDeadline) {
            alert('캠페인 제목과 마감일을 입력해주세요!');
            return;
        }

        const newCampaign: Campaign = {
            id: campaigns.length + 1,
            title: newCampaignTitle,
            status: "모집중",
            applications: 0,
            selected: 0,
            spots: newCampaignSpots,
            visited: 0,
            reviewed: 0,
            deadline: newCampaignDeadline,
            daysLeft: Math.ceil((new Date(newCampaignDeadline).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)),
        };

        setCampaigns(prev => [...prev, newCampaign]);

        // Reset form
        setNewCampaignTitle('');
        setNewCampaignDescription('');
        setNewCampaignSpots(5);
        setNewCampaignDeadline('');
        setModalOfferType('menu');
        setModalPlatform('instagram');
        setShowCreateModal(false);

        alert('체험단이 등록되었습니다! 🎉');
        setActiveTab('campaigns');
    };

    const handleDeleteCampaign = () => {
        if (!selectedCampaign) return;

        setCampaigns(prev => prev.filter(c => c.id !== selectedCampaign.id));
        setShowDeleteModal(false);
        setSelectedCampaign(null);
        alert('캠페인이 삭제되었습니다.');
    };

    useEffect(() => {
        setMounted(true);
    }, []);

    // Mock data
    const dashboardStats = {
        todayApplications: 5,
        weeklyReviews: 8,
        totalReach: "24.5K",
        expectedReturns: 12,
        activeCampaigns: 3,
        pendingApprovals: 5,
        pendingReviews: 2,
        upcomingVisits: 4
    };

    const recentActivities = [
        { id: 1, type: 'application', message: '김민지님이 "브런치 세트 체험단"에 신청했어요', time: '5분 전', unread: true },
        { id: 2, type: 'review', message: '이서연님이 리뷰를 작성했어요 ⭐⭐⭐⭐⭐', time: '1시간 전', unread: true },
        { id: 3, type: 'visit', message: '박지훈님의 방문 예정일이 내일이에요', time: '3시간 전', unread: false },
        { id: 4, type: 'application', message: '최유진님이 체험단에 신청했어요', time: '5시간 전', unread: false },
        { id: 5, type: 'complete', message: '"신메뉴 라떼 체험단" 캠페인이 완료되었어요', time: '1일 전', unread: false }
    ];

    const upcomingSchedule = [
        { id: 1, reviewer: '김민지', campaign: '브런치 세트 체험', date: '2024.02.22', time: '11:00 AM', status: '확정' },
        { id: 2, reviewer: '이서연', campaign: '신메뉴 라떼 체험', date: '2024.02.22', time: '2:00 PM', status: '확정' },
        { id: 3, reviewer: '박지훈', campaign: '디저트 세트 체험', date: '2024.02.23', time: '3:00 PM', status: '대기' },
        { id: 4, reviewer: '최유진', campaign: '브런치 세트 체험', date: '2024.02.24', time: '12:00 PM', status: '확정' }
    ];

    const analyticsData = {
        totalCampaigns: 8,
        avgApplicationRate: 6.2,
        avgRating: 4.7,
        returnRate: 68,
        topPerformingOffer: "브런치 세트",
        bestPlatform: "인스타그램",
        bestDayOfWeek: "토요일"
    };

    const initialMessages = [
        { id: 1, name: '김민지', lastMessage: '네 감사합니다! 토요일 11시에 방문할게요', time: '10분 전', unread: false, avatar: 'https://i.pravatar.cc/150?img=1', myReply: '네! 토요일에 뵙겠습니다 😊', repliedAt: '5분 전' },
        { id: 2, name: '이서연', lastMessage: '사진 많이 찍어서 리뷰 남기겠습니다!', time: '1시간 전', unread: false, avatar: 'https://i.pravatar.cc/150?img=5', myReply: '감사합니다! 좋은 리뷰 부탁드려요 ☕', repliedAt: '50분 전' },
        { id: 3, name: '박지훈', lastMessage: '주차는 가능한가요?', time: '3시간 전', unread: false, avatar: 'https://i.pravatar.cc/150?img=12', myReply: '네, 매장 뒤편에 주차 공간 있습니다!', repliedAt: '2시간 전' },
        { id: 4, name: '최유진', lastMessage: '체험단 신청했습니다', time: '1일 전', unread: false, avatar: 'https://i.pravatar.cc/150?img=20', myReply: '신청 감사합니다! 곧 결과 안내드리겠습니다', repliedAt: '1일 전' }
    ];

    const [messages, setMessages] = useState<Message[]>(() => {
        if (typeof window !== 'undefined') {
            try {
                const saved = localStorage.getItem('cafe-messages-v2');
                if (saved) {
                    return JSON.parse(saved);
                }
            } catch (e) {
                console.error('Failed to parse messages from localStorage', e);
            }
        }
        return initialMessages;
    });

    // Save messages to localStorage
    useEffect(() => {
        if (typeof window !== 'undefined') {
            localStorage.setItem('cafe-messages-v2', JSON.stringify(messages));
        }
    }, [messages]);

    if (!mounted) return null;

    return (
        <div className="min-h-screen bg-[#FAFAFA] text-[#1A110D] font-sans">
            {/* Navigation */}
            <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
                <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
                    <Link href="/" className="text-xl font-bold tracking-tighter hover:opacity-70 transition-opacity">
                        ☕ CAFÉ DREAM
                    </Link>
                    <div className="flex items-center gap-6">
                        <Link href="/campaigns" className="text-sm font-medium text-gray-500 hover:text-black">내 캠페인</Link>
                        <div className="relative">
                            <button className="text-sm font-medium text-gray-500 hover:text-black">
                                🔔
                            </button>
                            <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full text-white text-[10px] flex items-center justify-center">
                                5
                            </span>
                        </div>
                        <button
                            onClick={() => setShowCreateModal(true)}
                            className="px-4 py-2 bg-orange-600 text-white rounded-full text-sm font-bold shadow-lg hover:bg-orange-700 transition-all"
                        >
                            + 새 체험단
                        </button>
                    </div>
                </div>
            </nav>

            <div className="pt-16 flex">
                {/* Sidebar */}
                <aside className="hidden md:block w-64 bg-white border-r border-gray-100 min-h-screen sticky top-16">
                    <div className="p-6 flex flex-col h-[calc(100vh-4rem)]">
                        <div className="mb-8">
                            <div className="flex items-center gap-3 mb-2">
                                <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center text-xl">
                                    ☕
                                </div>
                                <div>
                                    <h3 className="font-bold">카페 드림 성수점</h3>
                                    <p className="text-xs text-gray-400">성수동 · 카페</p>
                                </div>
                            </div>
                        </div>

                        <nav className="space-y-1 flex-1">
                            <button
                                onClick={() => setActiveTab('overview')}
                                className={`w-full text-left px-4 py-3 rounded-xl font-bold text-sm transition-all ${activeTab === 'overview'
                                    ? 'bg-orange-50 text-orange-600'
                                    : 'text-gray-600 hover:bg-gray-50'
                                    }`}
                            >
                                📊 대시보드
                            </button>
                            <button
                                onClick={() => setActiveTab('campaigns')}
                                className={`w-full text-left px-4 py-3 rounded-xl font-bold text-sm transition-all flex items-center justify-between ${activeTab === 'campaigns'
                                    ? 'bg-orange-50 text-orange-600'
                                    : 'text-gray-600 hover:bg-gray-50'
                                    }`}
                            >
                                <span>📋 캠페인 관리</span>
                                {dashboardStats.pendingApprovals > 0 && (
                                    <span className="bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                                        {dashboardStats.pendingApprovals}
                                    </span>
                                )}
                            </button>
                            <button
                                onClick={() => setActiveTab('analytics')}
                                className={`w-full text-left px-4 py-3 rounded-xl font-bold text-sm transition-all ${activeTab === 'analytics'
                                    ? 'bg-orange-50 text-orange-600'
                                    : 'text-gray-600 hover:bg-gray-50'
                                    }`}
                            >
                                📈 분석
                            </button>
                            <button
                                onClick={() => setActiveTab('messages')}
                                className={`w-full text-left px-4 py-3 rounded-xl font-bold text-sm transition-all flex items-center justify-between ${activeTab === 'messages'
                                    ? 'bg-orange-50 text-orange-600'
                                    : 'text-gray-600 hover:bg-gray-50'
                                    }`}
                            >
                                <span>💬 메시지</span>
                                {messages.filter(m => m.unread).length > 0 && (
                                    <span className="bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                                        {messages.filter(m => m.unread).length}
                                    </span>
                                )}
                            </button>
                            <button
                                onClick={() => setActiveTab('settings')}
                                className={`w-full text-left px-4 py-3 rounded-xl font-bold text-sm transition-all ${activeTab === 'settings'
                                    ? 'bg-orange-50 text-orange-600'
                                    : 'text-gray-600 hover:bg-gray-50'
                                    }`}
                            >
                                ⚙️ 설정
                            </button>
                        </nav>

                        {/* Back to Landing Page */}
                        <div className="pt-4 border-t border-gray-100">
                            <Link
                                href="/"
                                className="flex items-center gap-2 px-4 py-3 text-gray-500 hover:text-orange-600 hover:bg-orange-50 rounded-xl transition-all font-bold text-sm"
                            >
                                <span>←</span>
                                <span>랜딩페이지로</span>
                            </Link>
                        </div>
                    </div>
                </aside>

                {/* Main Content */}
                <main className="flex-1 p-6 md:p-10">
                    <div className="max-w-6xl mx-auto">

                        {/* Overview Tab */}
                        {activeTab === 'overview' && (
                            <div>
                                <h1 className="text-3xl font-black mb-8">안녕하세요, 사장님! 👋</h1>

                                {/* Quick Stats */}
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                                    <div className="bg-white p-6 rounded-2xl border border-gray-100">
                                        <p className="text-xs text-gray-400 mb-2">오늘 신청자</p>
                                        <p className="text-3xl font-black text-orange-600">{dashboardStats.todayApplications}</p>
                                    </div>
                                    <div className="bg-white p-6 rounded-2xl border border-gray-100">
                                        <p className="text-xs text-gray-400 mb-2">이번 주 리뷰</p>
                                        <p className="text-3xl font-black text-green-600">{dashboardStats.weeklyReviews}</p>
                                    </div>
                                    <div className="bg-white p-6 rounded-2xl border border-gray-100">
                                        <p className="text-xs text-gray-400 mb-2">총 도달수</p>
                                        <p className="text-3xl font-black text-blue-600">{dashboardStats.totalReach}</p>
                                    </div>
                                    <div className="bg-white p-6 rounded-2xl border border-gray-100">
                                        <p className="text-xs text-gray-400 mb-2">예상 재방문</p>
                                        <p className="text-3xl font-black text-purple-600">{dashboardStats.expectedReturns}</p>
                                    </div>
                                </div>

                                {/* Quick Actions */}
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                                    <button
                                        onClick={() => setShowCreateModal(true)}
                                        className="bg-orange-600 text-white p-6 rounded-2xl hover:bg-orange-700 transition-all shadow-lg"
                                    >
                                        <div className="text-3xl mb-2">➕</div>
                                        <div className="font-bold text-sm">새 체험단</div>
                                    </button>
                                    <button
                                        onClick={() => {
                                            setSelectedCampaign(campaigns[0]);
                                            setShowApplicantsModal(true);
                                        }}
                                        className="bg-white p-6 rounded-2xl border border-gray-100 hover:shadow-lg transition-all relative"
                                    >
                                        <div className="text-3xl mb-2">✅</div>
                                        <div className="font-bold text-sm">신청자 승인</div>
                                        {dashboardStats.pendingApprovals > 0 && (
                                            <span className="absolute top-3 right-3 bg-red-500 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center">
                                                {dashboardStats.pendingApprovals}
                                            </span>
                                        )}
                                    </button>
                                    <button
                                        onClick={() => {
                                            setSelectedCampaign(campaigns[0]);
                                            setShowReviewsModal(true);
                                        }}
                                        className="bg-white p-6 rounded-2xl border border-gray-100 hover:shadow-lg transition-all relative"
                                    >
                                        <div className="text-3xl mb-2">📝</div>
                                        <div className="font-bold text-sm">리뷰 확인</div>
                                        {dashboardStats.pendingReviews > 0 && (
                                            <span className="absolute top-3 right-3 bg-red-500 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center">
                                                {dashboardStats.pendingReviews}
                                            </span>
                                        )}
                                    </button>
                                    <button className="bg-white p-6 rounded-2xl border border-gray-100 hover:shadow-lg transition-all">
                                        <div className="text-3xl mb-2">📅</div>
                                        <div className="font-bold text-sm">일정 보기</div>
                                    </button>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {/* Recent Activities */}
                                    <div className="bg-white rounded-2xl border border-gray-100 p-6">
                                        <h2 className="text-xl font-black mb-4">최근 활동</h2>
                                        <div className="space-y-3">
                                            {recentActivities.map((activity) => (
                                                <div
                                                    key={activity.id}
                                                    className={`p-3 rounded-xl flex items-start gap-3 ${activity.unread ? 'bg-orange-50' : 'bg-gray-50'
                                                        }`}
                                                >
                                                    <div className="text-2xl">
                                                        {activity.type === 'application' && '📝'}
                                                        {activity.type === 'review' && '⭐'}
                                                        {activity.type === 'visit' && '📅'}
                                                        {activity.type === 'complete' && '✅'}
                                                    </div>
                                                    <div className="flex-1">
                                                        <p className="text-sm font-medium">{activity.message}</p>
                                                        <p className="text-xs text-gray-400 mt-1">{activity.time}</p>
                                                    </div>
                                                    {activity.unread && (
                                                        <div className="w-2 h-2 bg-orange-500 rounded-full mt-2" />
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Upcoming Schedule */}
                                    <div className="bg-white rounded-2xl border border-gray-100 p-6">
                                        <h2 className="text-xl font-black mb-4">방문 예정</h2>
                                        <div className="space-y-3">
                                            {upcomingSchedule.map((schedule) => (
                                                <div
                                                    key={schedule.id}
                                                    className="p-3 bg-gray-50 rounded-xl"
                                                >
                                                    <div className="flex items-center justify-between mb-2">
                                                        <span className="font-bold">{schedule.reviewer}</span>
                                                        <span className={`text-xs px-2 py-1 rounded-full ${schedule.status === '확정'
                                                            ? 'bg-green-100 text-green-700'
                                                            : 'bg-yellow-100 text-yellow-700'
                                                            }`}>
                                                            {schedule.status}
                                                        </span>
                                                    </div>
                                                    <p className="text-xs text-gray-500 mb-1">{schedule.campaign}</p>
                                                    <p className="text-xs font-bold text-gray-700">
                                                        📅 {schedule.date} · 🕐 {schedule.time}
                                                    </p>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Campaigns Tab */}
                        {activeTab === 'campaigns' && (
                            <div>
                                <div className="flex items-center justify-between mb-8">
                                    <h1 className="text-3xl font-black">캠페인 관리</h1>
                                    <button
                                        onClick={() => setShowCreateModal(true)}
                                        className="px-6 py-3 bg-orange-600 text-white rounded-xl font-bold hover:bg-orange-700 transition-all"
                                    >
                                        + 새 체험단 만들기
                                    </button>
                                </div>

                                <div className="space-y-6">
                                    {campaignsWithCounts.map((campaign) => (
                                        <div key={campaign.id} className="bg-white rounded-2xl border border-gray-100 p-6">
                                            <div className="flex items-start justify-between mb-4">
                                                <div>
                                                    <h3 className="text-xl font-black mb-2">{campaign.title}</h3>
                                                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${campaign.status === '진행중'
                                                        ? 'bg-blue-100 text-blue-700'
                                                        : 'bg-green-100 text-green-700'
                                                        }`}>
                                                        {campaign.status}
                                                    </span>
                                                </div>
                                                <button
                                                    onClick={() => {
                                                        setSelectedCampaign(campaign);
                                                        setShowDeleteModal(true);
                                                    }}
                                                    className="text-red-500 hover:text-red-700 hover:bg-red-50 p-2 rounded-lg transition-all"
                                                    title="캠페인 삭제"
                                                >
                                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                    </svg>
                                                </button>
                                            </div>

                                            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-4">
                                                <div className="bg-gray-50 p-3 rounded-xl">
                                                    <p className="text-xs text-gray-400 mb-1">신청자</p>
                                                    <p className="text-xl font-black text-orange-600">{campaign.applications}명</p>
                                                </div>
                                                <div className="bg-gray-50 p-3 rounded-xl">
                                                    <p className="text-xs text-gray-400 mb-1">선발</p>
                                                    <p className="text-xl font-black">{campaign.selected}/{campaign.spots}명</p>
                                                </div>
                                                <div className="bg-gray-50 p-3 rounded-xl">
                                                    <p className="text-xs text-gray-400 mb-1">방문완료</p>
                                                    <p className="text-xl font-black text-blue-600">{campaign.visited}명</p>
                                                </div>
                                                <div className="bg-gray-50 p-3 rounded-xl">
                                                    <p className="text-xs text-gray-400 mb-1">리뷰</p>
                                                    <p className="text-xl font-black text-green-600">{campaign.reviewed}개</p>
                                                </div>
                                                <div className="bg-gray-50 p-3 rounded-xl">
                                                    <p className="text-xs text-gray-400 mb-1">마감</p>
                                                    <p className={`text-xl font-black ${campaign.daysLeft <= 0 ? 'text-gray-600' : 'text-red-600'}`}>
                                                        {campaign.daysLeft <= 0 ? '마감' : `D-${campaign.daysLeft}`}
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="mb-4">
                                                <div className="flex items-center justify-between text-xs text-gray-500 mb-2">
                                                    <span>진행률</span>
                                                    <span>
                                                        {campaign.selected > 0
                                                            ? Math.round((campaign.visited / campaign.selected) * 100)
                                                            : 0}%
                                                    </span>
                                                </div>
                                                <div className="w-full bg-gray-100 rounded-full h-2">
                                                    <div
                                                        className="bg-orange-500 h-2 rounded-full transition-all"
                                                        style={{
                                                            width: campaign.selected > 0
                                                                ? `${Math.round((campaign.visited / campaign.selected) * 100)}%`
                                                                : '0%'
                                                        }}
                                                    />
                                                </div>
                                            </div>

                                            <div className="flex gap-3">
                                                <button
                                                    onClick={() => {
                                                        setSelectedCampaign(campaign);
                                                        setShowApplicantsModal(true);
                                                    }}
                                                    className="flex-1 px-4 py-2 bg-orange-600 text-white rounded-xl font-bold hover:bg-orange-700 transition-colors"
                                                >
                                                    신청자 관리
                                                </button>
                                                <button
                                                    onClick={() => {
                                                        setSelectedCampaign(campaign);
                                                        setShowReviewsModal(true);
                                                    }}
                                                    className="px-4 py-2 bg-gray-100 text-gray-700 rounded-xl font-bold hover:bg-gray-200 transition-colors"
                                                >
                                                    리뷰 보기
                                                </button>
                                                <button
                                                    onClick={() => {
                                                        setSelectedCampaign(campaign);
                                                        setShowEditModal(true);
                                                    }}
                                                    className="px-4 py-2 bg-gray-100 text-gray-700 rounded-xl font-bold hover:bg-gray-200 transition-colors"
                                                >
                                                    수정
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Analytics Tab */}
                        {activeTab === 'analytics' && (
                            <div>
                                <h1 className="text-3xl font-black mb-8">분석</h1>

                                {/* Overall Performance */}
                                <div className="bg-white rounded-2xl border border-gray-100 p-6 mb-6">
                                    <h2 className="text-xl font-black mb-6">전체 성과</h2>
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                                        <div>
                                            <p className="text-sm text-gray-500 mb-2">총 캠페인</p>
                                            <p className="text-3xl font-black">{analyticsData.totalCampaigns}개</p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-500 mb-2">평균 신청률</p>
                                            <p className="text-3xl font-black text-orange-600">{analyticsData.avgApplicationRate}배</p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-500 mb-2">평균 평점</p>
                                            <p className="text-3xl font-black text-yellow-500">⭐ {analyticsData.avgRating}</p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-500 mb-2">재방문율</p>
                                            <p className="text-3xl font-black text-green-600">{analyticsData.returnRate}%</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Performance Insights */}
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                                    <div className="bg-gradient-to-br from-orange-50 to-white rounded-2xl border border-orange-100 p-6">
                                        <div className="text-3xl mb-3">🏆</div>
                                        <p className="text-sm text-gray-500 mb-1">최고 인기 혜택</p>
                                        <p className="text-xl font-black">{analyticsData.topPerformingOffer}</p>
                                    </div>
                                    <div className="bg-gradient-to-br from-blue-50 to-white rounded-2xl border border-blue-100 p-6">
                                        <div className="text-3xl mb-3">📱</div>
                                        <p className="text-sm text-gray-500 mb-1">최고 효과 플랫폼</p>
                                        <p className="text-xl font-black">{analyticsData.bestPlatform}</p>
                                    </div>
                                    <div className="bg-gradient-to-br from-green-50 to-white rounded-2xl border border-green-100 p-6">
                                        <div className="text-3xl mb-3">📅</div>
                                        <p className="text-sm text-gray-500 mb-1">최적 방문 요일</p>
                                        <p className="text-xl font-black">{analyticsData.bestDayOfWeek}</p>
                                    </div>
                                </div>

                                {/* Chart Placeholder */}
                                <div className="bg-white rounded-2xl border border-gray-100 p-6">
                                    <h2 className="text-xl font-black mb-4">월별 성과 추이</h2>
                                    <div className="h-64 bg-gray-50 rounded-xl flex items-center justify-center text-gray-400">
                                        📊 차트 영역 (Chart.js 등으로 구현)
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Messages Tab */}
                        {activeTab === 'messages' && (
                            <div>
                                <h1 className="text-3xl font-black mb-8">메시지</h1>

                                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                    {/* 메시지 목록 */}
                                    <div className="lg:col-span-1 bg-white rounded-2xl border border-gray-100 overflow-hidden">
                                        {messages.map((message, idx) => (
                                            <div
                                                key={message.id}
                                                onClick={() => {
                                                    setSelectedMessage(message);
                                                    setNewMessageText('');
                                                }}
                                                className={`p-4 hover:bg-gray-50 transition-colors cursor-pointer ${idx !== messages.length - 1 ? 'border-b border-gray-100' : ''
                                                    } ${selectedMessage?.id === message.id ? 'bg-orange-50' : ''}`}
                                            >
                                                <div className="flex items-center gap-3">
                                                    <div className="relative flex-shrink-0">
                                                        <img
                                                            src={message.avatar}
                                                            alt={message.name}
                                                            className="w-12 h-12 rounded-full"
                                                        />
                                                        {message.unread && (
                                                            <div className="absolute -top-1 -right-1 w-3 h-3 bg-orange-500 rounded-full border-2 border-white" />
                                                        )}
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <h3 className="font-bold truncate">{message.name}</h3>
                                                        <p className="text-xs text-gray-400 truncate">
                                                            {message.myReply ? '내가 보낸 메시지' : message.lastMessage}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    {/* 메시지 대화창 */}
                                    <div className="lg:col-span-2">
                                        {selectedMessage ? (
                                            <div className="bg-white rounded-2xl border border-gray-100 flex flex-col h-[600px]">
                                                {/* 헤더 */}
                                                <div className="p-4 border-b border-gray-100 flex items-center gap-3">
                                                    <img
                                                        src={selectedMessage.avatar}
                                                        alt={selectedMessage.name}
                                                        className="w-10 h-10 rounded-full"
                                                    />
                                                    <div>
                                                        <h3 className="font-bold">{selectedMessage.name}</h3>
                                                        <p className="text-xs text-gray-400">활성</p>
                                                    </div>
                                                </div>

                                                {/* 메시지 내용 */}
                                                <div className="flex-1 p-6 overflow-y-auto space-y-4">
                                                    {/* 받은 메시지 */}
                                                    <div className="flex justify-start">
                                                        <div>
                                                            <div className="inline-block bg-gray-100 rounded-2xl rounded-tl-sm px-4 py-3 max-w-md">
                                                                <p className="text-sm text-gray-900">
                                                                    {selectedMessage.lastMessage}
                                                                </p>
                                                            </div>
                                                            <p className="text-xs text-gray-400 mt-1 ml-1">
                                                                {selectedMessage.time}
                                                            </p>
                                                        </div>
                                                    </div>

                                                    {/* 내가 보낸 답장 */}
                                                    {selectedMessage.myReply && (
                                                        <div className="flex justify-end">
                                                            <div>
                                                                <div className="inline-block bg-orange-600 text-white rounded-2xl rounded-tr-sm px-4 py-3 max-w-md">
                                                                    <p className="text-sm">
                                                                        {selectedMessage.myReply}
                                                                    </p>
                                                                </div>
                                                                <p className="text-xs text-gray-400 mt-1 text-right mr-1">
                                                                    {selectedMessage.repliedAt}
                                                                </p>
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>

                                                {/* 메시지 입력창 */}
                                                <div className="p-4 border-t border-gray-100">
                                                    <div className="flex gap-3">
                                                        <input
                                                            type="text"
                                                            value={newMessageText}
                                                            onChange={(e) => setNewMessageText(e.target.value)}
                                                            onKeyPress={(e) => {
                                                                if (e.key === 'Enter' && newMessageText.trim()) {
                                                                    const now = new Date();
                                                                    const timeString = '방금 전';

                                                                    setMessages(prev => prev.map(msg =>
                                                                        msg.id === selectedMessage.id
                                                                            ? {
                                                                                ...msg,
                                                                                myReply: newMessageText.trim(),
                                                                                repliedAt: timeString
                                                                            }
                                                                            : msg
                                                                    ));

                                                                    setSelectedMessage({
                                                                        ...selectedMessage,
                                                                        myReply: newMessageText.trim(),
                                                                        repliedAt: timeString
                                                                    });

                                                                    setNewMessageText('');
                                                                }
                                                            }}
                                                            placeholder="메시지를 입력하세요..."
                                                            className="flex-1 px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500"
                                                        />
                                                        <button
                                                            onClick={() => {
                                                                if (newMessageText.trim()) {
                                                                    const now = new Date();
                                                                    const timeString = '방금 전';

                                                                    setMessages(prev => prev.map(msg =>
                                                                        msg.id === selectedMessage.id
                                                                            ? {
                                                                                ...msg,
                                                                                myReply: newMessageText.trim(),
                                                                                repliedAt: timeString
                                                                            }
                                                                            : msg
                                                                    ));

                                                                    setSelectedMessage({
                                                                        ...selectedMessage,
                                                                        myReply: newMessageText.trim(),
                                                                        repliedAt: timeString
                                                                    });

                                                                    setNewMessageText('');
                                                                }
                                                            }}
                                                            className="px-6 py-3 bg-orange-600 text-white rounded-xl font-bold hover:bg-orange-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
                                                            disabled={!newMessageText.trim()}
                                                        >
                                                            전송
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="bg-white rounded-2xl border border-gray-100 h-[600px] flex items-center justify-center">
                                                <div className="text-center">
                                                    <div className="text-6xl mb-4">💬</div>
                                                    <p className="text-gray-400">메시지를 선택하세요</p>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Settings Tab */}
                        {activeTab === 'settings' && (
                            <div>
                                <h1 className="text-3xl font-black mb-8">설정</h1>

                                <div className="space-y-6">
                                    {/* Cafe Info */}
                                    <div className="bg-white rounded-2xl border border-gray-100 p-6">
                                        <h2 className="text-xl font-black mb-4">카페 정보</h2>
                                        <div className="space-y-4">
                                            <div>
                                                <label className="block text-sm font-bold text-gray-700 mb-2">카페 이름</label>
                                                <input
                                                    type="text"
                                                    defaultValue="카페 드림 성수점"
                                                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-bold text-gray-700 mb-2">주소</label>
                                                <input
                                                    type="text"
                                                    defaultValue="서울시 성동구 성수동 123-45"
                                                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-bold text-gray-700 mb-2">운영 시간</label>
                                                <input
                                                    type="text"
                                                    defaultValue="평일 10:00 - 22:00 / 주말 11:00 - 23:00"
                                                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Notification Settings */}
                                    <div className="bg-white rounded-2xl border border-gray-100 p-6">
                                        <h2 className="text-xl font-black mb-4">알림 설정</h2>
                                        <div className="space-y-4">
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <p className="font-bold">신청자 알림</p>
                                                    <p className="text-sm text-gray-500">새로운 신청자가 있을 때 알림</p>
                                                </div>
                                                <label className="relative inline-flex items-center cursor-pointer">
                                                    <input type="checkbox" className="sr-only peer" defaultChecked />
                                                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-orange-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-600"></div>
                                                </label>
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <p className="font-bold">리뷰 등록 알림</p>
                                                    <p className="text-sm text-gray-500">새로운 리뷰가 등록될 때 알림</p>
                                                </div>
                                                <label className="relative inline-flex items-center cursor-pointer">
                                                    <input type="checkbox" className="sr-only peer" defaultChecked />
                                                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-orange-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-600"></div>
                                                </label>
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <p className="font-bold">캠페인 마감 알림</p>
                                                    <p className="text-sm text-gray-500">캠페인 마감 3일 전 알림</p>
                                                </div>
                                                <label className="relative inline-flex items-center cursor-pointer">
                                                    <input type="checkbox" className="sr-only peer" defaultChecked />
                                                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-orange-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-600"></div>
                                                </label>
                                            </div>
                                        </div>
                                    </div>

                                    <button className="w-full px-6 py-3 bg-orange-600 text-white rounded-xl font-bold hover:bg-orange-700 transition-all">
                                        변경사항 저장
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </main>
            </div>

            {/* Create Campaign Modal */}
            {showCreateModal && (
                <div className="fixed inset-0 z-50 overflow-y-auto">
                    <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:p-0">
                        {/* Background overlay */}
                        <div
                            className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75"
                            onClick={() => setShowCreateModal(false)}
                        />

                        {/* Modal panel */}
                        <div className="relative inline-block w-full max-w-4xl px-4 pt-5 pb-4 overflow-hidden text-left align-bottom transition-all transform bg-white rounded-3xl shadow-xl sm:my-8 sm:align-middle sm:p-8">
                            {/* Close button */}
                            <button
                                onClick={() => setShowCreateModal(false)}
                                className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 text-2xl font-bold"
                            >
                                ✕
                            </button>

                            {/* Modal content - Simplified form */}
                            <div>
                                <h2 className="text-3xl font-black mb-6">새 체험단 만들기</h2>

                                <div className="space-y-6 max-h-[70vh] overflow-y-auto pr-2">
                                    {/* Campaign Title */}
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-2">
                                            캠페인 제목 <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            placeholder="예: 신메뉴 브런치 세트 체험단 모집"
                                            value={newCampaignTitle}
                                            onChange={(e) => setNewCampaignTitle(e.target.value)}
                                            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500"
                                        />
                                    </div>

                                    {/* Campaign Description */}
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-2">
                                            캠페인 설명 <span className="text-red-500">*</span>
                                        </label>
                                        <textarea
                                            placeholder="우리 카페와 체험단에 대해 소개해주세요"
                                            rows={4}
                                            value={newCampaignDescription}
                                            onChange={(e) => setNewCampaignDescription(e.target.value)}
                                            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 resize-none"
                                        />
                                    </div>

                                    {/* Offer Type */}
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-3">
                                            제공 혜택 <span className="text-red-500">*</span>
                                        </label>
                                        <div className="grid grid-cols-3 gap-3">
                                            <button
                                                type="button"
                                                onClick={() => setModalOfferType('menu')}
                                                className={`p-4 border-2 rounded-xl transition-all ${modalOfferType === 'menu'
                                                    ? 'border-orange-500 bg-orange-50'
                                                    : 'border-gray-200 hover:border-gray-300'
                                                    }`}
                                            >
                                                <div className="text-2xl mb-1">🍽️</div>
                                                <div className="text-sm font-bold">메뉴 제공</div>
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => setModalOfferType('discount')}
                                                className={`p-4 border-2 rounded-xl transition-all ${modalOfferType === 'discount'
                                                    ? 'border-orange-500 bg-orange-50'
                                                    : 'border-gray-200 hover:border-gray-300'
                                                    }`}
                                            >
                                                <div className="text-2xl mb-1">💰</div>
                                                <div className="text-sm font-bold">할인 제공</div>
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => setModalOfferType('free')}
                                                className={`p-4 border-2 rounded-xl transition-all ${modalOfferType === 'free'
                                                    ? 'border-orange-500 bg-orange-50'
                                                    : 'border-gray-200 hover:border-gray-300'
                                                    }`}
                                            >
                                                <div className="text-2xl mb-1">🎁</div>
                                                <div className="text-sm font-bold">무료 체험</div>
                                            </button>
                                        </div>
                                    </div>

                                    {/* Menu Items */}
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-2">
                                            제공 메뉴
                                        </label>
                                        <div className="flex gap-3 mb-2">
                                            <input
                                                type="text"
                                                placeholder="메뉴명 (예: 시그니처 라떼)"
                                                className="flex-1 px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500"
                                            />
                                            <input
                                                type="number"
                                                placeholder="수량"
                                                defaultValue="1"
                                                className="w-24 px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500"
                                            />
                                        </div>
                                        <button className="text-sm text-orange-600 font-bold hover:underline">
                                            + 메뉴 추가
                                        </button>
                                    </div>

                                    {/* Recruitment Details */}
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-bold text-gray-700 mb-2">
                                                모집 인원 <span className="text-red-500">*</span>
                                            </label>
                                            <input
                                                type="number"
                                                value={newCampaignSpots}
                                                onChange={(e) => setNewCampaignSpots(parseInt(e.target.value) || 1)}
                                                min="1"
                                                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-bold text-gray-700 mb-2">
                                                신청 마감일 <span className="text-red-500">*</span>
                                            </label>
                                            <input
                                                type="date"
                                                value={newCampaignDeadline}
                                                onChange={(e) => setNewCampaignDeadline(e.target.value)}
                                                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500"
                                            />
                                        </div>
                                    </div>

                                    {/* Platform Selection */}
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-3">
                                            선호 플랫폼
                                        </label>
                                        <div className="flex gap-3">
                                            <button
                                                type="button"
                                                onClick={() => setModalPlatform('instagram')}
                                                className={`flex-1 p-3 border-2 rounded-xl transition-all ${modalPlatform === 'instagram'
                                                    ? 'border-orange-500 bg-orange-50'
                                                    : 'border-gray-200 hover:border-gray-300'
                                                    }`}
                                            >
                                                <div className="text-xl mb-1">📸</div>
                                                <div className="text-xs font-bold">인스타그램</div>
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => setModalPlatform('blog')}
                                                className={`flex-1 p-3 border-2 rounded-xl transition-all ${modalPlatform === 'blog'
                                                    ? 'border-orange-500 bg-orange-50'
                                                    : 'border-gray-200 hover:border-gray-300'
                                                    }`}
                                            >
                                                <div className="text-xl mb-1">✍️</div>
                                                <div className="text-xs font-bold">블로그</div>
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => setModalPlatform('youtube')}
                                                className={`flex-1 p-3 border-2 rounded-xl transition-all ${modalPlatform === 'youtube'
                                                    ? 'border-orange-500 bg-orange-50'
                                                    : 'border-gray-200 hover:border-gray-300'
                                                    }`}
                                            >
                                                <div className="text-xl mb-1">🎥</div>
                                                <div className="text-xs font-bold">유튜브</div>
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                {/* Action buttons */}
                                <div className="flex gap-3 mt-8 pt-6 border-t border-gray-100">
                                    <button
                                        onClick={() => setShowCreateModal(false)}
                                        className="flex-1 px-6 py-3 bg-gray-100 text-gray-700 rounded-xl font-bold hover:bg-gray-200 transition-colors"
                                    >
                                        취소
                                    </button>
                                    <button
                                        onClick={handleCreateCampaign}
                                        className="flex-1 px-6 py-3 bg-orange-600 text-white rounded-xl font-bold hover:bg-orange-700 transition-colors"
                                    >
                                        등록하기
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Applicants Management Modal */}
            {showApplicantsModal && selectedCampaign && (
                <div className="fixed inset-0 z-50 overflow-y-auto">
                    <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:p-0">
                        <div
                            className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75"
                            onClick={() => setShowApplicantsModal(false)}
                        />

                        <div className="relative inline-block w-full max-w-4xl px-4 pt-5 pb-4 overflow-hidden text-left align-bottom transition-all transform bg-white rounded-3xl shadow-xl sm:my-8 sm:align-middle sm:p-8">
                            <button
                                onClick={() => setShowApplicantsModal(false)}
                                className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 text-2xl font-bold"
                            >
                                ✕
                            </button>

                            <div>
                                <h2 className="text-3xl font-black mb-2">{selectedCampaign.title}</h2>
                                <p className="text-gray-500 mb-6">
                                    신청자 관리 - 총 {getCampaignApplicants(selectedCampaign.id).length}명 신청 / {getApprovedApplicants(selectedCampaign.id).length}명 승인됨
                                </p>

                                <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
                                    {getCampaignApplicants(selectedCampaign.id).map((applicant) => (
                                        <div key={applicant.id} className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
                                            <img src={applicant.avatar} alt={applicant.name} className="w-12 h-12 rounded-full" />
                                            <div className="flex-1">
                                                <h3 className="font-bold">{applicant.name}</h3>
                                                <p className="text-sm text-gray-500">
                                                    {applicant.platform} · 팔로워 {applicant.followers}
                                                </p>
                                                {applicant.status === '승인됨' && (
                                                    <p className="text-xs text-gray-400 mt-1">
                                                        {applicant.hasReviewed ? '✅ 리뷰 작성 완료' : '⏳ 리뷰 작성 대기중'}
                                                    </p>
                                                )}
                                            </div>
                                            <span className={`px-3 py-1 rounded-full text-xs font-bold ${applicant.status === '승인됨'
                                                ? 'bg-green-100 text-green-700'
                                                : applicant.status === '거절됨'
                                                    ? 'bg-red-100 text-red-700'
                                                    : 'bg-yellow-100 text-yellow-700'
                                                }`}>
                                                {applicant.status}
                                            </span>
                                            {applicant.status === '대기중' && (
                                                <div className="flex gap-2">
                                                    <button
                                                        onClick={() => handleApprove(applicant.id)}
                                                        className="px-4 py-2 bg-orange-600 text-white rounded-lg text-sm font-bold hover:bg-orange-700 transition-colors"
                                                    >
                                                        승인
                                                    </button>
                                                    <button
                                                        onClick={() => handleReject(applicant.id)}
                                                        className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg text-sm font-bold hover:bg-gray-300 transition-colors"
                                                    >
                                                        거절
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>

                                <div className="flex gap-3 mt-6 pt-6 border-t border-gray-100">
                                    <button
                                        onClick={() => setShowApplicantsModal(false)}
                                        className="flex-1 px-6 py-3 bg-gray-900 text-white rounded-xl font-bold hover:bg-gray-800 transition-colors"
                                    >
                                        닫기
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Reviews Modal */}
            {showReviewsModal && selectedCampaign && (
                <div className="fixed inset-0 z-50 overflow-y-auto">
                    <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:p-0">
                        <div
                            className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75"
                            onClick={() => setShowReviewsModal(false)}
                        />

                        <div className="relative inline-block w-full max-w-4xl px-4 pt-5 pb-4 overflow-hidden text-left align-bottom transition-all transform bg-white rounded-3xl shadow-xl sm:my-8 sm:align-middle sm:p-8">
                            <button
                                onClick={() => setShowReviewsModal(false)}
                                className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 text-2xl font-bold"
                            >
                                ✕
                            </button>

                            <div>
                                <h2 className="text-3xl font-black mb-2">{selectedCampaign.title}</h2>
                                <p className="text-gray-500 mb-6">
                                    승인된 체험단 - 총 {getApprovedApplicants(selectedCampaign.id).length}명 / 리뷰 작성 {getApprovedWithReviews(selectedCampaign.id).length}명
                                </p>

                                <div className="space-y-6 max-h-[60vh] overflow-y-auto pr-2">
                                    {getApprovedApplicants(selectedCampaign.id).length > 0 ? (
                                        getApprovedApplicants(selectedCampaign.id).map((applicant) => {
                                            const review = reviews.find(r => r.applicantId === applicant.id && r.campaignId === selectedCampaign.id);

                                            if (review) {
                                                // 리뷰를 작성한 경우
                                                return (
                                                    <div key={applicant.id} className="p-6 bg-gray-50 rounded-2xl">
                                                        <div className="flex items-center justify-between mb-3">
                                                            <div className="flex items-center gap-3">
                                                                <img src={applicant.avatar} alt={applicant.name} className="w-10 h-10 rounded-full" />
                                                                <div>
                                                                    <h3 className="font-bold">{review.name}</h3>
                                                                    <p className="text-xs text-gray-500">{review.platform} · 도달 {review.reach}</p>
                                                                </div>
                                                            </div>
                                                            <div className="text-right">
                                                                <div className="text-yellow-500 mb-1">{'⭐'.repeat(review.rating)}</div>
                                                                <p className="text-xs text-gray-400">{review.date}</p>
                                                            </div>
                                                        </div>
                                                        <p className="text-gray-700 leading-relaxed">{review.comment}</p>
                                                        <button className="mt-3 text-sm text-orange-600 font-bold hover:underline">
                                                            원본 리뷰 보기 →
                                                        </button>
                                                    </div>
                                                );
                                            } else {
                                                // 승인됐지만 아직 리뷰를 작성하지 않은 경우
                                                return (
                                                    <div key={applicant.id} className="p-6 bg-yellow-50 border-2 border-dashed border-yellow-200 rounded-2xl">
                                                        <div className="flex items-center gap-3 mb-3">
                                                            <img src={applicant.avatar} alt={applicant.name} className="w-10 h-10 rounded-full" />
                                                            <div className="flex-1">
                                                                <h3 className="font-bold">{applicant.name}</h3>
                                                                <p className="text-xs text-gray-500">{applicant.platform} · 팔로워 {applicant.followers}</p>
                                                            </div>
                                                            <span className="px-3 py-1 bg-yellow-500 text-white text-xs font-bold rounded-full">
                                                                리뷰 대기중
                                                            </span>
                                                        </div>
                                                        <p className="text-sm text-gray-600 mb-3">
                                                            ⏳ 방문 후 리뷰 작성 예정입니다
                                                        </p>
                                                        <div className="flex gap-2">
                                                            <button
                                                                onClick={() => handleApproveReview(applicant.id)}
                                                                className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-bold hover:bg-green-700 transition-colors"
                                                            >
                                                                승인 (리뷰 작성됨)
                                                            </button>
                                                            <button
                                                                onClick={() => handleRejectReview(applicant.id)}
                                                                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-bold hover:bg-red-700 transition-colors"
                                                            >
                                                                거절
                                                            </button>
                                                        </div>
                                                    </div>
                                                );
                                            }
                                        })
                                    ) : (
                                        <div className="text-center py-12">
                                            <div className="text-6xl mb-4">📝</div>
                                            <p className="text-gray-400">승인된 체험단이 없어요</p>
                                            <p className="text-sm text-gray-400 mt-2">신청자를 승인하면 여기에 표시됩니다</p>
                                        </div>
                                    )}
                                </div>

                                <div className="flex gap-3 mt-6 pt-6 border-t border-gray-100">
                                    <button
                                        onClick={() => setShowReviewsModal(false)}
                                        className="flex-1 px-6 py-3 bg-gray-900 text-white rounded-xl font-bold hover:bg-gray-800 transition-colors"
                                    >
                                        닫기
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Edit Campaign Modal */}
            {showEditModal && selectedCampaign && (
                <div className="fixed inset-0 z-50 overflow-y-auto">
                    <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:p-0">
                        <div
                            className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75"
                            onClick={() => setShowEditModal(false)}
                        />

                        <div className="relative inline-block w-full max-w-4xl px-4 pt-5 pb-4 overflow-hidden text-left align-bottom transition-all transform bg-white rounded-3xl shadow-xl sm:my-8 sm:align-middle sm:p-8">
                            <button
                                onClick={() => setShowEditModal(false)}
                                className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 text-2xl font-bold"
                            >
                                ✕
                            </button>

                            <div>
                                <h2 className="text-3xl font-black mb-6">캠페인 수정</h2>

                                <div className="space-y-6 max-h-[60vh] overflow-y-auto pr-2">
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-2">캠페인 제목</label>
                                        <input
                                            type="text"
                                            defaultValue={selectedCampaign.title}
                                            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500"
                                        />
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-bold text-gray-700 mb-2">모집 인원</label>
                                            <input
                                                type="number"
                                                defaultValue={selectedCampaign.spots}
                                                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-bold text-gray-700 mb-2">신청 마감일</label>
                                            <input
                                                type="date"
                                                defaultValue={selectedCampaign.deadline}
                                                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500"
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-2">캠페인 상태</label>
                                        <select className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500">
                                            <option value="진행중" selected={selectedCampaign.status === '진행중'}>진행중</option>
                                            <option value="모집중" selected={selectedCampaign.status === '모집중'}>모집중</option>
                                            <option value="완료" selected={selectedCampaign.status === '완료'}>완료</option>
                                            <option value="중단">중단</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="flex gap-3 mt-8 pt-6 border-t border-gray-100">
                                    <button
                                        onClick={() => setShowEditModal(false)}
                                        className="flex-1 px-6 py-3 bg-gray-100 text-gray-700 rounded-xl font-bold hover:bg-gray-200 transition-colors"
                                    >
                                        취소
                                    </button>
                                    <button
                                        onClick={() => {
                                            alert('캠페인이 수정되었습니다!');
                                            setShowEditModal(false);
                                        }}
                                        className="flex-1 px-6 py-3 bg-orange-600 text-white rounded-xl font-bold hover:bg-orange-700 transition-colors"
                                    >
                                        저장하기
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Delete Campaign Confirmation Modal */}
            {showDeleteModal && selectedCampaign && (
                <div className="fixed inset-0 z-50 overflow-y-auto">
                    <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:p-0">
                        <div
                            className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75"
                            onClick={() => setShowDeleteModal(false)}
                        />

                        <div className="relative inline-block w-full max-w-md px-4 pt-5 pb-4 overflow-hidden text-left align-bottom transition-all transform bg-white rounded-3xl shadow-xl sm:my-8 sm:align-middle sm:p-8">
                            <div className="text-center">
                                <div className="text-6xl mb-4">⚠️</div>
                                <h2 className="text-2xl font-black mb-2">캠페인을 삭제하시겠습니까?</h2>
                                <p className="text-gray-500 mb-2">"{selectedCampaign.title}"</p>
                                <p className="text-sm text-red-500 mb-6">
                                    삭제된 캠페인은 복구할 수 없습니다.
                                </p>

                                <div className="flex gap-3">
                                    <button
                                        onClick={() => setShowDeleteModal(false)}
                                        className="flex-1 px-6 py-3 bg-gray-100 text-gray-700 rounded-xl font-bold hover:bg-gray-200 transition-colors"
                                    >
                                        취소
                                    </button>
                                    <button
                                        onClick={handleDeleteCampaign}
                                        className="flex-1 px-6 py-3 bg-red-600 text-white rounded-xl font-bold hover:bg-red-700 transition-colors"
                                    >
                                        삭제하기
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}