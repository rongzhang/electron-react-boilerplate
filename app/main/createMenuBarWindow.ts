import { Rectangle, BrowserWindow } from 'electron';
import Positioner from 'electron-positioner';

let browserWindow: BrowserWindow | undefined;
let cachedTrayBounds: Rectangle | undefined;

function positionWindow(): void {
  if (cachedTrayBounds && browserWindow) {
    let windowPosition = 'topRight';
    windowPosition = (process.platform === 'win32') ? 'trayBottomCenter' : 'trayCenter';

    const positioner = new Positioner(browserWindow);
    const { x, y } = positioner.calculate(windowPosition, cachedTrayBounds);

    browserWindow.setPosition(x, y);
  }
}

function showWindow(): void {
  browserWindow?.show();
  browserWindow?.focus();
}

export function createMenuBar(trayBounds?: Rectangle): BrowserWindow {
  if (trayBounds) cachedTrayBounds = trayBounds;

  if (browserWindow) {
    positionWindow();
    if (!browserWindow.webContents.isLoading()) {
      showWindow();
    }
    return browserWindow;
  }

  browserWindow = new BrowserWindow({
    show: false,
    width: 338,
    height: 600,
    frame: false,
  });

  browserWindow.loadURL('https://www.github.com');

  browserWindow.on('closed', () => {
    browserWindow = undefined;
  });

  //browserWindow.webContents.openDevTools({ mode: 'detach' });
  browserWindow.webContents.on('did-finish-load', () => {
    positionWindow();
    showWindow();
  });

  browserWindow.on('blur', () => {
    browserWindow?.hide();
  });

  return browserWindow;
}

export function destroyMenuBar() {
  browserWindow && browserWindow.close();
  cachedTrayBounds = undefined;
}
