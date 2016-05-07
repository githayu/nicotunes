# NicoTunes

![NicoTunes](https://nanoway.net/img/nicotunes/screenshot.png)

NicoTunes は、ニコニコ動画の音楽再生に特化したデスクトップ向け音楽プレイヤーです。  
※まだ開発段階なので、動かないところがあったり動作も不安定です。

- **[NicoTunes ウェブサイト](https://nanoway.net/nicotunes)**
- **[NicoTunes ダウンロード](https://github.com/githayu/nicotunes/releases/latest)**
- **[NicoTunes 開発タスク](https://trello.com/b/rtxLfzyF/nicotunes)**

## 機能
- サビからの再生機能で様々な楽曲を視聴できます。
- ボーカロイド曲で歌詞が登録されている曲なら歌詞が表示できます。
- 音声ファイルを利用するので余計な通信が発生しません。
- ニコニコ動画のマルチアカウント対応。
- いちおう動画も見れます。

## Development
~~~sh
git clone https://github.com/githayu/nicotunes.git
cd nicotunes
npm i && npm run compile
npm start
~~~

## License
[MIT License](LICENSE) の下に提供されています。
