import fs from 'fs';
import path from 'path';

const IMG_URL = 'https://sheejspqhpmdlgzkpncd.supabase.co/storage/v1/object/public/vehicles/0.08673122824653035.png';
const SAVE_PATH = './scratch/test_downloaded.png';

async function testDownload() {
  console.log(`📡 Intentando descargar de forma directa la imagen pública:`);
  console.log(IMG_URL);
  
  try {
    const res = await fetch(IMG_URL);
    console.log(`HTTP Status: ${res.status} ${res.statusText}`);
    
    if (res.ok) {
      const buffer = await res.arrayBuffer();
      fs.writeFileSync(SAVE_PATH, Buffer.from(buffer));
      console.log(`✅ ¡Éxito! Archivo guardado localmente en: ${SAVE_PATH}`);
      console.log(`Tamaño descargado: ${fs.statSync(SAVE_PATH).size} bytes`);
    } else {
      const text = await res.text();
      console.log(`❌ Error al descargar:`, text);
    }
  } catch (err) {
    console.error('❌ Error de conexión:', err.message);
  }
}

testDownload();
