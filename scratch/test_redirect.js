import http from 'http';

const options = {
  host: 'supabasekong-qxcax1lm4sxvwiyox2b3qn6n.49.13.52.159.sslip.io',
  port: 80,
  path: '/auth/v1/health',
  method: 'GET',
  headers: {
    'Host': 'supabasekong-qxcax1lm4sxvwiyox2b3qn6n.49.13.52.159.sslip.io'
  }
};

const req = http.request(options, (res) => {
  console.log(`HTTP Status: ${res.statusCode} ${res.statusMessage}`);
  console.log('Headers:', JSON.stringify(res.headers, null, 2));
  
  res.on('data', (chunk) => {
    // No print body
  });
});

req.on('error', (e) => {
  console.error('Error:', e.message);
});

req.end();
