const { app, BrowserWindow } = require('electron');
const path = require('path');

// Karar metni oluşturma için örnek fonksiyon
function generateKararMetni() {
  return `Mahkemece yapılan değerlendirmeler neticesinde:

Sanık hakkında takdiren 2 yıl hapis cezası verilmiştir.

Uygulanan Maddeler:
 - TCK 51: Hapis cezasının ertelenmesi ve koşulları.
 - TCK 53: Belirli hak yoksunluklarının uygulanması.
 - TCK 58: Tekerrür hükümleri.
 - CMK 231: Hükmün açıklanmasının geri bırakılması.
`;
}

function createWindow() {
  const win = new BrowserWindow({
    width: 1440,
    height: 960,
    minWidth: 1200,
    minHeight: 800,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false
    }
  });

  // Karar metnini almak ve bir HTML dosyasına iletmek
  const kararMetni = generateKararMetni();
  win.loadURL('data:text/html;charset=utf-8,' + encodeURIComponent(`
    <html>
    <head><title>Kısa Karar</title></head>
    <body>
      <h1>Kısa Karar</h1>
      <pre>${kararMetni}</pre>
    </body>
    </html>
  `));
}

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
