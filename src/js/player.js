import electron, { ipcRenderer } from 'electron'

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
      getflv = Player.fn.url_parameter_decode(getflvApi);

  // プレイヤーの初期化
  P.classList.add('extension');
  P.addEventListener('screenResize', screenResize);
  Player.create.init();

  if (getflv.done == 'true') {
    P.classList.add('login');
    P.querySelector('.player-comment-input').value = '(⋈･◡･)つ　まだコメントできません';
    P.dataset.src = decodeURIComponent(getflv.url);
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
