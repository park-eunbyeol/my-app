const fs = require('fs');
const https = require('https');
const path = require('path');

const files = [
    { title: "File:Sugar_falling_into_coffee.webm", output: "cafe-1.webm" },
    { title: "File:Kaffe_ur_maskin.webm", output: "cafe-2.webm" },
    // "Showreel chocolate & caramel by Will van der Vlugt.webm" seems like a high-quality product montage.
    // This fits "dessert only" / "only food" much better than a cooking tutorial.
    { title: "File:Showreel_chocolate_&_caramel_by_Will_van_der_Vlugt.webm", output: "cafe-3.webm" }
];

const dir = path.join(__dirname, 'public', 'videos');
if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
}

function download(url, filePath) {
    const file = fs.createWriteStream(filePath);
    https.get(url, { headers: { 'User-Agent': 'CoffeeApp/1.0' } }, (response) => {
        response.pipe(file);
        file.on('finish', () => {
            file.close();
            console.log(`Downloaded ${path.basename(filePath)}`);
        });
    }).on('error', (err) => {
        console.error(`Error downloading file: ${err.message}`);
    });
}

function processFile(fileInfo) {
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
