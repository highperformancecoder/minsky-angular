import { Menu, MenuItem } from 'electron';
import { CommandsManager } from './commandsManager';
import { StoreManager } from './storeManager';

export class RecentFilesManager {
  static addFileToRecentFiles(filepath: string) {
    const recentFiles = StoreManager.store.get('recentFiles');

    const exists = Boolean(recentFiles.find((f) => f === filepath));
    if (!exists) {
      recentFiles.push(filepath);
      StoreManager.store.set('recentFiles', recentFiles);
    }
  }

  static initRecentFiles() {
    const recentFiles = StoreManager.store.get('recentFiles');

    const openRecentMenu = Menu.getApplicationMenu().getMenuItemById(
      'openRecent'
    );

    recentFiles.forEach((filePath) => {
      const menuItem = openRecentMenu.submenu.items.find(
        (f) => f.label === filePath
      );

      if (menuItem && !menuItem.enabled) {
        menuItem.enabled = true;
      } else {
        const position = 0;
        openRecentMenu.submenu.insert(
          position,
          new MenuItem({
            label: filePath,
            click: async () => {
              await CommandsManager.openNamedFile(filePath);
            },
          })
        );
      }
    });
  }
}
