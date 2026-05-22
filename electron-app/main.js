const { app, BrowserWindow } = require('electron');
const path = require('path');

// Karar metni oluşturma için örnek fonksiyon
function generateKararMetni(cezaSuresi, yas, sabikaVar, sabikaSuresi, magdurZarariOde) {
  let kararMetni = `Mahkemece yapılan değerlendirmeler neticesinde:

Sanık hakkında takdiren ${cezaSuresi} yıl hapis cezası verilmiştir.

`;

  // TCK 52/2 ve 52/4 - Kısa süreli ceza, para cezasına çevrilme ve taksitlendirme
  if (cezaSuresi <= 1) {
    const gunlukCeza = 100; // 100 TL
    const paraCezasi = cezaSuresi * 365 * gunlukCeza;
    const taksitSayisi = Math.floor(Math.random() * (12 - 4 + 1)) + 4; // 4-12 arası taksit
    kararMetni += `Not: TCK 52/2 gereğince kısa süreli hapis cezası ${paraCezasi} TL adli para cezasına çevrilmiştir ve ${taksitSayisi} taksite bölünmüştür.
`;
  }

  // TCK 58/6-7 - Tekerrür hükümleri
  if (sabikaVar && sabikaSuresi < 5) {
    kararMetni += `Not: Sanığın önceki sabıkasına göre TCK 58/6-7 uyarınca mükerrerlere özgü infaz rejimi uygulanacaktır.
`;
  }

  // Ceza erteleme: TCK 51 ve mağdur zararı kontrolü
  if (cezaSuresi <= 2 && (yas < 18 || yas >= 65) && cezaSuresi <= 3 && magdurZarariOde) {
    kararMetni += "Not: Ceza, Türk Ceza Kanunu'nun ilgili maddelerine göre ertelenmiştir.\n";
  } else if (!magdurZarariOde && cezaSuresi > 0.25) {
    kararMetni += "Not: Mağdurun zararı giderilmediği için ceza ertelenmeyecektir.\n";
  }

  kararMetni += `Uygulanan Maddeler:
 - TCK 51: Hapis cezasının ertelenmesi ve koşulları.
 - TCK 52/2: Kısa süreli hapis cezasının adli para cezasına çevrilmesi.
 - TCK 52/4: Adli para cezasının taksitlendirilmesi (4-12 ay).
 - TCK 53: Belirli hak yoksunluklarının uygulanması.
 - TCK 58/6-7: Tekerrür hükümleri ve mükerrerlere özgü infaz rejimi.
 - CMK 231: Hükmün açıklanmasının geri bırakılması.
`;

  return kararMetni;
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
  const kararMetni = generateKararMetni(1.5, 17, true, 2, true); // Örnek ceza, yaş, sabıka ve mağdur zararı durumu

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
