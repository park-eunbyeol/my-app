'use client';

import { useState } from 'react';
import { loadTossPayments } from '@tosspayments/tosspayments-sdk';

interface TossPaymentWidgetProps {
    amount: number;
    orderId: string;
    orderName: string;
    customerEmail?: string;
    customerName?: string;
}

export default function TossPaymentWidget({
    amount,
    orderId,
    orderName,
    customerEmail,
    customerName
}: TossPaymentWidgetProps) {
    const [isLoading, setIsLoading] = useState(false);
    const clientKey = process.env.NEXT_PUBLIC_TOSS_CLIENT_KEY || 'test_ck_0RnYX2w532o5MBZryyNPVNeyqApQ';

    const handlePayment = async () => {
        setIsLoading(true);
        try {
            const tossPayments = await loadTossPayments(clientKey);

            // Standard Payment Window (v2) requires a payment instance
            // guest 결제인 경우에도 고유한 customerKey가 필요할 수 있으므로 orderId를 활용합니다.
            const payment = tossPayments.payment({
                customerKey: orderId.slice(0, 20),
            });

            await payment.requestPayment({
                method: 'CARD', // Default method
                amount: {
                    currency: 'KRW',
                    value: amount,
                },
                orderId: orderId,
                orderName: orderName,
                successUrl: `${window.location.origin}/payment/success`,
                failUrl: `${window.location.origin}/payment/fail`,
                customerEmail: customerEmail,
                customerName: customerName,
                card: {
                    useEscrow: false,
                    flowMode: 'DEFAULT',
                    useCardPoint: false,
                    useAppCardOnly: false,
                },
            });
        } catch (error: any) {
            console.error('Payment request failed:', error);
            alert(`결제 요청 중 오류가 발생했습니다: ${error.message || '알 수 없는 에러'}`);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="w-full bg-white rounded-3xl p-8 shadow-2xl border border-gray-100 mt-6 animate-fadeIn">
            <div className="text-center mb-8">
                <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center text-4xl mx-auto mb-4 border-4 border-white shadow-xl">
                    💳
                </div>
                <h3 className="text-2xl font-black text-gray-900 tracking-tighter italic uppercase">Checkout</h3>
                <p className="text-gray-400 text-xs font-bold mt-1 uppercase tracking-widest">Toss Payments Secure</p>
            </div>

            <div className="bg-gray-50 rounded-2xl p-6 mb-8 border border-gray-100">
                <div className="flex justify-between items-center mb-2">
                    <span className="text-xs text-gray-400 font-black uppercase">Selected Plan</span>
                    <span className="text-sm font-black text-gray-900">{orderName}</span>
                </div>
                <div className="flex justify-between items-center">
                    <span className="text-xs text-gray-400 font-black uppercase">Total Price</span>
                    <span className="text-xl font-black text-blue-600">{amount.toLocaleString()}원</span>
                </div>
            </div>

            <button
                onClick={handlePayment}
                disabled={isLoading}
                className="w-full py-5 rounded-2xl bg-blue-600 text-white font-black text-xl hover:bg-blue-700 transition-all shadow-xl shadow-blue-600/20 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 group"
            >
                {isLoading ? (
                    <>
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        결제창 연결 중...
                    </>
                ) : (
                    <>
                        지금 결제하기
                        <span className="group-hover:translate-x-1 transition-transform text-2xl">→</span>
                    </>
                )}
            </button>
            <p className="text-center text-[10px] text-gray-400 font-bold mt-6 leading-relaxed">
                결제 버튼을 누르면 토스페이먼츠 보안 결제창으로 이동하며,<br />
                모든 결제 정보는 암호화되어 안전하게 보호됩니다.
            </p>
        </div>
    );
}
