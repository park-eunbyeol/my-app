'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';

function SuccessContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const [loading, setLoading] = useState(true);

    const paymentKey = searchParams.get('paymentKey');
    const orderId = searchParams.get('orderId');
    const amount = searchParams.get('amount');

    useEffect(() => {
        // 실제 운영 환경에서는 여기서 백엔드 API를 호출하여 결제 승인(Confirm) 처리를 해야 합니다.
        // 현재는 프론트엔드 연동 데모이므로 성공 화면만 보여줍니다.
        const timer = setTimeout(() => {
            setLoading(false);
        }, 1500);
        return () => clearTimeout(timer);
    }, [paymentKey, orderId, amount]);

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
            <div className="max-w-md w-full bg-white rounded-[3rem] shadow-2xl p-10 text-center border border-gray-100">
                {loading ? (
                    <div className="py-12 flex flex-col items-center">
                        <div className="w-20 h-20 border-4 border-amber-100 border-t-amber-600 rounded-full animate-spin mb-6" />
                        <p className="text-gray-900 font-black text-xl">결제 승인 중...</p>
                        <p className="text-gray-400 text-xs font-bold mt-2 italic">잠시만 기다려 주세요</p>
                    </div>
                ) : (
                    <>
                        <div className="w-24 h-24 bg-green-50 rounded-full flex items-center justify-center text-5xl mx-auto mb-8 animate-bounce">
                            🎉
                        </div>
                        <h1 className="text-3xl font-black text-gray-900 tracking-tighter mb-2 italic">PAYMENT SUCCESS!</h1>
                        <p className="text-gray-500 font-bold mb-10 text-sm">카페드림 파트너가 되신 것을 환영합니다!</p>

                        <div className="bg-gray-50 rounded-3xl p-6 text-left mb-10 border border-gray-100">
                            <div className="flex justify-between mb-3 text-xs">
                                <span className="text-gray-400 font-black uppercase">Order ID</span>
                                <span className="text-gray-900 font-black truncate max-w-[150px]">{orderId}</span>
                            </div>
                            <div className="flex justify-between mb-3 text-xs">
                                <span className="text-gray-400 font-black uppercase">Amount</span>
                                <span className="text-gray-900 font-black">{Number(amount).toLocaleString()}원</span>
                            </div>
                            <div className="h-px bg-gray-200 my-4 w-full" />
                            <p className="text-[10px] text-gray-400 leading-relaxed font-medium">
                                상세 결제 내역은 이메일로 발송되었습니다. 파트너 전용 대시보드는 5분 내로 활성화됩니다.
                            </p>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <Link
                                href="/dashboard"
                                className="py-4 rounded-2xl bg-[#1A1A1A] text-white font-black text-sm hover:scale-[1.02] active:scale-95 transition-all shadow-xl"
                            >
                                대시보드 가기
                            </Link>
                            <Link
                                href="/"
                                className="py-4 rounded-2xl bg-white border-2 border-gray-100 text-gray-900 font-black text-sm hover:border-amber-200 transition-all active:scale-95"
                            >
                                홈으로 이동
                            </Link>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}

export default function SuccessPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <SuccessContent />
        </Suspense>
    );
}
