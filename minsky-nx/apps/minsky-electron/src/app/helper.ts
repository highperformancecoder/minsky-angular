import { Menu, MenuItem } from 'electron';
import * as storage from 'electron-json-storage';

export function addUpdateBookmarkList(mainMenu: Menu) {
  storage.get('bookmarks', (error, data: [{ title: string; click: any }]) => {
    if (error) new Error('File not found or error selecting the file');
    if (data) {
      const outerSubMenu = mainMenu.getMenuItemById('main-bookmark').submenu;
      const innerSubMenu = outerSubMenu.getMenuItemById('delete-bookmark')
        .submenu;

      outerSubMenu.append(new MenuItem({ type: 'separator' }));
      if (Array.isArray(data)) {
        data.forEach((ele) => {
          outerSubMenu.append(
            new MenuItem({
              label: ele.title,
              click: goToSelectedBookmark.bind(ele),
            })
          );
          innerSubMenu.append(
            new MenuItem({
              label: ele.title,
              click: deleteBookmark.bind(ele),
            })
          );
        });
      }
      Menu.setApplicationMenu(mainMenu);
    }
  });
}
