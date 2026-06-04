const https = require('https');
const fs = require('fs');
const path = require('path');

const apiKey = process.env.ANTHROPIC_API_KEY;
const logsPath = '/tmp/failure-logs.txt';
const githubOutput = process.env.GITHUB_OUTPUT;

function writeOutput(name, value) {
  if (!githubOutput) return;
  // Use heredoc delimiter for multiline values
  fs.appendFileSync(githubOutput, `${name}<<__EOF__\n${value}\n__EOF__\n`);
}

if (!apiKey) {
  console.warn('ANTHROPIC_API_KEY not set — skipping AI analysis');
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
  model: 'claude-sonnet-4-6',
  max_tokens: 1024,
  messages: [{ role: 'user', content: prompt }]
});

const options = {
  hostname: 'api.anthropic.com',
  path: '/v1/messages',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'x-api-key': apiKey,
    'anthropic-version': '2023-06-01',
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
        console.error('Claude API error:', parsed.error.message);
        writeOutput('has_analysis', 'false');
        writeOutput('analysis', '');
        process.exit(0);
      }
      const analysis = parsed.content?.[0]?.text || '';
      console.log('Analysis generated successfully');
      writeOutput('has_analysis', 'true');
      writeOutput('analysis', analysis);
    } catch (err) {
      console.error('Failed to parse response:', err.message);
      writeOutput('has_analysis', 'false');
      writeOutput('analysis', '');
    }
  });
});

req.on('error', (err) => {
  console.error('Request failed:', err.message);
  writeOutput('has_analysis', 'false');
  writeOutput('analysis', '');
});

req.write(requestBody);
req.end();
