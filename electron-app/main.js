const { app, BrowserWindow } = require('electron');
const path = require('path');
const { Document, Packer, Paragraph } = require("docx");
const fs = require("fs");

// Word (.docx) dosyası oluşturma fonksiyonu
function generateWordFile(kararMetni) {
  const doc = new Document({
    sections: [
      {
        properties: {},
        children: [
          new Paragraph(kararMetni),
        ],
      },
    ],
  });

  Packer.toBuffer(doc).then((buffer) => {
    fs.writeFileSync("kisa_karar.docx", buffer);
    console.log("Word dosyası oluşturuldu: kisa_karar.docx");
  });
}

// UDF (XML) dosyası oluşturma fonksiyonu
function generateUdfFile(kararMetni) {
  const udfContent = `
  <UyapUdf>
    <Karar>
      <Metin>${kararMetni}</Metin>
    </Karar>
  </UyapUdf>`;

  fs.writeFileSync("kisa_karar.udf", udfContent);
  console.log("UDF dosyası oluşturuldu: kisa_karar.udf");
}

// Electron penceresi oluşturma
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

  // Karar metnini oluşturma
  const kararMetni = `Mahkemece yapılan değerlendirmeler neticesinde:

Sanık hakkında takdiren 1 yıl hapis cezası verilmiştir.

TCK 52/2 gereğince kısa süreli hapis cezası 36500 TL adli para cezasına çevrilmiştir.
CMK 231 gereğince hükmün açıklanmasının geri bırakılması uygulanmıştır.`;

  win.loadURL('data:text/html;charset=utf-8,' + encodeURIComponent(`
    <html>
    <head><title>Kısa Karar</title></head>
    <body>
      <h1>Kısa Karar</h1>
      <pre>${kararMetni}</pre>
      <button onclick="generateWord()">Word İndir</button>
      <button onclick="generateUdf()">UDF İndir</button>
      <script>
        const { ipcRenderer } = require('electron');
        
        function generateWord() {
          ipcRenderer.invoke('generate-word', '${kararMetni}');
        }

        function generateUdf() {
          ipcRenderer.invoke('generate-udf', '${kararMetni}');
        }
      </script>
    </body>
    </html>
  `));
}

// Electron uygulama olayları
app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

// IPC olaylarını dinleme
const { ipcMain } = require('electron');
ipcMain.handle('generate-word', (event, kararMetni) => {
  generateWordFile(kararMetni);
});

ipcMain.handle('generate-udf', (event, kararMetni) => {
  generateUdfFile(kararMetni);
});