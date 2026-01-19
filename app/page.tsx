"use client";

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic'; // 추가!
// import KakaoMap from '@/components/KakaoMap'; // 이 줄 삭제!
import TossPaymentWidget from '@/components/TossPaymentWidget';
import { supabase } from '@/lib/supabase';

// 카카오 맵을 dynamic import로 변경
const KakaoMap = dynamic(
  () => import('@/components/KakaoMap'),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-[500px] bg-[#1A110D] rounded-[3rem] flex items-center justify-center">
        <div className="text-white text-sm font-bold">지도 로딩중...</div>
      </div>
    )
  }
);

export default function CoffeeShopLanding() {

  const [formData, setFormData] = useState({
    email: '',
    name: '',
    phone: '',
    cafeName: '',
    region: '',
    plan: '',
    interestedServices: [] as string[],
    agreePrivacy: false,
    agreeMarketing: false,
    source: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState('');
  const [submitMessage, setSubmitMessage] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);
  const [showNewsletterModal, setShowNewsletterModal] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState<'selection' | 'login' | 'signup'>('selection');
  const [authData, setAuthData] = useState({ email: '', password: '', confirmPassword: '', name: '' });
  const [authStatus, setAuthStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [authMessage, setAuthMessage] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  interface User {
    id: string;
    email: string;
    name: string | null;
  }
  const [loggedInUser, setLoggedInUser] = useState<User | null>(null);

  const [scrolled, setScrolled] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [newsletterStatus, setNewsletterStatus] = useState('');
  const [showPaymentStep, setShowPaymentStep] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState(0);
  const [orderId, setOrderId] = useState('');
  const [isInitialAuthCheckDone, setIsInitialAuthCheckDone] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);

    // [Session] Check initial session and listen for changes
    const initSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) {
          console.error('[Auth] Session check error:', error);
          setLoggedInUser(null);
          // Clear any corrupted session data
          if (typeof window !== 'undefined') {
            Object.keys(localStorage).forEach(key => {
              if (key.startsWith('sb-')) {
                localStorage.removeItem(key);
              }
            });
          }
        } else if (session?.user) {
          await fetchUserInfo(session.user.email || '', session.user.id, session.user.user_metadata?.name);
        } else {
          // No session - ensure user is logged out
          setLoggedInUser(null);
        }
      } catch (err) {
        console.error('[Auth] Initial session check failed:', err);
        setLoggedInUser(null);
      } finally {
        setIsInitialAuthCheckDone(true);
      }
    };

    initSession();

    // Fallback timer to ensure UI isn't stuck loading
    const timer = setTimeout(() => setIsInitialAuthCheckDone(true), 2000);

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log(`[Auth Event] ${event}`);
      if (event === 'SIGNED_OUT' || !session) {
        // Ensure logout state is properly set
        setLoggedInUser(null);
        // Clear localStorage on sign out
        if (typeof window !== 'undefined') {
          Object.keys(localStorage).forEach(key => {
            if (key.startsWith('sb-')) {
              localStorage.removeItem(key);
            }
          });
        }
      } else if (session?.user && (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED' || event === 'USER_UPDATED')) {
        await fetchUserInfo(session.user.email || '', session.user.id, session.user.user_metadata?.name);
      }
      setIsInitialAuthCheckDone(true);
    });

    return () => {
      window.removeEventListener('scroll', handleScroll);
      subscription.unsubscribe();
      clearTimeout(timer);
    };
  }, []);

  // [Session] Fetch latest user info from DB
  const fetchUserInfo = async (email: string, id: string, metaName?: string) => {
    try {
      const { data: userData } = await supabase
        .from('users')
        .select('name')
        .eq('email', email)
        .maybeSingle() as any;

      setLoggedInUser({
        id,
        email,
        name: userData?.name || metaName || null
      });
    } catch (err) {
      console.error('[Client] Failed to fetch user name:', err);
      setLoggedInUser({ id, email, name: metaName || null });
    }
  };

  const openSubscriptionModal = (planName: string | null = null, source: string = 'landing_page') => {
    setSelectedPlan(planName);
    setFormData(prev => ({ ...prev, plan: planName || '', source }));
    setShowSubscriptionModal(true);
  };

  const openAuthModal = (mode: 'login' | 'signup' | 'selection' = 'selection') => {
    setAuthMode(mode as any);
    setShowAuthModal(true);
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.email) newErrors.email = '이메일을 입력해주세요.';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = '올바른 이메일 형식이 아닙니다.';
    if (!formData.name) newErrors.name = '이름을 입력해주세요.';
    if (!formData.phone) newErrors.phone = '연락처를 입력해주세요.';
    else if (!/^01[0-9]-?[0-9]{3,4}-?[0-9]{4}$/.test(formData.phone)) newErrors.phone = '올바른 연락처 형식이 아닙니다.';
    if (!formData.cafeName) newErrors.cafeName = '카페명을 입력해주세요.';
    if (!formData.agreePrivacy) newErrors.agreePrivacy = '필수 동의 항목입니다.';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const getPlanPrice = (planName: string) => {
    switch (planName) {
      case '베이직': return 39000;
      case '프로': return 89000;
      case '프리미엄': return 159000;
      default: return 0;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    setSubmitStatus('');

    try {
      const response = await fetch(`/api/users`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          userId: loggedInUser?.id
        }),
      });

      let data;
      const contentType = response.headers.get("content-type");
      if (contentType && contentType.indexOf("application/json") !== -1) {
        data = await response.json();
      } else {
        const text = await response.text();
        throw new Error(`신청 오류 (Status: ${response.status}). 내용: ${text.substring(0, 50)}...`);
      }

      if (response.ok && data.success) {
        if (selectedPlan) {
          const price = getPlanPrice(selectedPlan);
          if (price > 0) {
            setPaymentAmount(price);
            setOrderId(data.userId || `order_${Math.random().toString(36).slice(2, 11)}`);
            setShowPaymentStep(true);
            return;
          }
        }

        setSubmitStatus('success');
        setFormData({
          email: '', name: '', phone: '', cafeName: '', region: '', plan: '',
          interestedServices: [],
          agreePrivacy: false, agreeMarketing: false,
          source: '' // Reset source field
        });
        setTimeout(() => {
          setSubmitStatus('');
          setShowSubscriptionModal(false);
        }, 3000);
      } else {
        const errorMsg = data.message || '오류 발생';
        const errorDetail = data.errorDetails ? ` (${data.errorDetails.code}: ${data.errorDetails.message})` : '';
        throw new Error(errorMsg + errorDetail);
      }
    } catch (error: any) {
      console.error('Submit Error:', error);
      setSubmitStatus('error');
      setSubmitMessage(error.message || '다시 시도해 주세요.');
      setTimeout(() => {
        setSubmitStatus('');
        setSubmitMessage('');
      }, 5000);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (authMode === 'signup' && authData.password !== authData.confirmPassword) {
      setAuthStatus('error');
      setAuthMessage('비밀번호가 일치하지 않습니다.');
      return;
    }

    setAuthStatus('loading');
    setAuthMessage('');

    try {
      if (authMode === 'login') {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: authData.email,
          password: authData.password,
        });

        if (error) throw error;

        setAuthStatus('success');
        setAuthMessage('로그인에 성공했습니다.');

        // fetchUserInfo will be triggered by onAuthStateChange listener in useEffect,
        // but let's call it manually for faster UI update
        await fetchUserInfo(data.user.email!, data.user.id, data.user.user_metadata?.name);

        setTimeout(() => {
          setShowAuthModal(false);
          setAuthStatus('idle');
          setAuthData({ email: '', password: '', confirmPassword: '', name: '' });
        }, 1500);
      } else {
        // signup
        const { data, error } = await supabase.auth.signUp({
          email: authData.email,
          password: authData.password,
          options: {
            data: {
              name: authData.name,
            },
          },
        });

        if (error) throw error;

        // If signup is successful, also sync name to our 'users' table via our API
        // This ensures the custom logic in our API (like DB upsert) still runs
        try {
          await fetch('/api/auth/signup', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              email: authData.email,
              password: authData.password,
              name: authData.name,
            }),
          });
        } catch (syncErr) {
          console.warn('[Client] Failed to sync signup to DB, but auth succeeded');
        }

        setAuthStatus('success');
        setAuthMessage('회원가입이 완료되었습니다. 로그인해 주세요.');

        // 회원가입 후 세션이 생성되어도 자동 로그인하지 않음
        // 대신 로그인 모달로 전환
        if (data.session) {
          // 세션이 생성된 경우 로그아웃 처리
          await supabase.auth.signOut();
        }

        // 성공 메시지 표시 후 로그인 모달로 전환
        setTimeout(() => {
          setAuthMode('login');
          setAuthStatus('idle');
          // 이메일은 유지하여 사용자가 바로 로그인할 수 있도록 함
          setAuthData({ email: authData.email, password: '', confirmPassword: '', name: '' });
        }, 1500);
      }
    } catch (error: any) {
      setAuthStatus('error');
      setAuthMessage(error.message || '인증 오류가 발생했습니다.');
      console.error('Auth Error:', error);
    }
  };

  const handleMapSearch = useCallback((data: { cafeCount: number }) => {
    console.log('Map Search Result Total:', data.cafeCount);
  }, []);

  const handleLogout = async () => {
    try {
      // Sign out from Supabase
      const { error } = await supabase.auth.signOut();

      if (error) {
        console.error('[Auth] SignOut error:', error);
      }

      // Clear user state immediately
      setLoggedInUser(null);

      // Clear all Supabase-related localStorage items
      if (typeof window !== 'undefined') {
        Object.keys(localStorage).forEach(key => {
          if (key.startsWith('sb-')) {
            localStorage.removeItem(key);
          }
        });
      }

      // Verify session is cleared
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        console.warn('[Auth] Session still exists after signOut, clearing manually');
        // Force clear by removing all auth tokens
        if (typeof window !== 'undefined') {
          localStorage.clear();
          sessionStorage.clear();
        }
      }

      alert('로그아웃 되었습니다.');
    } catch (err) {
      console.error('[Auth] Logout failed:', err);
      // Fallback: force clear everything
      setLoggedInUser(null);
      if (typeof window !== 'undefined') {
        Object.keys(localStorage).forEach(key => {
          if (key.startsWith('sb-')) {
            localStorage.removeItem(key);
          }
        });
      }
    }
  };

  const handleNewsletterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newsletterEmail) return;

    setNewsletterStatus('loading');
    try {
      console.log(`[Client] Calling /api/users`);
      const response = await fetch(`/api/users`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: newsletterEmail,
          source: 'newsletter',
          agreeMarketing: true,
          userId: loggedInUser?.id
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setNewsletterStatus('success');
        setNewsletterEmail('');
        setTimeout(() => {
          setNewsletterStatus('');
          setShowNewsletterModal(false);
        }, 2000);
      } else {
        const errorMsg = data.message || '오류 발생';
        const errorDetail = data.stack ? ` (Server Error: ${errorMsg})` : '';
        throw new Error(errorMsg + errorDetail);
      }
    } catch (error: any) {
      console.error('Newsletter Error:', error);
      setNewsletterStatus('error');
      setSubmitMessage(error.message || '다시 시도해 주세요.');
      setTimeout(() => {
        setNewsletterStatus('');
        setSubmitMessage('');
      }, 5000);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;

    if (name === 'interestedServices') {
      setFormData(prev => {
        const services = [...prev.interestedServices];
        if (checked) services.push(value);
        else return { ...prev, interestedServices: services.filter(s => s !== value) };
        return { ...prev, interestedServices: services };
      });
    } else {
      setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    }

    if (name === 'plan') setSelectedPlan(value);

    if (errors[name]) {
      setErrors(prev => {
        const updatedErrors = { ...prev };
        delete updatedErrors[name];
        return updatedErrors;
      });
    }
  };

  return (
    <div className="min-h-screen bg-[#FAFAFA] text-[#1A1A1A] font-pretendard selection:bg-amber-200 overflow-x-hidden">
      {/* Background Decor */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-amber-100/40 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/3" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-orange-100/30 rounded-full blur-[100px] translate-y-1/3 -translate-x-1/4" />
      </div>

      {/* Navigation */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${scrolled ? 'py-4' : 'py-8'}`}>
        <div className="max-w-7xl mx-auto px-6">
          <div className={`flex items-center justify-between px-6 md:px-12 py-4 rounded-full transition-all duration-500 ${scrolled ? 'glass shadow-xl' : 'bg-transparent'}`}>
            <div className="flex items-center gap-3 md:gap-4">
              <span className="text-2xl md:text-4xl animate-bounce">☕</span>
              <span className="text-xl md:text-3xl font-black tracking-[calc(-0.05em)] bg-gradient-to-r from-amber-900 via-orange-800 to-amber-900 bg-clip-text text-transparent italic drop-shadow-sm pr-2">CAFÉ DREAM</span>
            </div>

            <div className="hidden md:flex items-center gap-12">
              {['서비스', '요금제'].map((item) => (
                <a key={item} href={`#${item}`} className="text-[15px] font-bold text-gray-700 hover:text-amber-800 transition-colors relative group">
                  {item}
                  <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-amber-600 transition-all group-hover:w-full" />
                </a>
              ))}
              <Link href="/dashboard" className="text-[15px] font-black text-amber-600 hover:text-amber-800 transition-colors relative group">
                대시보드
                <span className="absolute -bottom-1 left-0 w-full h-0.5 bg-amber-600 transition-all" />
              </Link>

              {!isInitialAuthCheckDone && !loggedInUser ? (
                <div className="flex items-center gap-4 pl-4 border-l border-gray-100 opacity-20">
                  <div className="w-24 h-4 bg-gray-200 rounded-full" />
                </div>
              ) : loggedInUser ? (
                <div className="flex items-center gap-6 pl-6 border-l border-gray-100">
                  <div className="flex flex-col items-end">
                    <span className="text-[13px] font-bold text-gray-500 leading-none mb-1">반갑습니다</span>
                    <span className="text-[16px] font-black text-amber-900 leading-none">{loggedInUser.name || '김나리'} 사장님</span>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="px-6 py-2.5 rounded-full bg-gray-100 text-gray-900 text-sm font-black hover:bg-gray-200 transition-all border border-gray-200 shadow-sm"
                  >
                    로그아웃
                  </button>
                </div>
              ) : (
                <>
                  <button
                    onClick={() => openAuthModal('selection')}
                    className="text-sm font-bold text-gray-600 hover:text-amber-800 transition-colors"
                  >
                    로그인
                  </button>
                  <button
                    onClick={() => setShowNewsletterModal(true)}
                    className="px-6 py-2.5 rounded-full bg-[#1A1A1A] text-white text-sm font-bold hover:bg-amber-800 transition-all shadow-lg hover:scale-105 active:scale-95"
                  >
                    무료 구독 신청
                  </button>
                </>
              )}
            </div>

            {/* Mobile Menu Button */}
            <button
              className="md:hidden w-12 h-12 flex items-center justify-center rounded-full bg-white/50 backdrop-blur-md shadow-sm text-2xl"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? '✕' : '☰'}
            </button>
          </div>
        </div>

        {/* Mobile Menu Overlay */}
        {isMobileMenuOpen && (
          <div className="md:hidden fixed inset-0 top-24 z-40 px-6 animate-fadeIn">
            <div className="bg-white/90 backdrop-blur-2xl rounded-[3rem] shadow-2xl border border-gray-100 p-10 flex flex-col gap-8 shadow-amber-900/10">
              <div className="flex flex-col gap-6">
                {['서비스', '요금제'].map((item) => (
                  <a
                    key={item}
                    href={`#${item}`}
                    className="text-2xl font-black text-gray-900"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    {item}
                  </a>
                ))}
                <Link
                  href="/dashboard"
                  className="text-2xl font-black text-amber-600"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  대시보드
                </Link>
              </div>

              <div className="h-px bg-gray-100 w-full" />

              <div className="flex flex-col gap-4">
                {!isInitialAuthCheckDone ? (
                  <div className="w-full h-12 bg-gray-100 animate-pulse rounded-2xl" />
                ) : loggedInUser ? (
                  <div className="flex flex-col gap-4">
                    <span className="text-lg font-black text-amber-900">{loggedInUser.name || '김나리'} 사장님</span>
                    <button
                      onClick={() => { handleLogout(); setIsMobileMenuOpen(false); }}
                      className="w-full py-4 rounded-2xl bg-gray-100 text-gray-900 font-bold"
                    >
                      로그아웃
                    </button>
                  </div>
                ) : (
                  <>
                    <button
                      onClick={() => { openAuthModal('selection'); setIsMobileMenuOpen(false); }}
                      className="w-full py-4 rounded-2xl bg-gray-100 text-gray-900 font-black"
                    >
                      로그인
                    </button>
                    <button
                      onClick={() => { setShowNewsletterModal(true); setIsMobileMenuOpen(false); }}
                      className="w-full py-5 rounded-2xl bg-amber-600 text-white font-black text-lg shadow-xl shadow-amber-900/20"
                    >
                      무료 구독 신청
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section className="relative pt-48 pb-32 px-6 overflow-hidden">
        <div className="max-w-5xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-50 border border-amber-200 shadow-sm mb-10 animate-fadeIn">
            <span className="flex h-2 w-2 rounded-full bg-red-500 animate-ping"></span>
            <span className="text-sm font-bold text-amber-900 uppercase tracking-widest leading-none">이달의 무료 체험 혜택 종료 임박</span>
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-7xl font-extrabold leading-[1.2] md:leading-[1.15] tracking-tighter mb-8 animate-fadeIn text-balance">
            텅 빈 테이블을<br className="hidden md:block" />
            <span className="text-amber-600">웨이팅 라인</span>으로 만드는<br className="hidden md:block" />
            <span className="text-gray-900">단골 마케팅의 정석</span>
          </h1>

          <p className="text-lg md:text-xl text-gray-500 max-w-2xl mx-auto leading-relaxed mb-12 animate-fadeIn px-4 md:px-0" style={{ animationDelay: '0.1s' }}>
            우리 동네 사람들에게 내 카페를 알리는 가장 확실한 방법.
            <span className="md:block mt-1 text-amber-700 font-bold underline decoration-amber-200 underline-offset-8">지도 노출부터 단골 관리까지</span>,
            사장님은 커피만 내리세요. 손님은 저희가 모셔옵니다.
          </p>

          <div className="max-w-xl mx-auto animate-fadeIn" style={{ animationDelay: '0.2s' }}>
            <div className="flex flex-col sm:flex-row gap-3 p-3 bg-white rounded-3xl shadow-2xl border border-gray-100">
              <div className="flex-1 flex items-center px-4 md:px-6">
                <span className="text-amber-500 mr-2 md:mr-3">📍</span>
                <input
                  type="text"
                  placeholder="카페 이름과 지역"
                  className="w-full py-4 bg-transparent focus:outline-none text-base md:text-lg font-medium"
                  onFocus={() => openSubscriptionModal(null, 'hero_diagnosis')}
                  readOnly
                />
              </div>
              <button
                onClick={() => openSubscriptionModal(null, 'hero_diagnosis')}
                className="w-full sm:w-auto px-10 py-4 rounded-xl md:rounded-2xl bg-amber-600 text-white font-black text-lg hover:bg-amber-700 transition-all shadow-xl hover:shadow-amber-300/30 active:scale-95 whitespace-nowrap"
              >
                무료 진단 받기
              </button>
            </div>

            <div className="mt-8 flex flex-col sm:flex-row justify-center gap-6 text-sm font-bold text-gray-400">
              <div className="flex items-center gap-2"><span className="text-amber-500">✓</span> 네이버 플레이스 순위 분석</div>
              <div className="flex items-center gap-2"><span className="text-amber-500">✓</span> 경쟁 업체 광고 현황 진단</div>
              <div className="flex items-center gap-2"><span className="text-amber-500">✓</span> 동네 잠재고객 수 리포트</div>
            </div>
          </div>
        </div>
      </section >

      {/* Pain Point Section */}
      <section className="py-20 md:py-32 px-6 bg-[#0F0A08] text-white overflow-hidden relative">
        <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-12 md:gap-24 items-center">
          <div className="animate-fadeIn">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black mb-10 leading-tight tracking-tighter text-balance">
              맛있는 커피,<br className="hidden md:block" />
              <span className="text-amber-500">부족한 방문객</span><br className="hidden md:block" />
              무엇이 문제일까요?
            </h2>
            <div className="space-y-4">
              {[
                { q: "인스타그램 관리는 막막하고,", a: "기획부터 포스팅까지 저희가 전담합니다. 사장님은 커피에만 집중하세요." },
                { q: "광고비는 쓰는데 성과는 없고,", a: "지역 기반 정밀 타겟팅으로 실제 방문 가능성 높은 고객만 모셔옵니다." },
                { q: "단골 관리는 어떻게 시작할지?", a: "자동화된 쿠폰과 방문 분석 시스템이 사장님의 비서가 되어드립니다." }
              ].map((item, i) => (
                <div key={i} className="p-8 rounded-[2rem] bg-white/[0.03] border border-white/10 hover:border-amber-500/30 transition-all duration-500 group">
                  <div className="flex gap-4">
                    <span className="text-amber-500 font-black text-xl">Q.</span>
                    <div>
                      <h4 className="text-lg font-bold text-gray-200 mb-2 group-hover:text-white transition-colors">{item.q}</h4>
                      <p className="text-gray-400 font-medium leading-relaxed">{item.a}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="relative animate-fadeIn" style={{ animationDelay: '0.2s' }}>
            <div className="absolute inset-0 bg-amber-600/10 blur-[120px] rounded-full"></div>
            <div className="relative bg-[#1A110D] border border-white/5 rounded-[3rem] p-10 shadow-2xl">
              <div className="mb-12">
                <span className="text-amber-500 text-xs font-black uppercase tracking-[0.2em] block mb-2">Growth Report</span>
                <h3 className="text-2xl font-black italic">마케팅 도입 후 실제 변화</h3>
              </div>

              <div className="space-y-10">
                {[
                  { label: '플레이스 노출수', value: '+1,500%', color: 'from-amber-400 to-amber-600', width: '90%' },
                  { label: '당근마켓 쿠폰 다운로드', value: '+317%', color: 'from-orange-400 to-orange-600', width: '65%' },
                  { label: '오프라인 재방문율', value: '+480%', color: 'from-red-400 to-red-600', width: '80%' },
                ].map((stat, i) => (
                  <div key={i} className="relative">
                    <div className="flex justify-between items-end mb-4">
                      <span className="text-sm font-bold text-gray-400 uppercase tracking-widest">{stat.label}</span>
                      <span className="text-2xl font-black text-white">{stat.value}</span>
                    </div>
                    <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                      <div className={`h-full bg-gradient-to-r ${stat.color} rounded-full transition-all duration-1000 delay-300`} style={{ width: stat.width }}></div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-14 pt-8 border-t border-white/5 text-center italic">
                <p className="text-gray-400 text-sm font-medium leading-relaxed">
                  "카페드림은 단순한 광고 대행이 아닌,<br />
                  <span className="text-amber-500 font-bold">매출이라는 결과</span>를 직접 증명합니다."
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <div className="text-xs font-black text-amber-600 uppercase tracking-[0.3em] mb-4">Proven with Numbers</div>
          <h2 className="text-3xl md:text-4xl font-black mb-16">이미 250명의 사장님들이 카페드림을 선택했습니다.</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {[
              { label: '성공적인 파트너십', value: '250+', icon: '☕' },
              { label: '평균 방문객 증가', value: '1,200명', icon: '👥' },
              { label: '평균 매출 향상', value: '180%', icon: '📈' }
            ].map((stat, idx) => (
              <div key={idx} className="group cursor-default">
                <div className="text-6xl mb-4 grayscale group-hover:grayscale-0 transition-all duration-500">{stat.icon}</div>
                <div className="text-6xl font-black text-[#1A110D] mb-2 tracking-tighter">{stat.value}</div>
                <div className="text-gray-400 font-bold uppercase tracking-wider text-xs">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CRM Roadmap Section */}
      <section className="py-20 md:py-32 bg-[#FAF7F2] overflow-hidden">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-20">
            <span className="text-amber-600 text-xs font-black uppercase tracking-[0.3em] block mb-4">Loyalty Recipe</span>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black mb-6 tracking-tighter text-balance">손님이 단골이 되는<br className="hidden md:block" />카페드림의 3단계 레시피</h2>
            <p className="text-gray-500 font-bold max-w-2xl mx-auto">더 이상 손님이 오기만을 기다리지 마세요. 카페드림이 직접 손님의 발걸음을 돌립니다.</p>
          </div>

          <div className="grid lg:grid-cols-3 gap-8 relative">
            {[
              {
                step: '01',
                title: '번호 하나로 끝내는 적립',
                desc: '주문 시 핸드폰 번호 입력만으로 적립 완료. 종이 쿠폰 분실 걱정도, 번거로움도 없습니다.',
                icon: '📱',
                detail: '적립률 40% 향상'
              },
              {
                step: '02',
                title: '잊을 만할 때 가는 카톡',
                desc: '방문이 뜸해진 손님께만 "보고 싶어요" 쿠폰을 자동 발송합니다. 다시 찾아올 명분을 만듭니다.',
                icon: '💌',
                detail: '재방문율 3.5배 상승'
              },
              {
                step: '03',
                title: '충성 고객 집중 관리',
                desc: '우리 카페 매출의 70%를 만드는 VIP 손님들. 특별한 등급 혜택으로 절대 놓치지 않습니다.',
                icon: '💎',
                detail: '객단가 28% 증가'
              }
            ].map((item, idx) => (
              <div key={idx} className="relative z-10 p-8 md:p-10 rounded-[2.5rem] md:rounded-[3rem] bg-white shadow-xl shadow-amber-900/5 hover:-translate-y-4 transition-all duration-500 group">
                <div className="w-20 h-20 rounded-3xl bg-amber-50 flex items-center justify-center text-4xl mb-8 group-hover:scale-110 group-hover:bg-amber-100 transition-all duration-500 shadow-inner">
                  {item.icon}
                </div>
                <div className="absolute top-10 right-10 text-5xl font-black text-amber-600/10 group-hover:text-amber-600/20 transition-colors">{item.step}</div>
                <h3 className="text-2xl font-black mb-4 group-hover:text-amber-700 transition-colors">{item.title}</h3>
                <p className="text-gray-500 font-medium leading-relaxed mb-8">{item.desc}</p>
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-50 text-amber-700 text-xs font-black">
                  <span className="flex h-1.5 w-1.5 rounded-full bg-amber-500 animate-pulse"></span>
                  {item.detail}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Owner's 24-Hour Timeline Section */}
      <section className="py-20 md:py-32 bg-white relative">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col lg:flex-row items-center gap-12 md:gap-20">
            <div className="lg:w-1/2">
              <span className="text-amber-600 text-xs font-black uppercase tracking-[0.3em] block mb-4">Life Transformation</span>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-black mb-8 leading-tight tracking-tighter text-balance">
                사장님의 24시간이<br className="hidden md:block" />
                <span className="text-amber-600">완전히 달라집니다</span>
              </h2>
              <p className="text-gray-500 font-bold text-lg mb-10 leading-relaxed">
                마케팅 공부하느라, 사진 찍느라 뺏겼던 시간들이<br />
                이제 사장님의 온전한 휴식과 성장의 시간이 됩니다.
              </p>

              <div className="space-y-6">
                {[
                  { time: '08:00 AM', before: '카카오맵 순위 하락에 가슴이 철렁', after: '폰으로 전송된 마케팅 리포트 확인하며 여유로운 커피 한 잔' },
                  { time: '02:00 PM', before: '주문 중간중간 인스타 사진 찍고 업로드', after: '카페드림이 올린 고퀄리티 포스팅 보고 손님 응대에만 집중' },
                  { time: '09:00 PM', before: '퇴근 후에도 유튜브로 광고 공부하기', after: '자동화된 시스템에 맡기고 가벼운 마음으로 기분 좋은 퇴근' }
                ].map((item, i) => (
                  <div key={i} className="flex gap-6 p-6 rounded-3xl bg-gray-50 border border-gray-100 transition-all hover:bg-white hover:shadow-xl group">
                    <div className="text-amber-600 font-black text-sm whitespace-nowrap pt-1">{item.time}</div>
                    <div className="space-y-3">
                      <div className="flex items-center gap-2 text-xs text-gray-400 font-bold line-through opacity-60">
                        <span className="w-4 h-px bg-gray-300"></span> {item.before}
                      </div>
                      <div className="text-gray-900 font-bold leading-relaxed group-hover:text-amber-700 transition-colors">
                        <span className="text-amber-500 mr-2">✨</span> {item.after}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="lg:w-1/2 relative w-full">
              <div className="absolute inset-0 bg-amber-100/50 rounded-full blur-[100px] -z-10 animate-pulse"></div>
              <div className="relative p-6 md:p-10 bg-[#1A110D] rounded-[3rem] md:rounded-[4rem] shadow-3xl border border-white/5 overflow-hidden">
                <div className="flex justify-between items-center mb-10">
                  <h4 className="text-white font-black text-xl italic uppercase tracking-widest">Time Saved</h4>
                  <div className="px-4 py-2 bg-amber-500 text-white text-xs font-black rounded-full shadow-lg">주당 25시간 절약</div>
                </div>

                <div className="grid grid-cols-2 gap-6 h-72">
                  <div className="flex flex-col gap-4 group">
                    <div className="flex-1 rounded-3xl overflow-hidden border-2 border-white/5 relative group-hover:border-red-500/30 transition-all duration-500 shadow-2xl bg-gray-800">
                      <img
                        src="/before_cafe.png"
                        alt="Before marketing"
                        className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:opacity-100 transition-opacity duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex items-end justify-center pb-6">
                        <span className="px-4 py-2 rounded-full bg-white/5 backdrop-blur-sm text-white text-[10px] font-black uppercase tracking-widest border border-white/10">Before</span>
                      </div>
                    </div>
                    <p className="text-center text-[10px] text-gray-500 font-black uppercase tracking-widest">직접 마케팅 할 때</p>
                  </div>

                  <div className="flex flex-col gap-4 group">
                    <div className="flex-1 rounded-3xl overflow-hidden border-2 border-amber-500/30 relative shadow-2xl shadow-amber-900/20 group-hover:scale-[1.02] transition-all duration-500 bg-amber-900/20">
                      <img
                        src="/after_cafe.png"
                        alt="After marketing"
                        className="absolute inset-0 w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity duration-500"
                      />
                      <div className="absolute top-4 right-4 z-20">
                        <span className="px-4 py-2 rounded-full bg-amber-600 text-white text-[10px] font-black uppercase tracking-widest shadow-xl animate-bounce">Success</span>
                      </div>
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end justify-center pb-6">
                        <span className="px-4 py-2 rounded-full bg-white/10 backdrop-blur-md text-white text-[10px] font-black uppercase tracking-widest border border-white/20">After</span>
                      </div>
                    </div>
                    <p className="text-center text-[10px] text-amber-500 font-black uppercase tracking-widest">카페드림 도입 후</p>
                  </div>
                </div>

                <div className="mt-10 p-6 rounded-2xl bg-white/5 border border-white/5 italic">
                  <p className="text-gray-400 text-sm font-medium text-center leading-relaxed">
                    "마케팅을 맡긴 후로,<br />
                    가족과 함께하는 저녁 시간이 생겼습니다."
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section id="서비스" className="py-20 md:py-32 bg-[#F2EDE7]">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-20">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black mb-6 tracking-tighter text-balance">맞춤형 마케팅 솔루션</h2>
            <p className="text-amber-900/60 font-bold uppercase tracking-widest text-sm">Every tool you need for growth</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              { title: '카카오맵 상권 분석', desc: '카카오맵 기반의 정밀 상권 분석으로 잠재 고객을 우리 매장으로 유도합니다.', icon: '📍', color: 'bg-yellow-100' },
              { title: '당근마켓 지역 광고', desc: '우리 매장 반경 500m 이내 주민들에게만 정확하게 쿠폰을 노출합니다.', icon: '🥕', color: 'bg-orange-100' },
              { title: '인스타 핫플레이스 전략', desc: '무조건적인 광고가 아닌, 우리 동네 MZ세대가 방문하고 싶게 만듭니다.', icon: '📱', color: 'bg-purple-100' },
              { title: '오프라인 방문 유도 CRM', desc: '한 번 온 손님이 단골이 되도록 스마트 스탬프와 자동 문자를 발송합니다.', icon: '👥', color: 'bg-blue-100' },
              { title: '카카오 예약/채널 관리', desc: '카카오톡을 통해 손쉽게 예약하고 주문할 수 있는 원스톱 시스템을 구축합니다.', icon: '💬', color: 'bg-yellow-400/20' },
              { title: '로컬 체험단 운영', desc: '활동이 활발한 지역 블로거들을 섭외하여 자연스러운 입소문을 만듭니다.', icon: '🏆', color: 'bg-pink-100' }
            ].map((s, idx) => (
              <div key={idx} className="p-8 md:p-10 rounded-[2.5rem] md:rounded-[3rem] bg-white shadow-sm hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 group">
                <div className={`w-14 h-14 rounded-2xl ${s.color} flex items-center justify-center text-3xl mb-8 group-hover:scale-125 transition-transform duration-500`}>
                  {s.icon}
                </div>
                <h3 className="text-xl font-black mb-4">{s.title}</h3>
                <p className="text-gray-500 font-medium leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section >

      {/* Pricing Section */}
      <section id="요금제" className="py-20 md:py-32 bg-[#F2EDE7]">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16 md:mb-20">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black mb-6 tracking-tighter text-balance">합리적인 요금제</h2>
            <p className="text-gray-500 font-bold">규모에 최적화된 성장을 선택하세요</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                name: '베이직',
                price: '39,000',
                desc: '상권 분석 및 기본 플레이스 관리',
                recommend: '마케팅 입문 사장님 추천'
              },
              {
                name: '프로',
                price: '89,000',
                popular: true,
                desc: '당근 광고 & 인스타 포스팅 대행',
                recommend: '신규 고객 유입이 필요한 카페'
              },
              {
                name: '프리미엄',
                price: '159,000',
                desc: 'CRM 단골 관리 & 풀케어 솔루션',
                recommend: '안정적 매출이 필요한 대형 카페'
              }
            ].map((plan, i) => (
              <div key={i} className={`p-8 md:p-10 rounded-[2.5rem] md:rounded-[3rem] transition-all duration-500 flex flex-col ${plan.popular ? 'bg-amber-600 text-white shadow-2xl md:scale-105 z-10' : 'bg-white shadow-xl'}`}>
                <div className="mb-4">
                  <span className={`text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full ${plan.popular ? 'bg-white/20 text-white' : 'bg-amber-100 text-amber-700'}`}>
                    {plan.recommend}
                  </span>
                </div>
                <h3 className="text-2xl font-black mb-2">{plan.name}</h3>
                <div className="text-4xl font-black mb-4">₩{plan.price}<span className="text-sm opacity-50">/월</span></div>
                <p className={`text-sm font-medium mb-8 leading-relaxed ${plan.popular ? 'text-white/80' : 'text-gray-500'}`}>
                  {plan.desc}
                </p>
                <div className="mt-auto">
                  <button
                    onClick={() => openSubscriptionModal(plan.name, 'pricing_plan')}
                    className={`w-full py-4 rounded-2xl font-black transition-all ${plan.popular ? 'bg-white text-amber-900' : 'bg-gray-100 text-gray-900 hover:bg-amber-600 hover:text-white'}`}
                  >
                    신청하기
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Success Stories Section */}
      <section className="py-20 md:py-32 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16 md:mb-20">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black mb-6 tracking-tighter text-balance">성공 파트너 스토리</h2>
            <p className="text-lg md:text-xl text-gray-400 font-bold">마케팅 하나로 바뀐 기적 같은 일상</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-10">
            {[
              { name: '카페 아우라', location: '서울 강남', review: '네이버 플레이스 50위권에서 마케팅 2주 만에 3위로 올라섰습니다. 지금은 주말마다 줄을 서요.', image: '☕' },
              { name: '로코 커피', location: '경기 고양', review: 'SNS 광고 관리를 맡긴 후로 20대 단골이 300% 늘었습니다. 사장인 저보다 제 카페를 더 잘 알아요.', image: '🥯' },
              { name: '그린 팩토리', location: '인천 송도', review: '한 달 무료 체험만 해보려다 연간 계약까지 했습니다. 쿠폰 시스템 덕분에 재방문율이 눈에 띄게 올랐어요.', image: '🍰' }
            ].map((story, i) => (
              <div key={i} className="p-8 md:p-10 rounded-[2.5rem] md:rounded-[40px] bg-[#F9F9F9] border border-gray-100 relative group transition-all hover:bg-white hover:shadow-2xl hover:-translate-y-2">
                <div className="text-4xl mb-6">{story.image}</div>
                <p className="text-lg font-bold text-gray-700 leading-relaxed mb-8 italic">"{story.review}"</p>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-amber-200 flex items-center justify-center font-black text-amber-800">{story.name[0]}</div>
                  <div>
                    <div className="font-black text-gray-900">{story.name}</div>
                    <div className="text-xs text-gray-400 font-bold">{story.location} 점주님</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 md:py-32 bg-[#F2EDE7]">
        <div className="max-w-3xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-black mb-4">자주 묻는 질문</h2>
            <p className="text-gray-500 font-bold uppercase tracking-widest text-xs">Got questions? We have answers.</p>
          </div>
          <div className="space-y-4">
            {[
              { q: '상담 후에 바로 결제해야 하나요?', a: '아니요, 전문가와 1:1 상담 후 카페 상황에 맞는 최적의 플랜을 제안받으신 뒤 결정하시면 됩니다.' },
              { q: '1개월 무료 제험은 정말 무료인가요?', a: '네, 약정이나 위약금 없이 1개월간 모든 프리미엄 기능을 직접 경험해보실 수 있습니다.' },
              { q: '이미 다른 업체 마케팅을 쓰고 있는데 괜찮을까요?', a: '진단 서비스를 통해 현재 어떤 부분이 부족한지 무료로 분석해 드립니다. 효과가 없다면 갈아타실 때가 되었습니다.' }
            ].map((faq, i) => (
              <div key={i} className="p-6 md:p-8 rounded-[2rem] bg-white shadow-sm">
                <div className="text-lg font-black mb-2 text-amber-900">Q. {faq.q}</div>
                <p className="text-gray-500 font-medium tracking-tight">A. {faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Newsletter Section */}
      <section className="py-20 bg-[#FAFAFA]">
        <div className="max-w-4xl mx-auto px-6">
          <div className="bg-amber-600 rounded-[2.5rem] md:rounded-[3rem] p-8 md:p-16 text-center text-white relative overflow-hidden">
            <div className="relative z-10">
              <h2 className="text-3xl md:text-4xl font-black mb-6">성장하는 카페의 비밀, 뉴스레터</h2>
              <p className="text-amber-100 font-bold mb-10 opacity-80 leading-relaxed">매주 화요일, 사장님의 매출을 바꿔줄 실전 데이터와 트렌드를 무료로 보내드립니다.</p>
              <form onSubmit={handleNewsletterSubmit} className="flex flex-col sm:flex-row gap-4 max-w-xl mx-auto">
                <input
                  type="email"
                  placeholder="이메일을 입력하세요"
                  value={newsletterEmail}
                  onChange={(e) => setNewsletterEmail(e.target.value)}
                  className="w-full sm:flex-1 px-8 py-5 rounded-2xl bg-white text-gray-900 font-bold focus:outline-none"
                  required
                />
                <button
                  type="submit"
                  disabled={newsletterStatus === 'loading'}
                  className="w-full sm:w-auto px-8 py-5 rounded-2xl bg-amber-900 text-white font-black hover:bg-[#1A110D] transition-all shadow-xl disabled:opacity-50"
                >
                  {newsletterStatus === 'loading' ? '처리 중...' : '무료 구독하기'}
                </button>
              </form>
              {newsletterStatus === 'success' && <p className="mt-4 text-white font-black animate-fadeIn">🎉 구독이 완료되었습니다!</p>}
              {newsletterStatus === 'error' && <p className="mt-4 text-white font-black animate-fadeIn">❌ 다시 시도해 주세요.</p>}
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-20 md:py-32 bg-[#1A110D] relative overflow-hidden">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-amber-600/10 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-amber-900/20 rounded-full blur-[120px]"></div>

        <div className="max-w-5xl mx-auto px-6 text-center relative z-10">
          <div className="inline-flex items-center gap-3 px-5 py-2 rounded-full bg-white/5 border border-white/10 mb-8">
            <span className="text-amber-500 text-xs font-black">☕️</span>
            <span className="text-white/60 text-[10px] font-black uppercase tracking-widest leading-none">원두의 향기, 사장님의 진심에만 집중하세요</span>
          </div>

          <h2 className="text-3xl sm:text-4xl md:text-6xl font-black text-white mb-8 leading-[1.2] tracking-tighter text-balance">
            사장님의 카페가 누군가의<br className="hidden md:block" />
            <span className="text-amber-500">인생 단골집</span>이 되도록.
          </h2>

          <p className="text-gray-400 text-lg md:text-xl font-bold mb-12 max-w-2xl mx-auto leading-relaxed">
            마케팅 걱정은 저희가 가져가겠습니다. 사장님은 그저 맛있는 커피만 준비해 주세요.
            <span className="block mt-2 text-white">1개월 무료 체험으로 지금 바로 시작해 보세요.</span>
          </p>

          <div className="flex flex-col items-center gap-8">
            <button
              onClick={() => openSubscriptionModal(null, 'final_cta')}
              className="w-full sm:w-auto px-10 md:px-12 py-6 md:py-7 rounded-[2rem] md:rounded-[2.5rem] bg-amber-600 text-white font-black text-xl md:text-2xl hover:bg-amber-700 transition-all shadow-3xl shadow-amber-600/20 hover:scale-105 active:scale-95"
            >
              무료로 파트너십 시작하기
            </button>
            <p className="text-gray-500 text-[10px] md:text-sm font-bold">
              * 카드 등록 및 복잡한 계약 절차 없이 0원에 시작할 수 있습니다.
            </p>
          </div>
        </div>
      </section>

      {/* Subscription Modal */}
      {showSubscriptionModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-6 glass animate-fadeIn" onClick={() => setShowSubscriptionModal(false)}>
          <div className="bg-white rounded-[2.5rem] md:rounded-[40px] shadow-2xl w-full max-w-2xl max-h-[95vh] md:max-h-[90vh] overflow-y-auto relative animate-modalFadeIn" onClick={e => e.stopPropagation()}>
            <button onClick={() => setShowSubscriptionModal(false)} className="absolute top-6 right-6 md:top-8 md:right-8 text-3xl font-light text-gray-400 hover:text-black transition-colors z-20">×</button>
            <div className="p-8 md:p-12">
              <h2 className="text-2xl md:text-3xl font-black text-center mb-8 md:mb-10">
                {selectedPlan ? `[${selectedPlan}] 플랜 신청` : formData.source === 'final_cta' ? '파트너십 신청' : '무료 진단 신청'}
              </h2>
              <form onSubmit={handleSubmit} className="space-y-4 md:space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {((selectedPlan || formData.source === 'final_cta') ? ['cafeName', 'name', 'email', 'phone'] : ['cafeName', 'name', 'email', 'phone', 'region']).map(field => (
                    <div key={field}>
                      <input
                        type={field === 'email' ? 'email' : 'text'}
                        name={field}
                        placeholder={
                          field === 'cafeName' ? '카페명' :
                            field === 'name' ? '성함' :
                              field === 'email' ? '이메일' :
                                field === 'phone' ? '연락처' :
                                  '지역'
                        }
                        value={(formData as any)[field]}
                        onChange={handleInputChange}
                        className={`w-full px-6 py-4 rounded-xl md:rounded-2xl bg-gray-50 border-2 transition-all focus:outline-none ${errors[field] ? 'border-red-200' : 'border-transparent focus:border-amber-200'}`}
                      />
                      {errors[field] && <p className="mt-1 text-[10px] text-red-500 font-bold px-2">{errors[field]}</p>}
                    </div>
                  ))}
                </div>
                <div className="p-6 rounded-2xl md:rounded-3xl bg-amber-50 border border-amber-100">
                  <div className="flex items-center gap-3">
                    <input type="checkbox" name="agreePrivacy" checked={formData.agreePrivacy} onChange={handleInputChange} className="w-5 h-5 accent-amber-600" id="agree" />
                    <label htmlFor="agree" className="text-sm font-bold text-amber-900/70">개인정보 수집 및 이용 동의 (필수)</label>
                  </div>
                </div>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-5 rounded-xl md:rounded-2xl bg-amber-600 text-white font-black text-lg md:text-xl hover:bg-amber-700 transition-all shadow-xl active:scale-95 disabled:opacity-50"
                >
                  {isSubmitting ? '처리 중...' : '신청하기'}
                </button>
                {submitStatus === 'success' && <div className="text-center text-green-600 font-black animate-fadeIn">🎉 신청이 완료되었습니다!</div>}
                {submitStatus === 'error' && <div className="text-center text-red-600 font-black animate-fadeIn text-sm">❌ {submitMessage || '다시 시도해 주세요.'}</div>}
              </form>
            </div>

            {showPaymentStep && (
              <div className="absolute inset-0 bg-white z-10 animate-fadeIn overflow-y-auto">
                <div className="p-8 md:p-12">
                  <button
                    onClick={() => setShowPaymentStep(false)}
                    className="mb-8 text-sm font-bold text-gray-400 hover:text-amber-600 transition-colors flex items-center gap-2"
                  >
                    ← 뒤로 가기
                  </button>
                  <div className="text-center mb-10">
                    <span className="text-amber-600 text-[10px] font-black uppercase tracking-[0.2em] block mb-2">Final Step</span>
                    <h2 className="text-2xl md:text-3xl font-black text-gray-900 italic">PAYMENT</h2>
                    <p className="text-gray-400 text-xs font-bold mt-2">안전한 결제를 위해 토스페이먼츠 보안 시스템을 사용합니다.</p>
                  </div>

                  <TossPaymentWidget
                    amount={paymentAmount}
                    orderId={orderId}
                    orderName={`카페드림 ${selectedPlan} 플랜`}
                    customerEmail={formData.email}
                    customerName={formData.name}
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Newsletter Modal */}
      {showNewsletterModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-6 glass animate-fadeIn" onClick={() => setShowNewsletterModal(false)}>
          <div className="bg-white rounded-[2.5rem] md:rounded-[40px] shadow-2xl w-full max-w-lg relative animate-modalFadeIn" onClick={e => e.stopPropagation()}>
            <button onClick={() => setShowNewsletterModal(false)} className="absolute top-6 right-6 md:top-8 md:right-8 text-3xl font-light text-gray-400 hover:text-black transition-colors">×</button>
            <div className="p-8 md:p-12">
              <div className="text-center mb-8 md:mb-10">
                <div className="w-16 md:w-20 h-16 md:h-20 bg-amber-50 rounded-2xl md:rounded-3xl flex items-center justify-center text-3xl md:text-4xl mx-auto mb-6">📬</div>
                <h2 className="text-2xl md:text-3xl font-black mb-4 text-gray-900">무료 구독 신청</h2>
                <p className="text-gray-500 font-bold leading-relaxed text-sm md:text-base">
                  매주 화요일, 매출 200% 올리는<br />
                  마케팅 비결을 이메일로 보내드려요.
                </p>
              </div>

              <form onSubmit={handleNewsletterSubmit} className="space-y-4 md:space-y-6">
                <input
                  type="email"
                  placeholder="이메일 주소를 입력하세요"
                  value={newsletterEmail}
                  onChange={(e) => setNewsletterEmail(e.target.value)}
                  className="w-full px-6 py-4 rounded-xl md:rounded-2xl bg-gray-50 border-2 border-transparent focus:border-amber-200 focus:bg-white transition-all focus:outline-none text-base md:text-lg text-gray-900"
                  required
                />
                <button
                  type="submit"
                  disabled={newsletterStatus === 'loading'}
                  className="w-full py-4 md:py-5 rounded-xl md:rounded-2xl bg-amber-600 text-white font-black text-lg md:text-xl hover:bg-amber-700 transition-all shadow-xl active:scale-95 disabled:opacity-50"
                >
                  {newsletterStatus === 'loading' ? '처리 중...' : '무료 구독하기'}
                </button>
                {newsletterStatus === 'success' && <div className="p-4 md:p-6 rounded-xl md:rounded-2xl bg-green-50 text-green-700 text-center font-black animate-fadeIn text-sm">🎉 구독 신청이 완료되었습니다!</div>}
                {newsletterStatus === 'error' && <div className="p-4 md:p-6 rounded-xl md:rounded-2xl bg-red-50 text-red-700 text-center font-black animate-fadeIn text-sm">❌ {submitMessage || '다시 시도해 주세요.'}</div>}
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Auth Selection Modal */}
      {showAuthModal && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 md:p-6 glass animate-fadeIn" onClick={() => setShowAuthModal(false)}>
          <div className="bg-white rounded-[2.5rem] md:rounded-[40px] shadow-2xl w-full max-w-md relative animate-modalFadeIn" onClick={e => e.stopPropagation()}>
            <button onClick={() => setShowAuthModal(false)} className="absolute top-6 right-6 md:top-8 md:right-8 text-3xl font-light text-gray-400 hover:text-black transition-colors">×</button>
            <div className="p-8 md:p-10">
              {authMode !== 'selection' && (
                <button
                  onClick={() => setAuthMode('selection')}
                  className="mb-6 text-sm font-bold text-gray-400 hover:text-amber-600 transition-colors flex items-center gap-2"
                >
                  ← 뒤로 가기
                </button>
              )}

              <div className="text-center mb-8">
                <div className="w-16 h-16 bg-amber-50 rounded-2xl flex items-center justify-center text-3xl mx-auto mb-4 shadow-inner">
                  {authMode === 'login' ? '🔑' : authMode === 'signup' ? '📝' : '👤'}
                </div>
                <h2 className="text-xl md:text-2xl font-black text-gray-900 italic tracking-tighter">CAFÉ DREAM</h2>
                <p className="text-gray-400 text-[10px] md:text-xs font-bold mt-1">
                  {authMode === 'login' ? '다시 오신 것을 환영합니다!' : authMode === 'signup' ? '새로운 시작을 함께하세요' : '이미 250명의 사장님들과 함께하고 있습니다.'}
                </p>
              </div>

              {authMode === 'selection' ? (
                <div className="space-y-4">
                  <button
                    onClick={() => setAuthMode('login')}
                    className="w-full py-5 rounded-xl md:rounded-2xl bg-[#1A1A1A] text-white font-black text-xl hover:bg-amber-800 transition-all shadow-xl active:scale-95"
                  >
                    로그인
                  </button>
                  <div className="py-2">
                    <div className="h-px bg-gray-100 w-full relative">
                      <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-white px-4 text-[10px] text-gray-400 font-black uppercase tracking-widest">or</span>
                    </div>
                  </div>
                  <button
                    onClick={() => setAuthMode('signup')}
                    className="w-full py-5 rounded-xl md:rounded-2xl bg-white border-2 border-gray-100 text-gray-900 font-black text-xl hover:border-amber-500 hover:text-amber-800 transition-all shadow-sm active:scale-95"
                  >
                    회원가입
                  </button>
                </div>
              ) : (
                <form onSubmit={handleAuthSubmit} className="space-y-4">
                  <input
                    type="email"
                    placeholder="이메일 주소"
                    value={authData.email}
                    onChange={(e) => setAuthData({ ...authData, email: e.target.value })}
                    className="w-full px-6 py-4 rounded-xl md:rounded-2xl bg-gray-50 border-2 border-transparent focus:border-amber-200 focus:bg-white transition-all focus:outline-none text-gray-900 font-medium"
                    required
                  />
                  {authMode === 'signup' && (
                    <input
                      type="text"
                      placeholder="이름"
                      value={authData.name}
                      onChange={(e) => setAuthData({ ...authData, name: e.target.value })}
                      className="w-full px-6 py-4 rounded-xl md:rounded-2xl bg-gray-50 border-2 border-transparent focus:border-amber-200 focus:bg-white transition-all focus:outline-none text-gray-900 font-medium"
                      required
                    />
                  )}
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      placeholder="비밀번호"
                      value={authData.password}
                      onChange={(e) => setAuthData({ ...authData, password: e.target.value })}
                      className="w-full px-6 py-4 pr-12 rounded-xl md:rounded-2xl bg-gray-50 border-2 border-transparent focus:border-amber-200 focus:bg-white transition-all focus:outline-none text-gray-900 font-medium"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors focus:outline-none"
                      aria-label={showPassword ? "비밀번호 숨기기" : "비밀번호 보기"}
                    >
                      {showPassword ? (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                        </svg>
                      ) : (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      )}
                    </button>
                  </div>
                  {authMode === 'signup' && (
                    <div className="relative">
                      <input
                        type={showConfirmPassword ? "text" : "password"}
                        placeholder="비밀번호 확인"
                        value={authData.confirmPassword}
                        onChange={(e) => setAuthData({ ...authData, confirmPassword: e.target.value })}
                        className="w-full px-6 py-4 pr-12 rounded-xl md:rounded-2xl bg-gray-50 border-2 border-transparent focus:border-amber-200 focus:bg-white transition-all focus:outline-none text-gray-900 font-medium"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors focus:outline-none"
                        aria-label={showConfirmPassword ? "비밀번호 숨기기" : "비밀번호 보기"}
                      >
                        {showConfirmPassword ? (
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                          </svg>
                        ) : (
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                        )}
                      </button>
                    </div>
                  )}

                  {authMessage && (
                    <p className={`text-center text-xs font-bold ${authStatus === 'error' ? 'text-red-500' : 'text-green-600'}`}>
                      {authMessage}
                    </p>
                  )}

                  <button
                    type="submit"
                    disabled={authStatus === 'loading'}
                    className="w-full py-5 rounded-xl md:rounded-2xl bg-amber-600 text-white font-black text-xl hover:bg-amber-700 transition-all shadow-xl active:scale-95 mt-4 disabled:opacity-50"
                  >
                    {authStatus === 'loading' ? '처리 중...' : authMode === 'login' ? '로그인하기' : '가입하기'}
                  </button>

                  <p className="text-center text-[10px] text-gray-400 font-bold mt-4">
                    {authMode === 'login' ? (
                      <>계정이 없으신가요? <button type="button" onClick={() => setAuthMode('signup')} className="text-amber-600 hover:underline">회원가입</button></>
                    ) : (
                      <>이미 계정이 있으신가요? <button type="button" onClick={() => setAuthMode('login')} className="text-amber-600 hover:underline">로그인</button></>
                    )}
                  </p>
                </form>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="py-20 bg-white border-t border-gray-100">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <p className="text-xl md:text-2xl font-black italic mb-4 tracking-tighter">CAFÉ DREAM</p>
          <p className="text-gray-400 font-bold text-sm">© 2024 Café Dream. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
