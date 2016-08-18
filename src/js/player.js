import { ipcRenderer } from 'electron';
import Utils from '../js/utils/Utils';

$(async () => {
  var formData = new FormData();
      formData.append('mode', 'navigate');

  const screenResize = e => {
    let req = { w: 1000, h: 433 };

    if (e.detail.enable) {
      req = (e.detail.type) ? { w: 1000, h: 553 } : { w: 1214, h: 553 };
    }

    ipcRenderer.send('videoWindowResize', req);
  }

  // 動画情報がほしい
  Data = await fetch(`http://www.nicofinder.net/watch/${req.id}`, {
    method: 'post',
    body: formData
  }).then(res => res.json());

  // 動画URLをひっこ抜く
  let getflvApi = await fetch(`http://flapi.nicovideo.jp/api/getflv/${req.id}`).then(res => res.text()),
      getflv = Utils.URLParamDecoder(getflvApi);

  // プレイヤーの初期化
  P.classList.add('extension');
  P.addEventListener('screenResize', screenResize);

  var observer = new MutationObserver(mutations => mutations.forEach(mutation => {
    for (let item of mutation.addedNodes) {
      if (item.nodeType === 1 && item.classList.contains('extension-receiver')) {
        item.value = JSON.stringify({
          type: 'getflv',
          data: getflv
        });
        observer.disconnect();
        break;
      }
    }
  }));

  observer.observe(P, {
    childList: true
  });

  Player.create.init();

  if (getflv.done == 'true') {
    P.classList.add('login');
    P.querySelector('.player-comment-input').value = '(⋈･◡･)つ　コメントはできません';
    Player.state.setting.comment_font = "'Hiragino Kaku Gothic ProN', 'ヒラギノ角ゴ ProN W3', 'Hiragino Kaku Gothic Pro', 'ヒラギノ角ゴ Pro', YuGothic, 'Yu Gothic', 游ゴシック, Meiryo, メイリオ, Helvetica, sans-serif"
  }

  // 設定ですでにワイドモードになってるとき
  if (Player.state.setting.video_wide) screenResize({
    detail: {
      type: Player.state.setting.video_wide_side,
      enable: true
    }
  });
});
