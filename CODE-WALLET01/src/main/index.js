const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const { LowSync, JSONFileSync } = require('lowdb');

// base de donnees fragments.json
const dbPath = path.join(app.getPath('userData'), 'fragments.json');
console.log(" DB PATH utilisé :", dbPath);

const adapter = new JSONFileSync(dbPath);
const db = new LowSync(adapter);
db.read();
db.data ||= { fragments: [] };
db.write();

function createWindow() {
  const win = new BrowserWindow({
    width: 1000,
    height: 800,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'), // Chemin relatif 
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  win.loadURL('http://localhost:5173'); // Vite dev server
}

app.whenReady().then(() => {
  createWindow();
  ipcMain.handle('get-fragments', () => {
    db.read();
    return db.data.fragments;
  });

  // Canal IPC pour ajouter un fragment
  ipcMain.on('add-fragment', (event, fragment) => {

    console.log("Fragment reçu :", fragment);
    
    db.read();
    db.data.fragments.push({
      id: Date.now(),
      ...fragment,
    });
    db.write();
  });
  ipcMain.on('delete-fragment', (event, id) => {
    db.read(); // Recharge la base
    db.data.fragments = db.data.fragments.filter(fragment => fragment.id !== id); // Supprime
    db.write(); // Sauvegarde
  });
  ipcMain.on('edit-fragment', (event, fragment) => {
    db.read();
    const index = db.data.fragments.findIndex(frag => frag.id === fragment.id);
    if (index !== -1) {
      db.data.fragments[index] = fragment;
      db.write();
    }
  });
  // Mettre à jour un tag dans tous les fragments
ipcMain.on('edit-tag', (event, { oldName, newName }) => {
  db.read();
  db.data.fragments = db.data.fragments.map(fragment => {
    return {
      ...fragment,
      tags: fragment.tags.map(tag => tag === oldName ? newName : tag)
    };
  });
  db.write();
});

// Supprimer un tag de tous les fragments
ipcMain.on('delete-tag', (event, tagToDelete) => {
  db.read();
  db.data.fragments = db.data.fragments.map(fragment => {
    return {
      ...fragment,
      tags: fragment.tags.filter(tag => tag !== tagToDelete)
    };
  });
  db.write();
});
ipcMain.on('import-fragments', (event, fragments) => {
  db.read();
  db.data.fragments = fragments;
  db.write();
});

  
  

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
