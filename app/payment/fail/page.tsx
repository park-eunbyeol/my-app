'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

function FailContent() {
    const searchParams = useSearchParams();
    const message = searchParams.get('message') || '결제 중 알 수 없는 오류가 발생했습니다.';
    const code = searchParams.get('code');

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
            <div className="max-w-md w-full bg-white rounded-[3rem] shadow-2xl p-10 text-center border border-gray-100">
                <div className="w-24 h-24 bg-red-50 rounded-full flex items-center justify-center text-5xl mx-auto mb-8 grayscale opacity-50">
                    ❌
                </div>
                <h1 className="text-3xl font-black text-gray-900 tracking-tighter mb-2 italic uppercase">Payment Failed</h1>
                <p className="text-gray-500 font-bold mb-10 text-sm">결제 처리에 실패했습니다.</p>

                <div className="bg-red-50/50 rounded-3xl p-6 text-left mb-10 border border-red-100">
                    <div className="flex items-center gap-3 mb-4">
                        <span className="text-xs px-2 py-1 bg-red-100 text-red-600 rounded-lg font-black uppercase tracking-widest">{code || 'ERROR'}</span>
                    </div>
                    <p className="text-sm text-gray-900 font-black leading-relaxed">
                        {message}
                    </p>
                </div>

                <div className="space-y-4">
                    <Link
                        href="/"
                        className="block w-full py-5 rounded-2xl bg-[#1A1A1A] text-white font-black text-lg hover:scale-[1.02] active:scale-95 transition-all shadow-xl"
                    >
                        다시 시도하기
                    </Link>
                    <Link
                        href="/"
                        className="block w-full py-5 rounded-2xl bg-white border-2 border-gray-100 text-gray-900 font-black text-lg hover:border-gray-200 transition-all active:scale-95"
                    >
                        고객센터 문의
                    </Link>
                </div>
            </div>
        </div>
    );
}

export default function FailPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <FailContent />
        </Suspense>
    );
}
