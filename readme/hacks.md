1. We are considering the height of electron's menubar on window to be 20 in [window-utility.service.ts](libs\core\src\lib\services\WindowUtility\window-utility.service.ts)

```javascript
const electronMenuBarHeightForWindows = 20;
```

2. At some places we are doing ipcMain to ipcMain communication to avoid circular dependency issues. example:

```javascript
// electron
ipcMain.emit(events.ADD_RECENT_FILE, null, payload.filePath);

// electron
ipcMain.on(events.ADD_RECENT_FILE, (event, filePath: string) => {
  RecentFilesManager.addFileToRecentFiles(filePath);
});
```
