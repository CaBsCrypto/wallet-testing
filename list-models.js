// Standalone script, no external deps
const https = require('https');
const fs = require('fs');

async function checkModels() {
    let key = process.env.GOOGLE_API_KEY;

    // Try to read from env local if not set
    if (!key) {
        try {
            const env = fs.readFileSync('apps/web/.env.local', 'utf8');
            const match = env.match(/GOOGLE_API_KEY=(.*)/);
            if (match) key = match[1].trim();
        } catch (e) {
            console.log("Could not read .env.local", e.message);
        }
    }

    if (!key) {
        console.error("No Key found");
        return;
    }

    console.log("Checking models for Key starts with:", key.substring(0, 8) + "...");

    const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${key}`;

    https.get(url, (res) => {
        let data = '';
        res.on('data', (chunk) => data += chunk);
        res.on('end', () => {
            try {
                const json = JSON.parse(data);
                if (json.models) {
                    console.log("--- Available Models ---");
                    json.models.forEach(m => {
                        // Filter for image or gemini models of interest
                        if (m.name.includes("image") || m.name.includes("gemini") || m.name.includes("vision")) {
                            console.log(`${m.name} [${m.supportedGenerationMethods.join(', ')}]`);
                        }
                    });
                } else {
                    console.log("Error Response:", JSON.stringify(json, null, 2));
                }
            } catch (e) {
                console.error("Parse Error:", e);
            }
        });
    }).on("error", (err) => {
        console.log("Error: " + err.message);
    });
}

checkModels();
