import app from 'app'
import electron, { Menu, dialog, shell } from 'electron'
import BrowserWindow from 'browser-window'
import request from 'request'
import electronSquirrelSetup from 'electron-squirrel-startup'

if (electronSquirrelSetup || handleSquirrelEvent()) app.quit();

var mainWindow = null;

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
  }
]);


app.on('ready', function() {

  Menu.setApplicationMenu(menu);

  mainWindow = new BrowserWindow({
    width: 550,
    height: 750,
    'min-width': 500,
    'min-height': 400
  });

  mainWindow.loadUrl(`file://${__dirname}/../html/index.html`);

  // mainWindow.openDevTools();

  request({
    url: 'https://api.github.com/repos/githayu/nicotunes/releases/latest',
    headers: { 'User-Agent': `NicoTunes ${app.getVersion()} ${process.platform} ${process.arch}` }
  }, (err, res, body) => {
    let latest = JSON.parse(body);

    // mainWindow.webContents.on('did-finish-load', () => {
    //   mainWindow.webContents.send('debug', latest);
    // });

    if (app.getVersion() !== latest.tag_name.slice(1)) {
      dialog.showMessageBox({
        type: 'info',
        buttons: ['更新する', 'キャンセル'],
        title: app.getName(),
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

app.on('will-finish-launching', () => {
  app.on('open-url', (...e) => {
    e.preventDefault();
    mainWindow.webContents.on('did-finish-load', () => {
      mainWindow.webContents.send('debug', e);
    });
  });
});

app.on('window-all-closed', () => {
  if (process.platform != 'drawin') {
    app.quit();
  }
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
