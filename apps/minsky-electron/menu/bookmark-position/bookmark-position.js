const electron = require('electron');
const { ipcRenderer, Menu } = electron;
const storage = require('electron-json-storage');
storage.setDataPath((electron.app || electron.remote.app).getPath('userData'));
const bookmarkFileName = 'bookmarks';

document.querySelector('.cancel-btn').addEventListener('click', () => {
  ipcRenderer.send('global-menu-popup:cancel');
});

document.getElementById('bookmark-ok-btn').addEventListener('click', () => {
  const name = document.getElementById('bookmarkName').value;
  if (name) {
    storage.has(bookmarkFileName, (err, isExist) => {
      if (err) throw err;
      if (!isExist) storage.set(bookmarkFileName, [], (err) => {});
    });
    setTimeout(() => {
      ipcRenderer.send('save-bookmark', {
        bookmarkTitle: name,
        fileName: bookmarkFileName,
      });
    }, 400);
  }

  ipcRenderer.on('bookmark-done-reply', (event, arg) => {
    ipcRenderer.send('global-menu-popup:cancel');
  });
});
