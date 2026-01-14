
const STIBEE_PUBLIC_API_URL = "https://stibee.com/api/v1.0/lists/kk3NKQX6RorIi23gl1_fgSoapKIgTg==/public/subscribers";

async function test() {
    const formData = new URLSearchParams();
    formData.append('email', 'test_diagnostic_' + Date.now() + '@example.com');
    formData.append('stb_policy', 'stb_policy_true');

    try {
        const response = await fetch(STIBEE_PUBLIC_API_URL, {
            method: 'POST',
            body: formData,
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Accept': 'application/json',
                'Referer': 'https://page.stibee.com/subscriptions/466239',
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            },
        });

        const status = response.status;
        const text = await response.text();
        console.log(JSON.stringify({ status, response: text }, null, 2));
    } catch (error) {
        console.error(JSON.stringify({ error: error.message }, null, 2));
    }
}

test();
