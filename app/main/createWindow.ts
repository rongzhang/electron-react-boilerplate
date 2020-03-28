import path from 'path';
import { BrowserWindow, Tray, KeyboardEvent, Rectangle } from 'electron';
import { autoUpdater } from 'electron-updater';
import log from 'electron-log';
import trayCreate from './tray';
import { createMenuBar as createMenuBarWindow, destroyMenuBar } from './createMenuBarWindow';
import MenuBuilder from './menu';

let mainWindow: BrowserWindow | null = null;
let appTray: Tray | null = null;
const otherWindows: Array<BrowserWindow> = [];

export class AppUpdater {
  constructor() {
    log.transports.file.level = 'info';
    autoUpdater.logger = log;
    autoUpdater.checkForUpdatesAndNotify();
  }
}

export const createWindow = (): BrowserWindow => {
  const wnd = new BrowserWindow({
    show: false,
    width: 1024,
    height: 728,
    webPreferences:
      process.env.NODE_ENV === 'development' || process.env.E2E_BUILD === 'true'
        ? {
            nodeIntegration: true,
          }
        : {
            preload: path.join(__dirname, 'dist/renderer.prod.js'),
          },
  });

  wnd.loadURL(`file://${__dirname}/app.html`);

  // @TODO: Use 'ready-to-show' event
  //        https://github.com/electron/electron/blob/master/docs/api/browser-window.md#using-ready-to-show-event
  wnd.webContents.on('did-finish-load', () => {
    if (process.env.START_MINIMIZED) {
      wnd.minimize();
    } else {
      wnd.show();
      wnd.focus();
    }
  });

  wnd.on('closed', () => {
    if (mainWindow === wnd) {
      mainWindow = null;

      destroyMenuBar();
      destroyTray();

      [...otherWindows].forEach(w => { w && w.close(); });
    } else {
      const index = otherWindows.findIndex(w => w === wnd);
      if (index !== -1) {
        otherWindows.splice(index, 1);
      }
    }
  });

  return wnd;
};

export const createTray = () => {
  if (!appTray) {
    appTray = trayCreate(path.join(__dirname, 'favicon.ico'));
    appTray?.on('double-click', (e: KeyboardEvent, bounds: Rectangle) => {
      createMenuBarWindow(bounds);
    })
  }
}

export const destroyTray = () => {
  appTray && appTray.destroy();
  appTray = null;
}

const installExtensions = async () => {
  const installer = require('electron-devtools-installer');
  const forceDownload = !!process.env.UPGRADE_EXTENSIONS;
  const extensions = ['REACT_DEVELOPER_TOOLS', 'REDUX_DEVTOOLS'];

  return Promise.all(
    extensions.map((name) => installer.default(installer[name], forceDownload))
  ).catch(console.log);
};

export const createMainWindow = async () => {
  if (!mainWindow) {
    if (
      process.env.NODE_ENV === 'development' ||
      process.env.DEBUG_PROD === 'true'
    ) {
      await installExtensions();
    }

    createTray();

    mainWindow = createWindow();
    //mainWindow.webContents.openDevTools({ mode: 'detach' });

    const menuBuilder = new MenuBuilder(mainWindow);
    menuBuilder.buildMenu();

    // Remove this if your app does not use auto updates
    // eslint-disable-next-line
    new AppUpdater();
  }
}

export const createOtherWindow = () => {
  const wnd = createWindow();
  otherWindows.push(wnd);
}
