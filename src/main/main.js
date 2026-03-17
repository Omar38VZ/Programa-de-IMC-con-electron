const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const fs = require('fs');

const dataDir = path.join(__dirname, '..', 'data');
const historyFile = path.join(dataDir, 'history.json');

// Asegurar que el directorio de datos existe
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

// Asegurar que el archivo hostory.json existe
if (!fs.existsSync(historyFile)) {
  fs.writeFileSync(historyFile, JSON.stringify([]));
}

function createWindow() {
  const mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false
    }
  });

  mainWindow.loadFile(path.join(__dirname, '..', 'renderer', 'index.html'));
}

app.whenReady().then(() => {
  createWindow();

  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit();
});

// IPC Handler: Obtener historial
ipcMain.handle('get-history', async () => {
  try {
    const data = fs.readFileSync(historyFile, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error("Error al leer el historial:", error);
    return [];
  }
});

// IPC Handler: Guardar un nuevo cálculo en el historial
ipcMain.handle('save-history', async (event, newEntry) => {
  try {
    const data = fs.readFileSync(historyFile, 'utf8');
    const history = JSON.parse(data);
    history.push(newEntry);
    fs.writeFileSync(historyFile, JSON.stringify(history, null, 2));
    return { success: true };
  } catch (error) {
    console.error("Error al guardar el historial:", error);
    return { success: false, error: error.message };
  }
});

// IPC Handler: Limpiar historial
ipcMain.handle('clear-history', async () => {
  try {
    fs.writeFileSync(historyFile, JSON.stringify([]));
    return { success: true };
  } catch (error) {
    console.error("Error al limpiar el historial:", error);
    return { success: false, error: error.message };
  }
});
