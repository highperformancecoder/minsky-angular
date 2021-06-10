import { commandsMapping } from '@minsky/shared';
import { Menu, MenuItem } from 'electron';
import { RestServiceManager } from './restServiceManager';
import { StoreManager } from './storeManager';
import { WindowManager } from './windowManager';

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
              WindowManager.scrollToCenter(); // TODO:: Same needs to be added on normal file load .. perhaps better to do this as a callback / in ipc listeners

              await RestServiceManager.handleMinskyProcess({
                command: commandsMapping.LOAD,
                filePath,
              });
            },
          })
        );
      }
    });
  }
}
