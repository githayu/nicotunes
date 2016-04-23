import App from 'app'
import Menu from 'menu'
import electron, { dialog } from 'electron'
import BrowserWindow from 'browser-window'

var mainWindow = null;

require('crash-reporter').start();

let menu = Menu.buildFromTemplate([
  {
    label: App.getName(),
    submenu: [
      {
        label: 'NicoTunes について',
        click: showAboutDialog.bind()
      },
      { type: 'separator' },
      // {
      //   label: '環境設定',
      //   accelerator: 'CmdOrCtrl+,',
      //   click: showSettingsPage.bind()
      // },
      { type: 'separator' },
      {
        label: 'NicoTunes を終了',
        accelerator: 'CmdOrCtrl+Q',
        click: App.quit.bind()
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
  }
]);

function showAboutDialog() {
  dialog.showMessageBox({
    type: 'info',
    buttons: [],
    title: 'NicoTunes について',
    message: App.getName(),
    detail: `バージョン ${App.getVersion()}\r\n© ${new Date().getFullYear()} Nanoway All rights reserved`
  });
}

function showSettingsPage() {

}

App.on('ready', function() {

  Menu.setApplicationMenu(menu);

  mainWindow = new BrowserWindow({
    width: 550,
    height: 750,
    'min-width': 500,
    'min-height': 400
  });

  mainWindow.loadUrl(`file://${__dirname}/../html/index.html`);

  // mainWindow.openDevTools();

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
});

App.on('window-all-closed', () => {
  if (process.platform != 'drawin') {
    App.quit();
  }
});
