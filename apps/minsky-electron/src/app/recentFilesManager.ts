import { Menu, MenuItem } from 'electron';
import { CommandsManager } from './commandsManager';
import { StoreManager } from './storeManager';

export class RecentFilesManager {
  static addFileToRecentFiles(filepath: string) {
    const recentFiles = StoreManager.store.get('recentFiles');

    const exists = Boolean(recentFiles.find((f) => f === filepath));
    if (!exists) {
      const newRecentFiles = this.getRecentFilesThatMatchesRecentFilesToDisplay(
        { recentFiles }
      );

      newRecentFiles.push(filepath);
      StoreManager.store.set('recentFiles', newRecentFiles);
    }
  }

  static initRecentFiles() {
    const recentFiles = StoreManager.store.get('recentFiles');

    const openRecentMenu = Menu.getApplicationMenu().getMenuItemById(
      'openRecent'
    );

    const newRecentFiles = this.getRecentFilesThatMatchesRecentFilesToDisplay({
      recentFiles,
    });

    newRecentFiles.forEach((filePath) => {
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

  private static getRecentFilesThatMatchesRecentFilesToDisplay({
    recentFiles,
  }) {
    const numberOfRecentFiles = recentFiles.length;

    const numberOfRecentFilesToDisplay = StoreManager.store.get('preferences')
      .numberOfRecentFilesToDisplay;

    if (
      numberOfRecentFiles &&
      numberOfRecentFiles > numberOfRecentFilesToDisplay
    ) {
      const numberOfItemsToBeRemoved =
        numberOfRecentFiles - numberOfRecentFilesToDisplay;

      if (numberOfItemsToBeRemoved === 0) {
        const newRecentFiles = recentFiles.shift();
        return newRecentFiles;
      }

      if (numberOfItemsToBeRemoved > 0) {
        const newRecentFiles = recentFiles.slice(numberOfItemsToBeRemoved);
        return newRecentFiles;
      }
    }

    return recentFiles;
  }
  static updateNumberOfRecentFilesToDisplay() {
    const recentFiles = StoreManager.store.get('recentFiles');

    const newRecentFiles = this.getRecentFilesThatMatchesRecentFilesToDisplay({
      recentFiles,
    });

    StoreManager.store.set('recentFiles', newRecentFiles);
  }
}
