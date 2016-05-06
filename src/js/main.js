import app from 'app'
import electron, { Menu, dialog, shell, ipcMain } from 'electron'
import BrowserWindow from 'browser-window'
import request from 'request'
import electronSquirrelSetup from 'electron-squirrel-startup'

if (electronSquirrelSetup || handleSquirrelEvent()) app.quit();

var mainWindow = null,
    videoWindow = null,
    viewAuthToken;

require('crash-reporter').start();

let menu = Menu.buildFromTemplate([
  {
    label: app.getName(),
    submenu: [
      {
        label: `${app.getName()} について`,
        click: showAboutDialog.bind()
      },
      { type: 'separator' },
      // {
      //   label: '環境設定',
      //   accelerator: 'CmdOrCtrl+,',
      //   click: showSettingsPage.bind()
      // },
      // { type: 'separator' },
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


app.on('ready', function() {

  Menu.setApplicationMenu(menu);

  mainWindow = new BrowserWindow({
    width: 500,
    height: 600,
    minWidth: 500,
    minHeight: 600,
    useContentSize: true,
    transparent: true,
    titleBarStyle: 'hidden'
  });

  mainWindow.loadUrl(`file://${__dirname}/../html/index.html`);

  // mainWindow.openDevTools();

  // バージョンチェック！
  request({
    url: 'https://api.github.com/repos/githayu/nicotunes/releases/latest',
    headers: { 'User-Agent': `NicoTunes ${app.getVersion()} ${process.platform} ${process.arch}` }
  }, (err, res, body) => {
    let latest = JSON.parse(body),
        currentVersion = app.getVersion().split('.'),
        releaseVersion = latest.tag_name.slice(1).split('.');

    if (currentVersion.some((num, i) => num < releaseVersion[i])) {
      dialog.showMessageBox({
        type: 'info',
        buttons: ['更新する', 'キャンセル'],
        title: app.getName(),
        message: `最新バージョン ${latest.tag_name} の更新が利用可能です。`
      }, button => {
        if (button === 0) {
          shell.openExternal(latest.html_url);
        }
      });
    }
  });

  mainWindow.webContents.on('will-navigate', (e, path) => {
    e.preventDefault();
    let videoId = path.match(/((sm|so|nm)\d+|\d{10})/);
    if (videoId) mainWindow.webContents.send('mainWindowDropItem', videoId[0]);
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
});

app.on('window-all-closed', () => {
  if (process.platform != 'drawin') {
    app.quit();
  }
});

ipcMain.on('setViewAuthToken', (e, data) => {
  viewAuthToken = Object.assign({}, viewAuthToken, data);
});

ipcMain.on('videoWindow', (e, id) => {

  if (videoWindow) videoWindow.close();

  videoWindow = new BrowserWindow({
    width: 1000,
    height: 433,
    minWidth: 1000,
    minHeight: 433,
    useContentSize: true
  });

  let req = JSON.stringify({
    id,
    session: viewAuthToken.session,
    history: viewAuthToken.history
  });

  videoWindow.loadUrl(`file://${__dirname}/../html/player.html?${req}`);
  videoWindow.show();
  // videoWindow.openDevTools();

  videoWindow.on('closed', () => {
    videoWindow = null;
  });

  videoWindow.webContents.on('did-finish-load', () => {
    videoWindow.webContents.session.webRequest.onBeforeSendHeaders({
      urls: [
        'http://*.nicovideo.jp/smile*',
        'http://flapi.nicovideo.jp/api/*'
      ]
    }, (details, callback) => {

      if (details.url.includes('flapi')) {
        details.requestHeaders.cookie = `user_session=${viewAuthToken.session}`;
      } else {
        details.requestHeaders.cookie = `nicohistory=${viewAuthToken.history}`;
      }

      callback({
        cancel: false,
        requestHeaders: details.requestHeaders
      });
    });
  });
});

ipcMain.on('videoWindowResize', (e, size) => {
  videoWindow.setContentSize(size.w, size.h);
});

ipcMain.on('mainWindowResize', (e, size) => {
  let width = 500,
      height = 600;

  if (toString.call(size).includes('String')) {
    switch (size) {
      case 'playing':
        width = 900;
        break;
    }
  }

  mainWindow.setContentSize(width, height);
});



function showAboutDialog() {
  dialog.showMessageBox({
    type: 'info',
    buttons: [],
    title: `${app.getName()} について`,
    message: app.getName(),
    detail: `バージョン ${app.getVersion()}\r\n© ${new Date().getFullYear()} Nanoway All rights reserved`
  });
}

function handleSquirrelEvent() {
  if (process.argv.length === 1) {
    return false;
  }

  const ChildProcess = require('child_process');
  const path = require('path');

  const appFolder = path.resolve(process.execPath, '..');
  const rootAtomFolder = path.resolve(appFolder, '..');
  const updateDotExe = path.resolve(path.join(rootAtomFolder, 'Update.exe'));
  const exeName = path.basename(process.execPath);

  const spawn = function(command, args) {
    let spawnedProcess, error;

    try {
      spawnedProcess = ChildProcess.spawn(command, args, {detached: true});
    } catch (error) {}

    return spawnedProcess;
  };

  const spawnUpdate = function(args) {
    return spawn(updateDotExe, args);
  };

  const squirrelEvent = process.argv[1];
  switch (squirrelEvent) {
    case '--squirrel-install':
    case '--squirrel-updated':
      // Optionally do things such as:
      // - Add your .exe to the PATH
      // - Write to the registry for things like file associations and
      //   explorer context menus

      // Install desktop and start menu shortcuts
      spawnUpdate(['--createShortcut', exeName]);

      setTimeout(app.quit, 1000);
      return true;

    case '--squirrel-uninstall':
      // Undo anything you did in the --squirrel-install and
      // --squirrel-updated handlers

      // Remove desktop and start menu shortcuts
      spawnUpdate(['--removeShortcut', exeName]);

      setTimeout(app.quit, 1000);
      return true;

    case '--squirrel-obsolete':
      // This is called on the outgoing version of your app before
      // we update to the new version - it's the opposite of
      // --squirrel-updated

      app.quit();
      return true;
  }
}
