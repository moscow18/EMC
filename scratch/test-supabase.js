const https = require('https');

https.get('https://azseppmrregctvjavknc.supabase.co/auth/v1/health', (res) => {
  console.log('Status Code:', res.statusCode);
  res.on('data', (d) => {
    process.stdout.write(d);
  });
}).on('error', (e) => {
  console.error('Fetch Error:', e);
});
