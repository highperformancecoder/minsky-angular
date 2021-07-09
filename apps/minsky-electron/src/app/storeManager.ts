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
  minskyHttpServerPath: string;
  preferences: Preferences;
}

export class StoreManager {
  static store = new Store<MinskyStore>({
    defaults: {
      recentFiles: [],
      backgroundColor: defaultBackgroundColor,
      minskyHttpServerPath: '',
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
