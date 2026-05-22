const { app, BrowserWindow } = require('electron');
const path = require('path');

// Karar metni oluşturma için örnek fonksiyon
function generateKararMetni(cezaSuresi, yas, sabikaVar, sabikaSuresi, magdurZarariOde, kisaKarar = false, esasCeza = "") {
  let kararMetni = "";

  if (!kisaKarar) {
    // Tam Karar Metni (Gerekçeli Karar)
    kararMetni += `Mahkemece yapılan değerlendirmeler neticesinde:\n\nSanık hakkında takdiren ${cezaSuresi} yıl hapis cezası verilmiştir.\n\n`;
  }

  // CMK 231 - HAGB Kararı
  if (cezaSuresi < 2 && !sabikaVar && magdurZarariOde) {
    kararMetni += `CMK 231 gereğince hükmün açıklanmasının geri bırakılması (HAGB) kararı verilmiştir. Denetim süresi 5 yıl olup, yeni suç işlenmediği takdirde kamu davası düşecektir.\n`;
    if (kisaKarar) return kararMetni; // Kısa Karar ise, yalnızca bu sonucu döndür.
  }

  // TCK 52/2 - Kısa ceza, para cezasına dönüşüm
  if (cezaSuresi <= 1) {
    const gunlukCeza = 100; // 100 TL
    const paraCezasi = cezaSuresi * 365 * gunlukCeza;
    const taksitSayisi = Math.floor(Math.random() * (12 - 4 + 1)) + 4; // 4-12 arası taksit
    kararMetni += `Kısa süreli hapis cezası, TCK 52/2 gereğince ${paraCezasi} TL adli para cezasına çevrilmiş ve ${taksitSayisi} takside bölünmüştür.\n`;
    if (kisaKarar) return kararMetni;
  }

  // TCK 58/6-7 - Tekerrür
  if (sabikaVar && sabikaSuresi < 5) {
    kararMetni += `Sanığın önceki sabıkasına göre TCK 58/6-7 uyarınca mükerrerlere özgü infaz rejimi uygulanacaktır.\n`;
    if (esasCeza) {
      kararMetni += `Tekerrüre esas alınan ceza: ${esasCeza}\n`; // Esas sabıka bilgisi
    } else {
      kararMetni += `Not: Tekerrüre esas ceza bilgisi belirtilmemiştir. Belirtilen cezayı doğrulamanız gerekmektedir.\n`;
    }
    if (kisaKarar) return kararMetni;
  }

  // Erteleme veya Red
  if (cezaSuresi <= 2 && (yas < 18 || yas >= 65) && cezaSuresi <= 3 && magdurZarariOde) {
    kararMetni += "Ceza, TCK 51'e göre ertelenmiştir.\n";
  } else if (!magdurZarariOde && cezaSuresi > 0.25) {
    kararMetni += "Mağdurun zararı giderilmediği için ceza ertelenmemiştir.\n";
    if (kisaKarar) return kararMetni;
  }

  if (!kisaKarar) {
    // Ek Maddeler (Gerekçeli Kararda)
    kararMetni += `Uygulanan Maddeler:\n - TCK 52: Kısa süreli ceza ve adli para.\n - TCK 58: Tekerrür hükümleri.\n - TCK 53: Hak yoksunluğu.\n - CMK 231: HAGB ve kamu davası.`;
  }

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
  const kararMetni = generateKararMetni(1.5, 20, true, 3, true, false, "12 ay hapis cezası (2020 yılında işlenen suçtan)");

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
