import { defaultBackgroundColor } from '@minsky/shared';
import * as Store from 'electron-store';

interface MinskyStore {
  recentFiles: Array<string>;
  backgroundColor: string;
}

export class StoreManager {
  static store = new Store<MinskyStore>({
    defaults: {
      recentFiles: [],
      backgroundColor: defaultBackgroundColor,
    },
  });
}
