import { shell } from 'electron';

export default class CreateContextMeun {
  constructor(component, order, item) {
    this.props = component.props;
    this.item = item;

    let result = [];

    order.forEach(e => {
      if (typeof e == 'string') {
        let menu = this[e]();

        if (typeof menu !== 'undefined') {
          result.push(menu);
        }
      } else {
        result.push(e);
      }
    });

    return result;
  }

  validate(req) {
    return req.every(e => {
      let _path = e.split('.'),
          path = this;

      return _path.every(p => {
        if (typeof path[p] != 'undefined' && path[p] !== null) {
          path = path[p];
          return true;
        } else {
          return false;
        }
      });
    });
  }

  play() {
    if (this.validate([
      'props.playMusic',
      'props.accounts.niconico.selected',
      'item'
    ])) return {
      label: '再生',
      click: this.props.playMusic.bind(this, {
        type: 'mylist',
        account: this.props.accounts.niconico.selected,
        video: this.item
      })
    };
  }

  playChorus() {
    if (this.validate([
      'props.playMusic',
      'props.accounts.niconico.selected',
      'item'
    ])) return {
      label: 'サビから再生',
      click: this.props.playMusic.bind(this, {
        type: 'mylist',
        account: this.props.accounts.niconico.selected,
        video: this.item,
        mode: ['chorus']
      })
    };
  }

  nextPlay() {
    if (this.validate([
      'props.queueController',
      'props.play.video',
      'item.id'
    ])) return {
      label: '次に再生',
      click: this.props.queueController.bind(this, {
        type: 'add',
        item: this.item,
        id: this.props.play.video.id
      })
    };
  }

  queueAdd() {
    if (this.validate([
      'props.queueController',
      'item'
    ])) return {
      label: '再生キューに追加',
      click: this.props.queueController.bind(this, {
        type: 'add',
        item: this.item
      })
    };
  }

  queueDelete() {
    if (this.validate([
      'props.queueController',
      'item.id'
    ])) return {
      label: '再生キューから削除',
      click: this.props.queueController.bind(this, {
        type: 'delete',
        id: this.item.id
      })
    };
  }

  separator() {
    return { type: 'separator' };
  }

  videoDetail() {
    return {
      label: '詳細情報を見る'
    };
  }

  niconico() {
    if (this.validate([
      'item.id'
    ])) return {
      label: 'Niconico',
      submenu: [
        { label: '動画を見る', click: shell.openExternal.bind(this, `http://www.nicovideo.jp/watch/${this.item.id}`) },
        { label: 'ランキング推移を見る', click: shell.openExternal.bind(this, `http://www.nicovideo.jp/ranking_graph/fav/daily/all/${this.item.id}`) },
        { label: 'ニコニ広告を開く', click: shell.openExternal.bind(this, `http://uad.nicovideo.jp/ads/?vid=${this.item.id}`) },
        { label: 'コンテンツツリーを見る', click: shell.openExternal.bind(this, `http://commons.nicovideo.jp/tree/${this.item.id}`) },
        { label: 'マイリストコメントを見る', click: shell.openExternal.bind(this, `http://www.nicovideo.jp/mylistcomment/video/${this.item.id}`) },
        { label: 'この動画が含まれる公開マイリストを見る', click: shell.openExternal.bind(this, `http://www.nicovideo.jp/openlist/${this.item.id}`) },
        { label: 'この動画の大百科を開く', click: shell.openExternal.bind(this, `http://dic.nicovideo.jp/v/${this.item.id}`) },
        { label: '投稿者ページを開く', click: shell.openExternal.bind(this, `http://www.nicofinder.net/user/${this.item.userId}`) },
        { label: '投稿者の大百科を開く', click: shell.openExternal.bind(this, `http://dic.nicovideo.jp/u/${this.item.userId}`) },
        { label: '違反動画の通報をする', click: shell.openExternal.bind(this, `http://www.nicovideo.jp/allegation/${this.item.id}`) }
      ]
    };
  }

  nicofinder() {
    if (this.validate([
      'item.id'
    ])) return {
      label: 'Nicofinder',
      submenu: [
        { label: '動画を見る', click: shell.openExternal.bind(this, `http://www.nicofinder.net/watch/${this.item.id}`) },
        { label: 'コメント解析を開く', click: shell.openExternal.bind(this, `http://www.nicofinder.net/comment/${this.item.id}`) }
      ]
    };
  }
}
