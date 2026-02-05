const https = require('https');
const fs = require('fs');

async function testGen() {
    let key = process.env.GOOGLE_API_KEY;
    if (!key) {
        try {
            const env = fs.readFileSync('apps/web/.env.local', 'utf8');
            const match = env.match(/GOOGLE_API_KEY=(.*)/);
            if (match) key = match[1].trim();
        } catch (e) { }
    }

    if (!key) {
        console.error("No Key");
        return;
    }

    const prompt = "Hello";
    console.log("Testing FLASH generation with key ending in", key.substr(-4));

    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${key}`;

    const payload = {
        contents: [{ parts: [{ text: "Hello" }] }]
    };

    const req = https.request(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        }
    }, (res) => {
        let data = '';
        res.on('data', c => data += c);
        res.on('end', () => {
            console.log("Status:", res.statusCode);
            console.log("Body:", data.substring(0, 500));
        });
    });

    req.on('error', (e) => console.error("Req Error:", e));
    req.write(JSON.stringify(payload));
    req.end();
}

testGen();
