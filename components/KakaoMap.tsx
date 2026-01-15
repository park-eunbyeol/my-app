'use client';

import { useEffect, useRef, useState, useCallback } from 'react';

declare global {
    interface Window {
        kakao: any;
    }
}

interface KakaoMapProps {
    address?: string;
    className?: string;
    onSearch?: (data: { cafeCount: number }) => void;
}

export default function KakaoMap({ address = "서울 강남구 강남대로 428", className, onSearch }: KakaoMapProps) {
    const mapRef = useRef<HTMLDivElement>(null);
    const [mapInstance, setMapInstance] = useState<any>(null);
    const [mapLoaded, setMapLoaded] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [competitorCount, setCompetitorCount] = useState(0);
    const initializedRef = useRef(false);
    const markersRef = useRef<any[]>([]);
    const shopMarkerRef = useRef<any>(null);

    const searchCompetitors = useCallback((map: any, position: any) => {
        if (!window.kakao || !window.kakao.maps.services) return;

        const ps = new window.kakao.maps.services.Places(map);

        const callback = (data: any, status: any, pagination: any) => {
            if (status === window.kakao.maps.services.Status.OK) {
                // Clear markers only on the first page of a new search
                if (pagination.current === 1) {
                    markersRef.current.forEach(m => m.setMap(null));
                    markersRef.current = [];
                    const total = pagination.totalCount;
                    setCompetitorCount(total);
                    if (onSearch) onSearch({ cafeCount: total });
                }

                data.forEach((place: any) => {
                    const competitorPos = new window.kakao.maps.LatLng(place.y, place.x);

                    const marker = new window.kakao.maps.Marker({
                        map: map,
                        position: competitorPos,
                        title: place.place_name,
                        image: new window.kakao.maps.MarkerImage(
                            'https://t1.daumcdn.net/localimg/localimages/07/mapapidoc/markerStar.png',
                            new window.kakao.maps.Size(24, 35)
                        )
                    });

                    markersRef.current.push(marker);

                    const infowindow = new window.kakao.maps.InfoWindow({
                        content: `<div style="padding:5px;font-size:12px;font-weight:700;color:#5D4037;">${place.place_name}</div>`
                    });

                    window.kakao.maps.event.addListener(marker, 'click', () => {
                        infowindow.open(map, marker);
                    });
                });

                // Fetch second page for more markers if it exists (up to 30 markers)
                if (pagination.hasNextPage && pagination.current < 2) {
                    pagination.nextPage();
                }
            } else if (status === window.kakao.maps.services.Status.ZERO_RESULT && pagination.current === 1) {
                markersRef.current.forEach(m => m.setMap(null));
                markersRef.current = [];
                setCompetitorCount(0);
                if (onSearch) onSearch({ cafeCount: 0 });
            } else if (pagination.current === 1) {
                console.error('Search failed:', status);
                if (onSearch) onSearch({ cafeCount: 0 });
            }
        };

        // CE7 is the category code for 'Cafe'
        ps.categorySearch('CE7', callback, {
            location: position,
            radius: 500, // 500 meters
            sort: window.kakao.maps.services.SortBy.DISTANCE
        });
    }, [onSearch]);

    const initMap = useCallback(() => {
        if (!window.kakao || !mapRef.current) return;

        window.kakao.maps.load(() => {
            const options = {
                center: new window.kakao.maps.LatLng(37.566826, 126.9786567),
                level: 3,
            };

            const map = new window.kakao.maps.Map(mapRef.current, options);
            const geocoder = new window.kakao.maps.services.Geocoder();

            geocoder.addressSearch(address, (result: any, status: any) => {
                if (status === window.kakao.maps.services.Status.OK) {
                    const coords = new window.kakao.maps.LatLng(result[0].y, result[0].x);

                    if (shopMarkerRef.current) shopMarkerRef.current.setMap(null);

                    const marker = new window.kakao.maps.Marker({
                        map: map,
                        position: coords,
                    });

                    shopMarkerRef.current = marker;

                    map.setCenter(coords);
                    setMapInstance(map);
                    setMapLoaded(true);

                    // Search for competitors around the center
                    searchCompetitors(map, coords);
                }
            });
        });
    }, [address, searchCompetitors]);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (!searchQuery || !mapInstance) return;

        const geocoder = new window.kakao.maps.services.Geocoder();
        geocoder.addressSearch(searchQuery, (result: any, status: any) => {
            if (status === window.kakao.maps.services.Status.OK) {
                const coords = new window.kakao.maps.LatLng(result[0].y, result[0].x);
                mapInstance.setCenter(coords);

                // Update shop/center marker
                if (shopMarkerRef.current) shopMarkerRef.current.setMap(null);
                const marker = new window.kakao.maps.Marker({
                    map: mapInstance,
                    position: coords,
                });
                shopMarkerRef.current = marker;

                searchCompetitors(mapInstance, coords);
            } else {
                alert('해당 주소를 찾을 수 없습니다.');
            }
        });
    };

    const hasApiKey = !!process.env.NEXT_PUBLIC_KAKAO_MAP_KEY;

    useEffect(() => {
        console.log('[KakaoMap] useEffect triggered. hasApiKey:', hasApiKey);
        if (window.kakao && window.kakao.maps) {
            console.log('[KakaoMap] window.kakao found. Initializing map...');
            if (!initializedRef.current) {
                initializedRef.current = true;
                initMap();
            }
        } else {
            console.warn('[KakaoMap] window.kakao NOT found. Waiting for script to load...');
        }
    }, [initMap, hasApiKey]);



    return (
        <div className={`relative rounded-[3rem] overflow-hidden group shadow-2xl ${className}`}>
            <div
                ref={mapRef}
                className={`w-full h-full transition-all duration-700 ${mapLoaded ? 'grayscale-0 opacity-100' : 'grayscale-[0.3] opacity-0'}`}
            />

            {!mapLoaded && (
                <div className="absolute inset-0 bg-[#1A110D] flex flex-col items-center justify-center p-8 text-center z-20">
                    {!hasApiKey ? (
                        <>
                            <div className="w-20 h-20 mb-6 bg-red-600/20 rounded-full flex items-center justify-center">
                                <div className="w-10 h-10 bg-red-600 rounded-full flex items-center justify-center text-white text-xl">⚠️</div>
                            </div>
                            <p className="text-red-100/80 text-sm font-bold mb-2">Kakao Map API Key Missing</p>
                            <p className="text-white/40 text-[10px] leading-relaxed">
                                Vercel 설정에 NEXT_PUBLIC_KAKAO_MAP_KEY가 없습니다.<br />
                                환경 변수 등록 후 다시 배포해 주세요.
                            </p>
                        </>
                    ) : (
                        <>
                            <div className="w-20 h-20 mb-6 bg-amber-600/20 rounded-full flex items-center justify-center animate-pulse">
                                <div className="w-10 h-10 bg-amber-600 rounded-full flex items-center justify-center text-white text-xl">☕</div>
                            </div>
                            <p className="text-amber-100/60 text-sm font-black tracking-widest uppercase mb-2">Analyzing Local Market</p>
                            <div className="flex gap-1">
                                {[0, 1, 2].map(i => (
                                    <div key={i} className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-bounce" style={{ animationDelay: `${i * 0.2}s` }} />
                                ))}
                            </div>
                        </>
                    )}
                </div>
            )}

            {/* Search UI Container */}
            <div className="absolute top-6 left-6 right-6 z-10 flex flex-col gap-4 pointer-events-none">
                <div className="flex w-full justify-between items-start gap-4">
                    <div className="flex flex-col gap-3 pointer-events-auto">
                        <div className="bg-[#1A110D]/80 backdrop-blur-xl px-5 py-3 rounded-2xl shadow-2xl border border-white/5 flex items-center gap-4">
                            <div className="relative">
                                <div className="w-3 h-3 rounded-full bg-red-500 animate-ping absolute inset-0" />
                                <div className="w-3 h-3 rounded-full bg-red-500 relative" />
                            </div>
                            <div className="flex flex-col">
                                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/50 leading-none mb-1">Live Status</span>
                                <span className="text-xs font-black text-white">
                                    {competitorCount > 0 ? `상권 분석 완료 (주변 카페 ${competitorCount}곳)` : '상권 데이터 수집 중'}
                                </span>
                            </div>
                        </div>

                        <div className="bg-white/95 backdrop-blur-md px-5 py-3 rounded-2xl shadow-2xl border border-gray-100 flex items-center gap-4">
                            <div className="w-8 h-8 rounded-xl bg-amber-50 flex items-center justify-center text-lg">📈</div>
                            <div className="flex flex-col">
                                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-amber-900/40 leading-none mb-1">Market Density</span>
                                <span className="text-xs font-black text-amber-900">
                                    {competitorCount > 10 ? '경쟁 과열 단계' : competitorCount > 5 ? '경쟁 주의 단계' : '블루오션 단계'}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Search Bar */}
                    <form onSubmit={handleSearch} className="pointer-events-auto">
                        <div className="flex items-center gap-2 bg-white/90 backdrop-blur-md p-1.5 rounded-2xl border border-gray-100 shadow-2xl overflow-hidden min-w-[300px]">
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="분석할 주소 또는 지역 입력..."
                                className="flex-1 bg-transparent px-4 py-2 text-sm font-bold text-gray-800 placeholder:text-gray-400 focus:outline-none"
                            />
                            <button
                                type="submit"
                                className="bg-amber-900 text-white w-10 h-10 rounded-xl flex items-center justify-center hover:bg-amber-800 transition-all hover:scale-[1.05] active:scale-95 shadow-lg"
                            >
                                🔍
                            </button>
                        </div>
                    </form>
                </div>
            </div>

            {/* Bottom Right AI Insight */}
            <div className="absolute bottom-6 right-6 z-10 max-w-[240px] animate-slideIn" style={{ animationDelay: '0.4s' }}>
                <div className="bg-amber-600 p-5 rounded-3xl shadow-2xl shadow-amber-900/40 border border-white/20">
                    <p className="text-white text-[11px] font-bold leading-relaxed">
                        {competitorCount > 5
                            ? `"주변 카페가 ${competitorCount}곳으로 밀집도가 높습니다. 가격 경쟁보다는 사장님만의 시그니처 메뉴 홍보가 필수적인 시점입니다!"`
                            : `"현재 500m 이내 카페가 적은 블루오션 상태입니다. 신규 고객 확보를 위한 당근마켓 지역 광고를 적극 추천드려요!"`}
                    </p>
                </div>
            </div>
        </div>
    );
}
