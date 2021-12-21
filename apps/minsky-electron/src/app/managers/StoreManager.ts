import { defaultBackgroundColor } from '@minsky/shared';
import * as Store from 'electron-store';

interface Preferences {
  godleyTableShowValues: boolean;
  godleyTableOutputStyle: string;
  enableMultipleEquityColumns: boolean;
  numberOfRecentFilesToDisplay: number;
  wrapLongEquationsInLatexExport: boolean;
  // focusFollowsMouse: boolean;
}
interface MinskyStore {
  recentFiles: Array<string>;
  backgroundColor: string;
  preferences: Preferences;
}

export class StoreManager {
  // TODO:: We should sync the initial values with backend
  static store = new Store<MinskyStore>({
    defaults: {
      recentFiles: [],
      backgroundColor: defaultBackgroundColor,
      preferences: {
        godleyTableShowValues: false,
        godleyTableOutputStyle: 'sign',
        enableMultipleEquityColumns: false,
        numberOfRecentFilesToDisplay: 10,
        wrapLongEquationsInLatexExport: false,
        // focusFollowsMouse: false,
      },
    },
  });
}
