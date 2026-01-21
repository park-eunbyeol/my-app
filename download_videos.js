const fs = require('fs');
const https = require('https');
const path = require('path');

const files = [
    { title: "File:Sugar_falling_into_coffee.webm", output: "cafe-1.webm" },
    { title: "File:Kaffe_ur_maskin.webm", output: "cafe-2.webm" },
    // "Showreel chocolate & caramel by Will van der Vlugt.webm" seems like a high-quality product montage.
    // This fits "dessert only" / "only food" much better than a cooking tutorial.
    { title: "File:Showreel_chocolate_&_caramel_by_Will_van_der_Vlugt.webm", output: "cafe-3.webm" },
    // Strawberry dessert video from Pixabay - direct download
    { url: "https://cdn.pixabay.com/video/2020/06/18/42697-431869076_large.mp4", output: "strawberry_cake.mp4" }
];

const dir = path.join(__dirname, 'public', 'videos');
if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
}

function download(url, filePath) {
    const file = fs.createWriteStream(filePath);
    const protocol = url.startsWith('https') ? https : require('http');

    protocol.get(url, { headers: { 'User-Agent': 'CoffeeApp/1.0' } }, (response) => {
        // Handle redirects
        if (response.statusCode === 301 || response.statusCode === 302 || response.statusCode === 307 || response.statusCode === 308) {
            file.close();
            fs.unlinkSync(filePath); // Delete the empty file
            download(response.headers.location, filePath); // Follow redirect
            return;
        }

        if (response.statusCode !== 200) {
            console.error(`Failed to download ${url}: HTTP ${response.statusCode}`);
            file.close();
            return;
        }

        response.pipe(file);
        file.on('finish', () => {
            file.close();
            console.log(`Downloaded ${path.basename(filePath)}`);
        });
    }).on('error', (err) => {
        console.error(`Error downloading file: ${err.message}`);
        file.close();
        fs.unlinkSync(filePath);
    });
}

function processFile(fileInfo) {
    // If direct URL is provided, download directly
    if (fileInfo.url) {
        console.log(`Downloading from direct URL: ${fileInfo.url}`);
        download(fileInfo.url, path.join(dir, fileInfo.output));
        return;
    }

    // Otherwise, use Wikimedia API
    const apiUrl = `https://commons.wikimedia.org/w/api.php?action=query&titles=${encodeURIComponent(fileInfo.title)}&prop=imageinfo&iiprop=url&format=json`;

    https.get(apiUrl, { headers: { 'User-Agent': 'CoffeeApp/1.0' } }, (res) => {
        let data = '';
        res.on('data', (chunk) => data += chunk);
        res.on('end', () => {
            try {
                const result = JSON.parse(data);
                const pages = result.query.pages;
                const pageId = Object.keys(pages)[0];
                if (pageId === '-1') {
                    console.error(`File not found: ${fileInfo.title}`);
                    return;
                }
                const url = pages[pageId].imageinfo[0].url;
                console.log(`Found URL for ${fileInfo.title}: ${url}`);
                download(url, path.join(dir, fileInfo.output));
            } catch (e) {
                console.error(`Error parsing API response for ${fileInfo.title}: ${e.message}`);
            }
        });
    }).on('error', (err) => {
        console.error(`Error querying API: ${err.message}`);
    });
}

files.forEach(processFile);

