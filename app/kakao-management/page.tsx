"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';

type TabType = 'overview' | 'reservations' | 'messages' | 'templates' | 'settings';
type ReservationStatus = '대기중' | '승인됨' | '거절됨' | '완료됨' | '취소됨';

interface Reservation {
    id: number;
    customerName: string;
    phone: string;
    date: string;
    time: string;
    people: number;
    status: ReservationStatus;
    message?: string;
    createdAt: string;
}

interface MessageTemplate {
    id: number;
    name: string;
    content: string;
    category: '예약확인' | '예약알림' | '방문감사' | '프로모션';
    isActive: boolean;
}

interface MessageHistory {
    id: number;
    target: string;
    content: string;
    recipientCount: number;
    sentAt: string;
    status: 'success' | 'failed';
}

export default function KakaoManagementPage() {
    const [mounted, setMounted] = useState<boolean>(false);
    const [activeTab, setActiveTab] = useState<TabType>('overview');
    const [showReservationModal, setShowReservationModal] = useState<boolean>(false);
    const [showTemplateModal, setShowTemplateModal] = useState<boolean>(false);
    const [selectedReservation, setSelectedReservation] = useState<Reservation | null>(null);
    const [selectedTemplate, setSelectedTemplate] = useState<MessageTemplate | null>(null);

    // Message sending state
    const [messageTarget, setMessageTarget] = useState<string>('전체 팔로워');
    const [messageContent, setMessageContent] = useState<string>('');
    const [isSending, setIsSending] = useState<boolean>(false);
    const [selectedTemplateId, setSelectedTemplateId] = useState<number | null>(null);
    const [messagesSentCount, setMessagesSentCount] = useState<number>(() => {
        if (typeof window !== 'undefined') {
            const saved = localStorage.getItem('kakao-messages-sent-count');
            if (saved) return parseInt(saved);
        }
        return 342;
    });

    // Message history state
    const [messageHistory, setMessageHistory] = useState<MessageHistory[]>(() => {
        if (typeof window !== 'undefined') {
            const saved = localStorage.getItem('kakao-message-history');
            if (saved) return JSON.parse(saved);
        }
        return [];
    });

    // Channel connection state
    const [isChannelConnected, setIsChannelConnected] = useState<boolean>(() => {
        if (typeof window !== 'undefined') {
            const saved = localStorage.getItem('kakao-channel-connected');
            if (saved) return JSON.parse(saved);
        }
        return true;
    });

    // Settings state
    const [channelName, setChannelName] = useState<string>('카페 드림 성수점');
    const [channelDescription, setChannelDescription] = useState<string>('성수동 감성 카페, 핸드드립 커피 전문점');
    const [autoApprove, setAutoApprove] = useState<boolean>(false);
    const [reservationNotification, setReservationNotification] = useState<boolean>(true);

    // Mock data for reservations
    const initialReservations: Reservation[] = [
        { id: 1, customerName: '김민지', phone: '010-1234-5678', date: '2024.02.25', time: '14:00', people: 2, status: '대기중', message: '창가 자리 부탁드립니다', createdAt: '2024.02.20 10:30' },
        { id: 2, customerName: '이서연', phone: '010-2345-6789', date: '2024.02.25', time: '15:30', people: 4, status: '승인됨', message: '생일 케이크 준비 가능한가요?', createdAt: '2024.02.20 11:15' },
        { id: 3, customerName: '박지훈', phone: '010-3456-7890', date: '2024.02.26', time: '11:00', people: 3, status: '대기중', createdAt: '2024.02.21 09:20' },
        { id: 4, customerName: '최유진', phone: '010-4567-8901', date: '2024.02.26', time: '16:00', people: 2, status: '승인됨', createdAt: '2024.02.21 14:45' },
        { id: 5, customerName: '정민수', phone: '010-5678-9012', date: '2024.02.24', time: '13:00', people: 5, status: '완료됨', message: '단체 예약입니다', createdAt: '2024.02.19 16:00' },
    ];

    const initialTemplates: MessageTemplate[] = [
        { id: 1, name: '예약 확인 메시지', content: '[카페드림] {고객명}님, {날짜} {시간} 예약이 확인되었습니다. 감사합니다!', category: '예약확인', isActive: true },
        { id: 2, name: '예약 하루 전 알림', content: '[카페드림] {고객명}님, 내일 {시간} 예약을 잊지 마세요! 기다리겠습니다 ☕', category: '예약알림', isActive: true },
        { id: 3, name: '방문 감사 메시지', content: '[카페드림] {고객명}님, 방문해주셔서 감사합니다! 다음에 또 뵙겠습니다 😊', category: '방문감사', isActive: true },
        { id: 4, name: '프로모션 안내', content: '[카페드림] 이번 주 특별 할인! 아메리카노 2+1 이벤트 진행중입니다 🎉', category: '프로모션', isActive: false },
    ];

    const [reservations, setReservations] = useState<Reservation[]>(() => {
        if (typeof window !== 'undefined') {
            const saved = localStorage.getItem('kakao-reservations');
            if (saved) return JSON.parse(saved);
        }
        return initialReservations;
    });

    const [templates, setTemplates] = useState<MessageTemplate[]>(() => {
        if (typeof window !== 'undefined') {
            const saved = localStorage.getItem('kakao-templates');
            if (saved) return JSON.parse(saved);
        }
        return initialTemplates;
    });

    useEffect(() => {
        if (typeof window !== 'undefined') {
            localStorage.setItem('kakao-reservations', JSON.stringify(reservations));
        }
    }, [reservations]);

    useEffect(() => {
        if (typeof window !== 'undefined') {
            localStorage.setItem('kakao-templates', JSON.stringify(templates));
        }
    }, [templates]);

    useEffect(() => {
        if (typeof window !== 'undefined') {
            localStorage.setItem('kakao-message-history', JSON.stringify(messageHistory));
        }
    }, [messageHistory]);

    useEffect(() => {
        setMounted(true);
    }, []);

    const handleApproveReservation = (id: number) => {
        setReservations(prev => prev.map(r => r.id === id ? { ...r, status: '승인됨' as ReservationStatus } : r));
    };

    const handleRejectReservation = (id: number) => {
        setReservations(prev => prev.map(r => r.id === id ? { ...r, status: '거절됨' as ReservationStatus } : r));
    };

    const handleCompleteReservation = (id: number) => {
        setReservations(prev => prev.map(r => r.id === id ? { ...r, status: '완료됨' as ReservationStatus } : r));
    };

    const toggleTemplate = (id: number) => {
        setTemplates(prev => prev.map(t => t.id === id ? { ...t, isActive: !t.isActive } : t));
    };

    // Handle message sending with animation
    const handleSendMessage = async () => {
        if (!messageContent.trim()) {
            alert('메시지 내용을 입력해주세요!');
            return;
        }

        setIsSending(true);

        // Simulate API call with delay
        await new Promise(resolve => setTimeout(resolve, 2000));

        // Calculate recipient count based on target
        const recipientCount =
            messageTarget === '전체 팔로워' ? 1247 :
                messageTarget === '예약 고객' ? reservations.length :
                    85; // VIP 고객

        // Create message history entry
        const newMessage: MessageHistory = {
            id: Date.now(),
            target: messageTarget,
            content: messageContent,
            recipientCount: recipientCount,
            sentAt: new Date().toLocaleString('ko-KR', {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit'
            }),
            status: 'success'
        };

        setMessageHistory(prev => [newMessage, ...prev]);

        const newCount = messagesSentCount + recipientCount;
        setMessagesSentCount(newCount);

        if (typeof window !== 'undefined') {
            localStorage.setItem('kakao-messages-sent-count', newCount.toString());
        }

        setIsSending(false);
        alert(`✅ 메시지가 ${messageTarget} ${recipientCount}명에게 발송되었습니다!\n\n발송 내용:\n${messageContent}`);
        setMessageContent('');
        setSelectedTemplateId(null);
    };

    // Handle template selection
    const handleSelectTemplate = (templateId: number) => {
        const template = templates.find(t => t.id === templateId);
        if (template) {
            setMessageContent(template.content);
            setSelectedTemplateId(templateId);
        }
    };

    // Toggle channel connection
    const toggleChannelConnection = () => {
        const newStatus = !isChannelConnected;
        setIsChannelConnected(newStatus);

        if (typeof window !== 'undefined') {
            localStorage.setItem('kakao-channel-connected', JSON.stringify(newStatus));
        }

        if (newStatus) {
            alert('✅ 카카오톡 채널이 연동되었습니다!');
        } else {
            alert('⚠️ 카카오톡 채널 연동이 해제되었습니다.');
        }
    };

    // Save settings
    const handleSaveSettings = () => {
        if (typeof window !== 'undefined') {
            localStorage.setItem('kakao-channel-name', channelName);
            localStorage.setItem('kakao-channel-description', channelDescription);
            localStorage.setItem('kakao-auto-approve', JSON.stringify(autoApprove));
            localStorage.setItem('kakao-reservation-notification', JSON.stringify(reservationNotification));
        }

        alert('✅ 설정이 저장되었습니다!');
    };

    const stats = {
        channelFollowers: 1247,
        todayReservations: reservations.filter(r => r.status === '대기중').length,
        monthlyReservations: reservations.length,
        messagesSent: messagesSentCount,
        activeTemplates: templates.filter(t => t.isActive).length,
    };

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
                        <span className="text-sm font-medium text-gray-500">카카오 채널 관리</span>
                    </div>
                </div>
            </nav>

            <div className="pt-16 flex">
                {/* Sidebar */}
                <aside className="hidden md:block w-64 bg-white border-r border-gray-100 min-h-screen sticky top-16">
                    <div className="p-6 flex flex-col h-[calc(100vh-4rem)]">
                        <div className="mb-8">
                            <div className="flex items-center gap-3 mb-2">
                                <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center text-xl">
                                    💬
                                </div>
                                <div>
                                    <h3 className="font-bold">카카오톡 채널</h3>
                                    <p className="text-xs text-gray-400">카페 드림 성수점</p>
                                </div>
                            </div>
                        </div>

                        <nav className="space-y-1 flex-1">
                            <button
                                onClick={() => setActiveTab('overview')}
                                className={`w-full text-left px-4 py-3 rounded-xl font-bold text-sm transition-all ${activeTab === 'overview'
                                    ? 'bg-yellow-50 text-yellow-600'
                                    : 'text-gray-600 hover:bg-gray-50'
                                    }`}
                            >
                                📊 대시보드
                            </button>
                            <button
                                onClick={() => setActiveTab('reservations')}
                                className={`w-full text-left px-4 py-3 rounded-xl font-bold text-sm transition-all flex items-center justify-between ${activeTab === 'reservations'
                                    ? 'bg-yellow-50 text-yellow-600'
                                    : 'text-gray-600 hover:bg-gray-50'
                                    }`}
                            >
                                <span>📅 예약 관리</span>
                                {stats.todayReservations > 0 && (
                                    <span className="bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                                        {stats.todayReservations}
                                    </span>
                                )}
                            </button>
                            <button
                                onClick={() => setActiveTab('messages')}
                                className={`w-full text-left px-4 py-3 rounded-xl font-bold text-sm transition-all ${activeTab === 'messages'
                                    ? 'bg-yellow-50 text-yellow-600'
                                    : 'text-gray-600 hover:bg-gray-50'
                                    }`}
                            >
                                💌 메시지 발송
                            </button>
                            <button
                                onClick={() => setActiveTab('templates')}
                                className={`w-full text-left px-4 py-3 rounded-xl font-bold text-sm transition-all ${activeTab === 'templates'
                                    ? 'bg-yellow-50 text-yellow-600'
                                    : 'text-gray-600 hover:bg-gray-50'
                                    }`}
                            >
                                📝 템플릿 관리
                            </button>
                            <button
                                onClick={() => setActiveTab('settings')}
                                className={`w-full text-left px-4 py-3 rounded-xl font-bold text-sm transition-all ${activeTab === 'settings'
                                    ? 'bg-yellow-50 text-yellow-600'
                                    : 'text-gray-600 hover:bg-gray-50'
                                    }`}
                            >
                                ⚙️ 설정
                            </button>
                        </nav>

                        <div className="pt-4 border-t border-gray-100">
                            <Link
                                href="/"
                                className="flex items-center gap-2 px-4 py-3 text-gray-500 hover:text-yellow-600 hover:bg-yellow-50 rounded-xl transition-all font-bold text-sm"
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
                                <h1 className="text-3xl font-black mb-8">카카오톡 채널 대시보드</h1>

                                {/* Stats Cards */}
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                                    <div className="bg-white p-6 rounded-2xl border border-gray-100">
                                        <p className="text-xs text-gray-400 mb-2">채널 팔로워</p>
                                        <p className="text-3xl font-black text-yellow-600">{stats.channelFollowers.toLocaleString()}</p>
                                    </div>
                                    <div className="bg-white p-6 rounded-2xl border border-gray-100">
                                        <p className="text-xs text-gray-400 mb-2">오늘 예약</p>
                                        <p className="text-3xl font-black text-blue-600">{stats.todayReservations}</p>
                                    </div>
                                    <div className="bg-white p-6 rounded-2xl border border-gray-100">
                                        <p className="text-xs text-gray-400 mb-2">이번 달 예약</p>
                                        <p className="text-3xl font-black text-green-600">{stats.monthlyReservations}</p>
                                    </div>
                                    <div className="bg-white p-6 rounded-2xl border border-gray-100">
                                        <p className="text-xs text-gray-400 mb-2">발송 메시지</p>
                                        <p className="text-3xl font-black text-purple-600">{stats.messagesSent}</p>
                                    </div>
                                </div>

                                {/* Channel Status */}
                                <div className="bg-white rounded-2xl border border-gray-100 p-6 mb-6">
                                    <h2 className="text-xl font-black mb-4">채널 연동 상태</h2>
                                    <div className="flex items-center gap-4">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-3 mb-2">
                                                <div className={`w-3 h-3 rounded-full ${isChannelConnected ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`}></div>
                                                <span className={`font-bold ${isChannelConnected ? 'text-green-700' : 'text-gray-500'}`}>
                                                    {isChannelConnected ? '연동 활성화' : '연동 비활성화'}
                                                </span>
                                            </div>
                                            <p className="text-sm text-gray-500">
                                                {isChannelConnected
                                                    ? '카카오톡 채널이 정상적으로 연동되어 있습니다.'
                                                    : '카카오톡 채널 연동이 필요합니다.'}
                                            </p>
                                        </div>
                                        <button
                                            onClick={toggleChannelConnection}
                                            className={`px-6 py-3 rounded-xl font-bold transition-colors ${isChannelConnected
                                                ? 'bg-red-600 text-white hover:bg-red-700'
                                                : 'bg-yellow-600 text-white hover:bg-yellow-700'
                                                }`}
                                        >
                                            {isChannelConnected ? '연동 해제' : '채널 연동'}
                                        </button>
                                    </div>
                                </div>

                                {/* Recent Reservations */}
                                <div className="bg-white rounded-2xl border border-gray-100 p-6">
                                    <div className="flex items-center justify-between mb-4">
                                        <h2 className="text-xl font-black">최근 예약</h2>
                                        <button
                                            onClick={() => setActiveTab('reservations')}
                                            className="text-sm font-bold text-yellow-600 hover:underline"
                                        >
                                            전체 보기 →
                                        </button>
                                    </div>
                                    <div className="space-y-3">
                                        {reservations.slice(0, 5).map((reservation) => (
                                            <div key={reservation.id} className="p-4 bg-gray-50 rounded-xl flex items-center justify-between">
                                                <div className="flex-1">
                                                    <h3 className="font-bold">{reservation.customerName}</h3>
                                                    <p className="text-sm text-gray-500">
                                                        {reservation.date} · {reservation.time} · {reservation.people}명
                                                    </p>
                                                </div>
                                                <span className={`px-3 py-1 rounded-full text-xs font-bold ${reservation.status === '승인됨' ? 'bg-green-100 text-green-700' :
                                                    reservation.status === '대기중' ? 'bg-yellow-100 text-yellow-700' :
                                                        reservation.status === '완료됨' ? 'bg-blue-100 text-blue-700' :
                                                            'bg-red-100 text-red-700'
                                                    }`}>
                                                    {reservation.status}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Reservations Tab */}
                        {activeTab === 'reservations' && (
                            <div>
                                <h1 className="text-3xl font-black mb-8">예약 관리</h1>

                                <div className="space-y-4">
                                    {reservations.map((reservation) => (
                                        <div key={reservation.id} className="bg-white rounded-2xl border border-gray-100 p-6">
                                            <div className="flex items-start justify-between mb-4">
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-3 mb-2">
                                                        <h3 className="text-xl font-black">{reservation.customerName}</h3>
                                                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${reservation.status === '승인됨' ? 'bg-green-100 text-green-700' :
                                                            reservation.status === '대기중' ? 'bg-yellow-100 text-yellow-700' :
                                                                reservation.status === '완료됨' ? 'bg-blue-100 text-blue-700' :
                                                                    'bg-red-100 text-red-700'
                                                            }`}>
                                                            {reservation.status}
                                                        </span>
                                                    </div>
                                                    <p className="text-sm text-gray-500 mb-3">
                                                        📞 {reservation.phone} · 신청일: {reservation.createdAt}
                                                    </p>
                                                    <div className="grid grid-cols-3 gap-4 mb-3">
                                                        <div className="bg-gray-50 p-3 rounded-xl">
                                                            <p className="text-xs text-gray-400 mb-1">예약일</p>
                                                            <p className="font-bold">{reservation.date}</p>
                                                        </div>
                                                        <div className="bg-gray-50 p-3 rounded-xl">
                                                            <p className="text-xs text-gray-400 mb-1">시간</p>
                                                            <p className="font-bold">{reservation.time}</p>
                                                        </div>
                                                        <div className="bg-gray-50 p-3 rounded-xl">
                                                            <p className="text-xs text-gray-400 mb-1">인원</p>
                                                            <p className="font-bold">{reservation.people}명</p>
                                                        </div>
                                                    </div>
                                                    {reservation.message && (
                                                        <div className="bg-yellow-50 p-3 rounded-xl border border-yellow-200">
                                                            <p className="text-xs text-yellow-700 mb-1 font-bold">고객 메시지</p>
                                                            <p className="text-sm text-gray-700">{reservation.message}</p>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>

                                            {reservation.status === '대기중' && (
                                                <div className="flex gap-3 pt-4 border-t border-gray-100">
                                                    <button
                                                        onClick={() => handleApproveReservation(reservation.id)}
                                                        className="flex-1 px-4 py-2 bg-green-600 text-white rounded-xl font-bold hover:bg-green-700 transition-colors"
                                                    >
                                                        승인
                                                    </button>
                                                    <button
                                                        onClick={() => handleRejectReservation(reservation.id)}
                                                        className="flex-1 px-4 py-2 bg-red-600 text-white rounded-xl font-bold hover:bg-red-700 transition-colors"
                                                    >
                                                        거절
                                                    </button>
                                                </div>
                                            )}

                                            {reservation.status === '승인됨' && (
                                                <div className="flex gap-3 pt-4 border-t border-gray-100">
                                                    <button
                                                        onClick={() => handleCompleteReservation(reservation.id)}
                                                        className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-colors"
                                                    >
                                                        방문 완료
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Messages Tab */}
                        {activeTab === 'messages' && (
                            <div>
                                <h1 className="text-3xl font-black mb-8">메시지 발송</h1>

                                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
                                    {/* Message Sending Form */}
                                    <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 p-6">
                                        <h2 className="text-xl font-black mb-4">단체 메시지 발송</h2>

                                        {/* Template Quick Select */}
                                        <div className="mb-4">
                                            <label className="block text-sm font-bold text-gray-700 mb-2">빠른 템플릿 선택</label>
                                            <div className="grid grid-cols-2 gap-2">
                                                {templates.filter(t => t.isActive).map((template) => (
                                                    <button
                                                        key={template.id}
                                                        onClick={() => handleSelectTemplate(template.id)}
                                                        className={`p-3 border-2 rounded-xl text-left transition-all ${selectedTemplateId === template.id
                                                                ? 'border-yellow-500 bg-yellow-50'
                                                                : 'border-gray-200 hover:border-gray-300'
                                                            }`}
                                                    >
                                                        <p className="text-xs font-bold text-gray-700">{template.name}</p>
                                                        <p className="text-xs text-gray-500 mt-1 truncate">{template.content.substring(0, 30)}...</p>
                                                    </button>
                                                ))}
                                            </div>
                                        </div>

                                        <div className="space-y-4">
                                            <div>
                                                <label className="block text-sm font-bold text-gray-700 mb-2">수신 대상</label>
                                                <select
                                                    value={messageTarget}
                                                    onChange={(e) => setMessageTarget(e.target.value)}
                                                    disabled={isSending}
                                                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-yellow-500 disabled:bg-gray-100"
                                                >
                                                    <option>전체 팔로워</option>
                                                    <option>예약 고객</option>
                                                    <option>VIP 고객</option>
                                                </select>
                                            </div>
                                            <div>
                                                <label className="block text-sm font-bold text-gray-700 mb-2">메시지 내용</label>
                                                <textarea
                                                    rows={6}
                                                    value={messageContent}
                                                    onChange={(e) => setMessageContent(e.target.value)}
                                                    disabled={isSending}
                                                    placeholder="발송할 메시지를 입력하세요..."
                                                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-yellow-500 resize-none disabled:bg-gray-100"
                                                />
                                                <p className="text-xs text-gray-400 mt-1">{messageContent.length} / 1000자</p>
                                            </div>
                                            <button
                                                onClick={handleSendMessage}
                                                disabled={!isChannelConnected || isSending}
                                                className={`w-full px-6 py-3 rounded-xl font-bold transition-all flex items-center justify-center gap-2 ${isChannelConnected && !isSending
                                                        ? 'bg-yellow-600 text-white hover:bg-yellow-700'
                                                        : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                                    }`}
                                            >
                                                {isSending ? (
                                                    <>
                                                        <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                        </svg>
                                                        <span>발송 중...</span>
                                                    </>
                                                ) : (
                                                    <span>{isChannelConnected ? '메시지 발송' : '채널 연동 필요'}</span>
                                                )}
                                            </button>
                                            {!isChannelConnected && (
                                                <p className="text-sm text-red-500 text-center">
                                                    ⚠️ 메시지를 발송하려면 먼저 채널을 연동해주세요.
                                                </p>
                                            )}
                                        </div>
                                    </div>

                                    {/* Message Stats */}
                                    <div className="space-y-4">
                                        <div className="bg-gradient-to-br from-yellow-50 to-white rounded-2xl border border-yellow-100 p-6">
                                            <p className="text-sm text-gray-500 mb-2">총 발송 메시지</p>
                                            <p className="text-4xl font-black text-yellow-600">{stats.messagesSent.toLocaleString()}</p>
                                        </div>
                                        <div className="bg-white rounded-2xl border border-gray-100 p-6">
                                            <p className="text-sm text-gray-500 mb-2">활성 템플릿</p>
                                            <p className="text-4xl font-black text-green-600">{stats.activeTemplates}</p>
                                        </div>
                                        <div className="bg-white rounded-2xl border border-gray-100 p-6">
                                            <p className="text-sm text-gray-500 mb-2">발송 이력</p>
                                            <p className="text-4xl font-black text-blue-600">{messageHistory.length}</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Message History */}
                                <div className="bg-white rounded-2xl border border-gray-100 p-6">
                                    <div className="flex items-center justify-between mb-4">
                                        <h2 className="text-xl font-black">발송 이력</h2>
                                        {messageHistory.length > 0 && (
                                            <button
                                                onClick={() => {
                                                    if (confirm('모든 발송 이력을 삭제하시겠습니까?')) {
                                                        setMessageHistory([]);
                                                    }
                                                }}
                                                className="text-sm text-red-500 hover:text-red-700 font-bold"
                                            >
                                                전체 삭제
                                            </button>
                                        )}
                                    </div>

                                    {messageHistory.length > 0 ? (
                                        <div className="space-y-3 max-h-[500px] overflow-y-auto">
                                            {messageHistory.map((msg) => (
                                                <div key={msg.id} className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                                                    <div className="flex items-start justify-between mb-2">
                                                        <div className="flex-1">
                                                            <div className="flex items-center gap-2 mb-1">
                                                                <span className="px-2 py-1 bg-yellow-100 text-yellow-700 text-xs font-bold rounded-full">
                                                                    {msg.target}
                                                                </span>
                                                                <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-bold rounded-full">
                                                                    ✓ {msg.recipientCount.toLocaleString()}명 발송
                                                                </span>
                                                            </div>
                                                            <p className="text-sm text-gray-700 mt-2 bg-white p-3 rounded-lg border border-gray-200">
                                                                {msg.content}
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <p className="text-xs text-gray-400 mt-2">📅 {msg.sentAt}</p>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="text-center py-12">
                                            <div className="text-6xl mb-4">📭</div>
                                            <p className="text-gray-400">아직 발송한 메시지가 없습니다</p>
                                            <p className="text-sm text-gray-400 mt-2">메시지를 발송하면 여기에 이력이 표시됩니다</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Templates Tab */}
                        {activeTab === 'templates' && (
                            <div>
                                <h1 className="text-3xl font-black mb-8">템플릿 관리</h1>

                                <div className="space-y-4">
                                    {templates.map((template) => (
                                        <div key={template.id} className="bg-white rounded-2xl border border-gray-100 p-6">
                                            <div className="flex items-start justify-between mb-4">
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-3 mb-2">
                                                        <h3 className="text-xl font-black">{template.name}</h3>
                                                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${template.category === '예약확인' ? 'bg-blue-100 text-blue-700' :
                                                            template.category === '예약알림' ? 'bg-green-100 text-green-700' :
                                                                template.category === '방문감사' ? 'bg-purple-100 text-purple-700' :
                                                                    'bg-orange-100 text-orange-700'
                                                            }`}>
                                                            {template.category}
                                                        </span>
                                                    </div>
                                                    <p className="text-gray-600 bg-gray-50 p-4 rounded-xl font-medium">
                                                        {template.content}
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                                                <div className="flex items-center gap-3">
                                                    <span className="text-sm text-gray-500">자동 발송</span>
                                                    <label className="relative inline-flex items-center cursor-pointer">
                                                        <input
                                                            type="checkbox"
                                                            className="sr-only peer"
                                                            checked={template.isActive}
                                                            onChange={() => toggleTemplate(template.id)}
                                                        />
                                                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-yellow-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-yellow-600"></div>
                                                    </label>
                                                </div>
                                                <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-xl font-bold hover:bg-gray-200 transition-colors">
                                                    수정
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Settings Tab */}
                        {activeTab === 'settings' && (
                            <div>
                                <h1 className="text-3xl font-black mb-8">설정</h1>

                                <div className="space-y-6">
                                    <div className="bg-white rounded-2xl border border-gray-100 p-6">
                                        <h2 className="text-xl font-black mb-4">채널 정보</h2>
                                        <div className="space-y-4">
                                            <div>
                                                <label className="block text-sm font-bold text-gray-700 mb-2">채널 이름</label>
                                                <input
                                                    type="text"
                                                    value={channelName}
                                                    onChange={(e) => setChannelName(e.target.value)}
                                                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-yellow-500"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-bold text-gray-700 mb-2">채널 설명</label>
                                                <textarea
                                                    rows={3}
                                                    value={channelDescription}
                                                    onChange={(e) => setChannelDescription(e.target.value)}
                                                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-yellow-500 resize-none"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="bg-white rounded-2xl border border-gray-100 p-6">
                                        <h2 className="text-xl font-black mb-4">예약 설정</h2>
                                        <div className="space-y-4">
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <p className="font-bold">자동 승인</p>
                                                    <p className="text-sm text-gray-500">예약 신청 시 자동으로 승인</p>
                                                </div>
                                                <label className="relative inline-flex items-center cursor-pointer">
                                                    <input
                                                        type="checkbox"
                                                        className="sr-only peer"
                                                        checked={autoApprove}
                                                        onChange={(e) => setAutoApprove(e.target.checked)}
                                                    />
                                                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-yellow-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-yellow-600"></div>
                                                </label>
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <p className="font-bold">예약 알림</p>
                                                    <p className="text-sm text-gray-500">새 예약 신청 시 알림 받기</p>
                                                </div>
                                                <label className="relative inline-flex items-center cursor-pointer">
                                                    <input
                                                        type="checkbox"
                                                        className="sr-only peer"
                                                        checked={reservationNotification}
                                                        onChange={(e) => setReservationNotification(e.target.checked)}
                                                    />
                                                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-yellow-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-yellow-600"></div>
                                                </label>
                                            </div>
                                        </div>
                                    </div>

                                    <button
                                        onClick={handleSaveSettings}
                                        className="w-full px-6 py-3 bg-yellow-600 text-white rounded-xl font-bold hover:bg-yellow-700 transition-all"
                                    >
                                        변경사항 저장
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </main>
            </div>
        </div>
    );
}
