import { ipcRenderer, dialog } from 'electron';
import IndexedDBController from '../utils/IndexedDBController';
import { ACTION, GET, APIHOSTS } from '../constants';
import { fetchApi } from './app';

const IDB = new IndexedDBController();

export function playMusic(options) {
  return async dispatch => {
    dispatch({
      type: ACTION.PLAY.STATE,
      req: { loading: true }
    });

    function vocaDBApi() {
      return fetchApi({
        nameTag: 'vocaDBApi',
        request: {
          url: `${APIHOSTS.vocadb}/api/songs/byPv`,
          qs: {
            pvService: 'NicoNicoDouga',
            pvId: options.video.id,
            fields: 'Albums,Artists,Lyrics,Pvs',
            lang: 'Japanese'
          }
        }
      });
    }

    function songleApi() {
      return fetchApi({
        nameTag: 'songleApi',
        request: {
          url: `${APIHOSTS.songle.widget}/api/v1/song/chorus.json`,
          qs: {
            url: `www.nicovideo.jp/watch/${options.video.id}`
          }
        }
      });
    }

    function videoApi() {
      return fetchApi({
        nameTag: 'videoApi',
        request: {
          url: `${APIHOSTS.niconico.gadget}/video/videos/${options.video.id}`
        }
      });
    }

    var sequence = [],
        watchData = null,
        audioData = null,
        vocaDBData = null,
        responseData = null;

    watchData = await fetchApi({
      agent: 'nicobox',
      sessionType: 'sp',
      account: options.account,
      request: {
        url: `${APIHOSTS.niconico.gadget}/v2.0/video/videos/${options.video.id}/play`,
        qs: {
          playModeCode: 'auto'
        }
      }
    });

    audioData = await fetchApi({
      account: options.account,
      request: {
        json: false,
        url: watchData.body.watchApiUrl
      }
    }).then(res => {
      if (res.statusCode === 200) {
        nicohistory:for (let c = 0; c < res.headers['set-cookie'].length; c++) {
          let cookies = res.headers['set-cookie'][c].split('; ');

          for (let i = 0; i < cookies.length; i++) {
            let cookie = cookies[i].split('=');

            if (cookie[0] === 'nicohistory') {
              ipcRenderer.send('setAccessToken', {
                history: cookie[1]
              });

              break nicohistory;
            }
          }
        }
      }

      return JSON.parse(res.body);
    });

    if (options.video.tags == undefined || options.video.tags.some(tag => tag.name === 'VOCALOID')) {
      sequence.push(vocaDBApi.bind());
    }

    if (options.mode) {
      for (let mode of options.mode) {
        switch (mode) {
          case 'chorus':
            sequence.push(songleApi.bind());
            break;

          case 'video':
            sequence.push(videoApi.bind());
            break;
        }
      }
    }

    responseData = await Promise.all(sequence.map(fetchFunction =>  fetchFunction()));

    for (let i = 0, res; res = responseData[i]; i++) {
      switch (res.nameTag) {
        case 'videoApi': {
          if (res.statusCode !== 200) continue;
          options.video = res.body;
          break;
        }

        case 'vocaDBApi': {
          if (res.statusCode !== 200) continue;
          vocaDBData = res.body;
          break;
        }

        case 'songleApi': {
          const statusMessage = {
            404: '楽曲情報が登録されていません。通常再生に移行します。',
            500: 'Songle API に接続できません。通常再生に移行します。'
          };

          if (res.statusCode !== 200) {
            if (!statusMessage[res.statusCode]) continue;

            dialog.showMessageBox({
              type: 'info',
              title: 'NicoTunes',
              message: statusMessage[res.statusCode],
              buttons: ['Ok']
            });
          } else {
            let firstChorus = ~~ (res.body.chorusSegments[0].repeats[0].start / 1000);
            audioData.data.audio_url += `#t=${firstChorus}`;
          }

          break;
        }
      }
    }

    // 履歴の更新
    var defaultTune,
        prevTune,
        nextTune;

    defaultTune = {
      id: options.video.id,
      last: Date.parse(new Date()),
      count: 1
    };

    prevTune = await IDB.get('tunes', options.video.id);

    nextTune = prevTune ? Object.assign({}, prevTune, defaultTune, {
      count: prevTune.count + 1
    }) : defaultTune;

    await IDB.add('tunes', nextTune);

    dispatch({
      type: GET.NICO.API.PLAY,
      data: {
        video: options.video,
        queue: options.videos || [ options.video ],
        audioUrl: audioData.data.audio_url,
        vocaDB: vocaDBData
      }
    });
  };
}
