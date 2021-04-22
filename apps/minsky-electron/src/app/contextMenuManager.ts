import * as contextMenu from 'electron-context-menu';

export class ContextMenuManager {
  public static buildContextMenu() {
    contextMenu({
      prepend: (defaultActions, parameters, browserWindow) => [
        {
          label: 'Help',
        },
        {
          label: 'Cut',
        },
        {
          label: 'Copy selection',
        },
        {
          label: 'Save selection as',
        },
        {
          label: 'Paste selection',
        },
        {
          label: 'Bookmark here',
        },
        {
          label: 'Bookmark here',
        },
        {
          label: 'Group',
        },
        {
          label: 'Lock Selected Ravels',
        },
        {
          label: 'Lock Selected Ravels',
        },
        {
          label: 'Unlock Selected Ravels',
        },
        {
          label: 'Open master Group',
        },
      ],
    });
  }
}
