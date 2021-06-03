import { commandsMapping } from '@minsky/shared';
import { Menu, MenuItem } from 'electron';
import { RestServiceManager } from './restServiceManager';

export class BookmarkManager {
  static async populateBookmarks(bookmarkString: string) {
    const bookmarks: string[] = JSON.parse(bookmarkString.split('=>').pop());
    const mainSubmenu = Menu.getApplicationMenu().getMenuItemById(
      'main-bookmark'
    ).submenu;

    const deleteBookmarkSubmenu = Menu.getApplicationMenu()
      .getMenuItemById('main-bookmark')
      .submenu.getMenuItemById('delete-bookmark').submenu;

    const disableAllBookmarksInListAndDelete = () => {
      mainSubmenu.items.forEach((bookmark) => {
        if (bookmark.id === 'minsky-bookmark') {
          bookmark.visible = false;
        }
      });

      deleteBookmarkSubmenu.items.forEach((bookmark) => {
        if (bookmark.id === 'minsky-bookmark') {
          bookmark.visible = false;
        }
      });
    };

    const addNewBookmarks = () => {
      if (bookmarks.length) {
        bookmarks.forEach((bookmark, index) => {
          mainSubmenu.append(
            new MenuItem({
              id: 'minsky-bookmark',
              label: bookmark,
              click: () => {
                RestServiceManager.handleMinskyProcess({
                  command: `${commandsMapping.GOTO_BOOKMARK} ${index}`,
                });
              },
            })
          );

          deleteBookmarkSubmenu.append(
            new MenuItem({
              id: 'minsky-bookmark',
              label: bookmark,
              click: async () => {
                RestServiceManager.handleMinskyProcess({
                  command: `${commandsMapping.DELETE_BOOKMARK} ${index}`,
                });

                const _bookmarkString = await RestServiceManager.getCommandValue(
                  {
                    command: commandsMapping.BOOKMARK_LIST,
                  }
                );

                await this.populateBookmarks(_bookmarkString);
              },
            })
          );
        });
      }
    };

    disableAllBookmarksInListAndDelete();
    addNewBookmarks();
  }
}
