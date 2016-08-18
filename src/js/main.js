import { app, Menu, ipcMain, BrowserWindow } from 'electron';
import electronSquirrelSetup from 'electron-squirrel-startup';
import UpdateChecker from './utils/UpdateChecker';
import { mainMenu } from './mainMenu';

if (electronSquirrelSetup || handleSquirrelEvent()) app.quit();

var mainWindow = null,
    videoWindow = null,
    accessToken = {};

// crashReporter.start({
//   productName: app.getName(),
//   companyName: 'Nanoway',
//   submitURL: 'https://nanoway.net/nicotunes/crash'
// });

app.on('ready', function() {
  Menu.setApplicationMenu(mainMenu);

  mainWindow = new BrowserWindow({
    width: 500,
    height: 600,
    minWidth: 500,
    minHeight: 600,
    transparent: true,
    titleBarStyle: 'hidden'
  });

  mainWindow.loadURL(`file://${__dirname}/../html/index.html`);

  if (process.title.includes('prebuilt')) {
    mainWindow.openDevTools();
  }

  let checker = new UpdateChecker({
    user: 'githayu',
    repos: 'nicotunes'
  });

  checker.check();

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

ipcMain.on('setAccessToken', (e, data) => {
  accessToken = Object.assign({}, accessToken, data);
});

ipcMain.on('videoWindow', createVideoWindow);

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
  mainWindow.setMinimumSize(width, height);
});


function createVideoWindow(e, id) {
  if (videoWindow) videoWindow.close();

  videoWindow = new BrowserWindow({
    width: 1000,
    height: 433,
    resizable: false,
    useContentSize: true
  });

  var query = JSON.stringify({ id });

  videoWindow.loadURL(`file://${__dirname}/../html/player.html?${query}`);
  videoWindow.show();
  // videoWindow.openDevTools();

  videoWindow.on('closed', () => {
    videoWindow = null;
  });

  videoWindow.webContents.on('did-finish-load', () => {
    videoWindow.webContents.session.webRequest.onBeforeSendHeaders({
      urls: [
        'http://*.nicovideo.jp/smile*',
        'http://flapi.nicovideo.jp/api/*',
        'http://www.nicovideo.jp/api/mylist/add',
        'http://www.nicovideo.jp/mylist_add/video/*'
      ]
    }, (details, callback) => {

      if (details.url.includes('smile')) {
        details.requestHeaders.cookie = `nicohistory=${accessToken.history}`;
      } else {
        details.requestHeaders.cookie = `user_session=${accessToken.session}`;
      }

      callback({
        cancel: false,
        requestHeaders: details.requestHeaders
      });
    });
  });

  ipcMain.on('videoWindowResize', (e, size) => {
    videoWindow.setContentSize(size.w, size.h);
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
    let spawnedProcess;

    try {
      spawnedProcess = ChildProcess.spawn(command, args, {detached: true});
    } catch (error) {

    }

    return spawnedProcess;
  };

  const spawnUpdate = function(args) {
    return spawn(updateDotExe, args);
  };

  const squirrelEvent = process.argv[1];
  switch (squirrelEvent) {
    case '--squirrel-install':
    case '--squirrel-updated':
      spawnUpdate(['--createShortcut', exeName]);

      setTimeout(app.quit, 1000);
      return true;

    case '--squirrel-uninstall':
      spawnUpdate(['--removeShortcut', exeName]);

      setTimeout(app.quit, 1000);
      return true;

    case '--squirrel-obsolete':
      app.quit();
      return true;
  }
}
