import { updateServerUrl } from '@minsky/shared';
import * as debug from 'debug';
import { app, autoUpdater, dialog } from 'electron';
import { arch, platform } from 'os';
import { Utility } from '../utility';

const logError = debug('minsky:electron_error');
const logUpdateEvent = debug('minsky:electron_update_event');

export default class UpdateEvents {
  // initialize auto update service - most be invoked only in production
  static initAutoUpdateService() {
    const platform_arch =
      platform() === 'win32' ? platform() : platform() + '_' + arch();
    const version = app.getVersion();
    const feed: Electron.FeedURLOptions = {
      url: `${updateServerUrl}/update/${platform_arch}/${version}`,
    };

    if (!Utility.isDevelopmentMode()) {
      logUpdateEvent('Initializing auto update service...\n');

      autoUpdater.setFeedURL(feed);
      UpdateEvents.checkForUpdates();
    }
  }

  // check for updates - most be invoked after initAutoUpdateService() and only in production
  static checkForUpdates() {
    if (!Utility.isDevelopmentMode() && autoUpdater.getFeedURL() !== '') {
      autoUpdater.checkForUpdates();
    }
  }
}

autoUpdater.on(
  'update-downloaded',
  (event, releaseNotes, releaseName, releaseDate) => {
    const dialogOpts = {
      type: 'info',
      buttons: ['Restart', 'Later'],
      title: 'Application Update',
      message: process.platform === 'win32' ? releaseNotes : releaseName,
      detail:
        'A new version has been downloaded. Restart the application to apply the updates.',
    };

    dialog.showMessageBox(dialogOpts).then((returnValue) => {
      if (returnValue.response === 0) autoUpdater.quitAndInstall();
    });
  }
);

autoUpdater.on('checking-for-update', () => {
  logUpdateEvent('Checking for updates...\n');
});

autoUpdater.on('update-available', () => {
  logUpdateEvent('New update available!\n');
});

autoUpdater.on('update-not-available', () => {
  logUpdateEvent('Up to date!\n');
});

autoUpdater.on('before-quit-for-update', () => {
  logUpdateEvent('Application update is about to begin...\n');
});

autoUpdater.on('error', (message) => {
  logError('There was a problem updating the application');
  logError(message, '\n');
});
