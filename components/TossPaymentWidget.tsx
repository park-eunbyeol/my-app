'use client';

import { useEffect, useRef, useState } from 'react';
import { loadTossPayments, TossPaymentsWidgets } from '@tosspayments/tosspayments-sdk';

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
    const [widgets, setWidgets] = useState<TossPaymentsWidgets | null>(null);
    const [ready, setReady] = useState(false);
    const clientKey = process.env.NEXT_PUBLIC_TOSS_CLIENT_KEY || 'test_ck_0RnYX2w532o5MBZryyNPVNeyqApQ';

    useEffect(() => {
        async function fetchPaymentWidgets() {
            try {
                const tossPayments = await loadTossPayments(clientKey);
                // 1. 결제위젯 초기화
                const widgets = tossPayments.widgets({
                    customerKey: orderId.slice(0, 20), // 고유한 고객 키 (테스트용으로 orderId 활용)
                });

                setWidgets(widgets);
            } catch (error) {
                console.error('Error fetching payment widgets:', error);
            }
        }

        fetchPaymentWidgets();
    }, [clientKey, orderId]);

    useEffect(() => {
        if (widgets == null) return;

        async function renderWidgets() {
            try {
                // 2. 결제 금액 설정
                await widgets!.setAmount({
                    currency: 'KRW',
                    value: amount,
                });

                // 3. 결제 UI 렌더링
                await Promise.all([
                    widgets!.renderPaymentMethods({
                        selector: '#payment-method',
                        variantKey: 'DEFAULT',
                    }),
                    widgets!.renderAgreement({
                        selector: '#agreement',
                        variantKey: 'AGREEMENT',
                    }),
                ]);

                setReady(true);
            } catch (error) {
                console.error('Error rendering widgets:', error);
            }
        }

        renderWidgets();
    }, [widgets, amount]);

    const handlePayment = async () => {
        if (!widgets) return;

        try {
            await widgets.requestPayment({
                orderId: orderId,
                orderName: orderName,
                successUrl: `${window.location.origin}/payment/success`,
                failUrl: `${window.location.origin}/payment/fail`,
                customerEmail: customerEmail,
                customerName: customerName,
                customerMobilePhone: '01012341234',
            });
        } catch (error) {
            console.error('Payment request failed:', error);
        }
    };

    return (
        <div className="w-full bg-white rounded-3xl p-6 shadow-2xl border border-gray-100">
            <h3 className="text-xl font-black text-gray-900 mb-6 flex items-center gap-3">
                <span className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center text-2xl">💳</span>
                결제수단 선택
            </h3>

            <div id="payment-method" className="mb-4" />
            <div id="agreement" className="mb-8" />

            <button
                onClick={handlePayment}
                disabled={!ready}
                className="w-full py-5 rounded-2xl bg-blue-600 text-white font-black text-xl hover:bg-blue-700 transition-all shadow-xl active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
            >
                {!ready ? (
                    <>
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        결제 준비 중...
                    </>
                ) : (
                    `${amount.toLocaleString()}원 결제하기`
                )}
            </button>
            <p className="text-center text-[10px] text-gray-400 font-bold mt-4">
                보안 결제 시스템에 의해 보호됩니다.
            </p>
        </div>
    );
}
