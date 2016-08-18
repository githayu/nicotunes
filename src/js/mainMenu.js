import { app, Menu, dialog } from 'electron';

export const mainMenu = Menu.buildFromTemplate([
  {
    label: app.getName(),
    submenu: [
      {
        label: `${app.getName()} について`,
        click: showAboutDialog.bind()
      },
      { type: 'separator' },
      {
        label: `${app.getName()} を終了`,
        accelerator: 'CmdOrCtrl+Q',
        click: app.quit.bind()
      }
    ]
  }, {
    label: '表示',
    submenu: [
      {
        label: '開発',
        accelerator: 'Alt+Command+I',
        click: (item, focusedWindow) => {
          if (focusedWindow) focusedWindow.toggleDevTools();
        }
      }
    ]
  }, {
    label: '編集',
    submenu: [
      {
        label: 'コピー',
        accelerator: 'CmdOrCtrl+C',
        role: 'copy'
      }, {
        label: 'ペースト',
        accelerator: 'CmdOrCtrl+V',
        role: 'paste'
      }, {
        label: 'カット',
        accelerator: 'CmdOrCtrl+X',
        role: 'cut'
      }, {
        label: 'すべて選択',
        accelerator: 'CmdOrCtrl+A',
        role: 'selectall'
      }
    ]
  }
]);

function showAboutDialog() {
  dialog.showMessageBox({
    type: 'info',
    buttons: [],
    title: `${app.getName()} について`,
    message: app.getName(),
    detail: `バージョン ${app.getVersion()}\r\n© ${new Date().getFullYear()} Nanoway All rights reserved`
  });
}
