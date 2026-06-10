import net from 'net';

const HOST = '49.13.52.159';
const PORTS = [80, 8000, 443];

function checkPort(port) {
  return new Promise((resolve) => {
    const socket = new net.Socket();
    socket.setTimeout(3000);
    
    socket.on('connect', () => {
      socket.destroy();
      resolve({ port, status: 'OPEN' });
    });
    
    socket.on('timeout', () => {
      socket.destroy();
      resolve({ port, status: 'TIMEOUT' });
    });
    
    socket.on('error', (err) => {
      socket.destroy();
      resolve({ port, status: 'CLOSED', error: err.message });
    });
    
    socket.connect(port, HOST);
  });
}

async function run() {
  console.log(`🔍 Escaneando puertos de conexión en tu VPS (${HOST})...`);
  for (const port of PORTS) {
    process.stdout.write(`Probando puerto ${port.toString().padEnd(5)} ... `);
    const res = await checkPort(port);
    if (res.status === 'OPEN') {
      console.log('✅ ¡ABIERTO!');
    } else {
      console.log(`❌ CERRADO / BLOQUEADO (${res.status})`);
    }
  }
}

run();
