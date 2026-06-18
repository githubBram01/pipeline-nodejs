const https = require('https');
const fs = require('fs');

const apiKey = process.env.GEMINI_API_KEY;
const logsPath = '/tmp/failure-logs.txt';
const githubOutput = process.env.GITHUB_OUTPUT;

function writeOutput(name, value) {
  if (!githubOutput) return;
  fs.appendFileSync(githubOutput, `${name}<<__EOF__\n${value}\n__EOF__\n`);
}

if (!apiKey) {
  console.warn('GEMINI_API_KEY not set — skipping AI analysis');
  writeOutput('has_analysis', 'false');
  writeOutput('analysis', '');
  process.exit(0);
}

const logs = fs.existsSync(logsPath) ? fs.readFileSync(logsPath, 'utf-8') : '(no logs found)';

const prompt = `You are a CI/CD expert analyzing a GitHub Actions pipeline failure for a Node.js + React project.

Review the logs below and provide:
1. **Root cause** — what specifically failed and why
2. **Affected job(s)** — which test or build step broke
3. **Fix** — concrete steps to resolve the issue (code snippets if helpful)

Keep the response under 350 words. Use markdown.

---
${logs}`;

const requestBody = JSON.stringify({
  contents: [{ parts: [{ text: prompt }] }],
  generationConfig: { maxOutputTokens: 1024 }
});

const path = `/v1beta/models/gemini-3.5-flash:generateContent?key=${apiKey}`;

const options = {
  hostname: 'generativelanguage.googleapis.com',
  path,
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(requestBody)
  }
};

const req = https.request(options, (res) => {
  let data = '';
  res.on('data', chunk => { data += chunk; });
  res.on('end', () => {
    try {
      const parsed = JSON.parse(data);
      if (parsed.error) {
        console.error('Gemini API error:', parsed.error.message);
        process.exit(1);
      }
      const analysis = parsed.candidates?.[0]?.content?.parts?.[0]?.text || '';
      console.log('Analysis generated successfully');
      writeOutput('has_analysis', 'true');
      writeOutput('analysis', analysis);
    } catch (err) {
      console.error('Failed to parse Gemini response:', err.message);
      process.exit(1);
    }
  });
});

req.on('error', (err) => {
  console.error('Gemini request failed:', err.message);
  process.exit(1);
});

req.write(requestBody);
req.end();
