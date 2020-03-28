import { app, Menu, Tray, NativeImage } from 'electron';
import { createOtherWindow } from './createWindow';

function createMenu(): Menu {
  return Menu.buildFromTemplate([
    {
      label: 'Open New Window',
      click: () => { createOtherWindow(); }
    },
    {
      label: 'Quit App',
      click: () => { app.quit(); }
    }
  ]);
}

export default function create(trayIcon: string | NativeImage): any {
  const appIcon = new Tray(trayIcon);
  appIcon.setToolTip('Electron react boilerplate');
  appIcon.setContextMenu(createMenu());

  return appIcon;
}
