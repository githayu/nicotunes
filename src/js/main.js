import App from 'app'
import electron, { Menu, dialog, shell } from 'electron'
import BrowserWindow from 'browser-window'
import request from 'request'

var mainWindow = null;

require('crash-reporter').start();

let menu = Menu.buildFromTemplate([
  {
    label: 'NicoTunes',
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

  mainWindow.openDevTools();


  request({
    url: 'https://api.github.com/repos/githayu/nicotunes/releases/latest',
    headers: { 'User-Agent': `NicoTunes ${App.getVersion()} ${process.platform} ${process.arch}` }
  }, (err, res, body) => {
    let latest = JSON.parse(body);

    // mainWindow.webContents.on('did-finish-load', () => {
    //   mainWindow.webContents.send('debug', latest);
    // });

    if (App.getVersion() !== latest.tag_name.slice(1)) {
      dialog.showMessageBox({
        type: 'info',
        buttons: ['更新する', 'キャンセル'],
        title: 'NicoTunes',
        message: `最新バージョン ${latest.tag_name} の更新が利用可能です。`,
        detail: '更新しますか？'
      }, button => {
        if (button === 0) {
          shell.openExternal(latest.html_url);
        }
      });
    }
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
});

App.on('will-finish-launching', () => {
  App.on('open-url', (...e) => {
    e.preventDefault();
    mainWindow.webContents.on('did-finish-load', () => {
      mainWindow.webContents.send('debug', e);
    });
  });
});

App.on('window-all-closed', () => {
  if (process.platform != 'drawin') {
    App.quit();
  }
});
