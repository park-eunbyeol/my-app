const clientId = 'JGqwGyNhrySadaZpWH__';
const clientSecret = 'rwfPihUR7N';

async function testNaverSearch() {
    console.log('--- Testing Naver API ---');
    if (!clientId || !clientSecret) {
        console.log('❌ Naver API keys missing');
        return;
    }

    const query = encodeURIComponent('강남역 카페 소식');
    const url = `https://openapi.naver.com/v1/search/blog.json?query=${query}&display=3`;

    try {
        console.log('Fetching from Naver...');
        const response = await fetch(url, {
            headers: {
                'X-Naver-Client-Id': clientId,
                'X-Naver-Client-Secret': clientSecret,
            },
        });

        if (!response.ok) {
            console.log(`❌ Naver API Error: ${response.status} ${response.statusText}`);
            const text = await response.text();
            console.log('Response body:', text);
            return;
        }

        const data = await response.json();
        console.log('✅ Naver API Response Success');
        if (data.items && data.items.length > 0) {
            console.log('Example Result:', data.items[0].title);
        } else {
            console.log('No items found:', data);
        }
    } catch (e) {
        console.error('❌ Request Failed:', e.message);
    }
}

testNaverSearch();
