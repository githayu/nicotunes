import app from 'app'
import request from 'request'
import electron, { dialog, shell } from 'electron'

export default class UpdateChecker {
  constructor(req) {
    this.current = app.getVersion();
    this.latest = null;

    this.req = {
      user: req.user,
      repos: req.repos
    }
  }

  getLatestVersion() {
    const options = {
      url: `https://api.github.com/repos/${this.req.user}/${this.req.repos}/releases/latest`,
      json: true,
      headers: {
        'User-Agent': `NicoTunes UpdateChecker`
      }
    }

    return new Promise((resolve, reject) => {
      if (this.latest) resolve(this.latest);

      request(options, (err, res) => {
        if (res.statusCode !== 200) reject();

        var version = res.body.tag_name.slice(1);

        this.latest = version;
        resolve(res.body);
      });
    });
  }

  check() {
    this.getLatestVersion().then(latest => {
      if (this.latest <= this.current) return false;

      var options = {
        type: 'info',
        buttons: ['Open', 'Cancel'],
        title: app.getName(),
        message: `最新バージョン ${this.latest} への更新が可能です。`,
        detail: latest.body
      }

      dialog.showMessageBox(options, button => {
        if (button === 0) shell.openExternal(latest.html_url);
      });
    });
  }
}
