import electron, { ipcRenderer } from 'electron'
import remote, { dialog, session } from 'remote'
import cheerio from 'cheerio'
import request from 'request'
import { ACTION, GET, APIHOSTS } from '../constants'
import IndexedDBController from '../utils/IndexedDBController'
import LocalStorageController from '../utils/LocalStorageController'
import Utils from '../utils/Utils'

const IDB = new IndexedDBController()
const appLocalStorage = new LocalStorageController('app')
export const Router = (location, details) => ({ type: ACTION.ROUTER, location, details });

export const nicoAccountController = options => {
  var defaultRequest = {
    type: ACTION.NICOACCOUNT[options.type.toUpperCase()]
  };

  return Object.assign(defaultRequest, {
    account: options.account
  });
}

export const queueController = options => {
  var defaultRequest = {
    type: ACTION.QUEUE[options.type.toUpperCase()]
  };

  switch (options.type) {
    case 'add':
      return Object.assign(defaultRequest, {
        item: options.item,
        targetId: options.id || null
      });

    case 'move':
      return Object.assign(defaultRequest, {
        sourceId: options.sourceId,
        targetId: options.targetId
      });

    case 'clear':
      return Object.assign(defaultRequest, {
        item: options.item
      });

    case 'delete':
      return Object.assign(defaultRequest, {
        id: options.id
      });

    default:
      return defaultRequest;
  }
}

export const stateChanger = (storeName, state) => {
  return {
    type: ACTION[storeName.toUpperCase()].STATE,
    state
  }
}

export function niconicoLogin(query) {
  return (dispatch) => {
    dispatch({ type: ACTION.LOAD.START });

    (async () => {
      var profile = {},

      [login, status] = await fetchApi({
        agent: 'nicobox',
        request: {
          method: 'post',
          url: `${APIHOSTS.niconico.account}/api/v1/login`,
          form: query,
          qs: {
            site: 'nicobox_android'
          }
        }
      })

      .then(res => {
        var $ = cheerio.load(res.body);

        return ($('nicovideo_user_response').attr('status') == 'ok') ? [{
          session_key: $('session_key').text(),
          expire: $('expire').text(),
          id: +$('user_id').text()
        }, true] : [{
          code: +$('code').text(),
          description: $('description').text()
        }, false];
      });

      // IndexedDB 追加
      if (status) await IDB.add('nicoAccounts', login);

      // アクティブアカウント変更
      if (status) appLocalStorage.update({ activeNicoAccountId: login.id });

      // 詳細なプロフィールを取得
      if (status) profile = await fetchApi({
        agent: 'nicobox',
        sessionType: 'sp',
        account: login,
        request: {
          url: `${APIHOSTS.niconico.gadget}/user/profiles/${login.id}`
        }
      });

      ipcRenderer.send('setAccessToken', {
        session: login.session_key
      });

      dispatch({
        type: GET.NICO.LOGIN,
        account: Object.assign({}, profile.body, login, { status })
      });
    })();
  }
}

function fetchApi(options) {
  return new Promise((resolve, reject) => {
    var fetchRequest = {
      json: true
    },

    fetchHeaders = options.request.headers || {};

    switch (options.agent) {
      case 'nicotunes':
        fetchHeaders['user-agent'] = 'NicoTunes';
        break;
      case 'nicobox':
        fetchHeaders['user-agent'] = 'Niconico/1.0 (Linux; U; Android 6.0.1; ja_JP; nicobox_android Nexus 5X) Version/1.5.0';
        break;
    }

    if (options.account) {
      let sessionKeyName = options.sessionType === 'sp' ? 'SP_SESSION_KEY' : 'user_session';
      fetchHeaders.cookie = `${sessionKeyName}=${options.account.session_key}`;
    }

    fetchRequest = Object.assign(fetchRequest, options.request, {
      headers: fetchHeaders
    });

    request(fetchRequest, (err, res) => {
      if (res.statusCode !== 200) reject(res);
      if ('nameTag' in options) res.nameTag = options.nameTag;
      resolve(res);
    });
  });
}

export function mylistsLookup(req, reload = false) {
  return dispatch => {
    dispatch({ type: ACTION.LOAD.START });

    (async () => {
      var mylists,
          mylistsDetail = [];

      mylists = await IDB.get('myLists', {
        method: 'index',
        keyPath: 'userId',
        keyValue: req.id
      });

      if (!mylists.length || reload) {

        // ユーザーのマイリスト一覧を取得
        let mylistList = await fetchApi({
          agent: 'nicobox',
          sessionType: 'sp',
          account: req,
          request: {
            url: `${APIHOSTS.niconico.gadget}/user/mylists`,
            qs: {
              userId: req.id
            }
          }
        });

        if (mylistList.statusCode === 200 && 1 < mylistList.body.length) {
          mylists = await Promise.all((() => {
            var result = [];

            for (let list of mylistList.body) {
              if (!list.id) continue;

              result.push(fetchApi({
                account: req,
                request: {
                  url: `${APIHOSTS.niconico.gadget}/user/mylists/${list.id}`,
                  qs: {
                    pageSize: 4
                  }
                }
              }));
            }

            return result;
          })());

          await IDB.add('myLists', mylists.body);
        }
      }

      dispatch({
        type: GET.NICO.API.MYLIST.LIST,
        mylists,
        userId: req.id
      });
    })();
  }
}

export function getMylistVideos(options) {
  return dispatch => {
    dispatch({ type: ACTION.LOAD.START });

    (async () => {
      var fetchRequest = {
        url: `${APIHOSTS.niconico.gadget}/user/mylists/${options.request.id}`
      };

      if (options.request.query) fetchRequest.qs = options.request.query;

      var mylist = await fetchApi({
        agent: 'nicobox',
        sessionType: 'sp',
        account: options.account,
        request: fetchRequest
      });

      mylist.body.fetchAll = true;

      dispatch({
        type: GET.NICO.API.MYLIST.PAGE,
        mylist: mylist.body
      });
    })();
  }
}

export function getRanking(options) {
  return dispatch => {
    dispatch({ type: ACTION.LOAD.RANKING });

    var fetchRequest = (() => {
      switch (options.category) {
        case 'nicobox': return {
            request: {
            url: `${APIHOSTS.nicobox.server2}/v2/get/trends`,
            qs: {
              count: 'more'
            }
          }
        }

        case 'surema': return {
          request: {
            url: `${APIHOSTS.niconico.ce}/api/v1/step.video.ranking`,
            qs: {
              __format: 'json',
              type: 'daily'
            }
          }
        }

        default: return {
          agent: 'nicobox',
          request: {
            url: `${APIHOSTS.niconico.gadget}/video/videos/by_ranking`,
            qs: {
              category: options.category,
              span: options.span
            }
          }
        }
      }
    })();

    (async () => {
      var result = {},
          ranking = await fetchApi(fetchRequest),
          category = { category: options.category };

      result = (() => {
        switch (options.category) {
          case 'nicobox':
            return Object.assign({}, category, {
              items: ranking.body
            });

          case 'surema':
            return Object.assign({}, category, {
              items: ranking.body.step_ranking_response.video_info
            });

          default:
            return Object.assign({}, category, ranking.body, {
              span: options.span
            });
        }
      })();

      dispatch(Object.assign({}, result, {
        type: GET.NICO.API.RANKING
      }));
    })();
  }
}

export function niconicoSearch(req) {
  return dispatch => {
    dispatch({
      type: ACTION.SEARCH.STATE,
      state: {
        loading: true,
        service: req.service,
        query: req.query
      }
    });

    (async () => {
      let response = await fetchApi({
        agent: 'nicotunes',
        request: {
          url: `${APIHOSTS.niconico.search}/api/v2/${req.service}/contents/search`,
          qs: req.query
        }
      });

      dispatch({
        type: GET.NICO.API.SEARCH,
        data: response.body
      })
    })();
  }
}

export function niconicoSuggest(query) {
  return dispatch => {
    (async () => {
      var response = await fetchApi({
        request: {
          url: `${APIHOSTS.niconico.suggest}/suggestion/complete/${encodeURIComponent(query)}`
        }
      });

      dispatch({
        type: GET.NICO.API.SUGGEST,
        data: response.body.candidates || []
      });
    })();
  }
}

export function playMusic(options) {
  return dispatch => {
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
          url: '${APIHOSTS.songle.widget}/api/v1/song/chorus.json',
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

    (async () => {
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
      });

      if (audioData.statusCode === 200) {
        nicohistory:for (let c = 0; c < audioData.headers['set-cookie'].length; c++) {
          let cookies = audioData.headers['set-cookie'][c].split('; ');

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

      if (options.video.tags == undefined || options.video.tags.some(tag => tag.name === 'VOCALOID')) {
        sequence.push(vocaDBApi.bind());
      }

      if (options.mode) {
        for (let mode of options.mode) {
          switch (mode) {
            case 'chorus':
              sequence.push(chorusApi.bind());
              break;

            case 'video':
              sequence.push(videoApi.bind());
              break;
          }
        }
      }

      responseData = await Promise.all(sequence.map(fetchFunction =>  fetchFunction()));

      for (let i = 0, res; res = responseData[i]; i++) {
        switch (responseData[i].nameTag) {
          case 'videoApi':
            if (res.statusCode !== 200) continue;
            options.video = res.body;
            break;

          case 'vocaDBApi':
            if (res.statusCode !== 200) continue;
            vocaDBData = res.body;
            break;

          case 'songleApi':
            const statusMessage = {
              404: '楽曲情報が登録されていません。通常再生に移行します。',
              500: 'Songle API に接続できません。通常再生に移行します。'
            }

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
              audioData.body.data.audio_url += `#t=${firstChorus}`;
            }

            break;
        }
      }

      // 履歴の更新
      var defaultTune = {
        id: options.video.id,
        last: Date.parse(new Date()),
        count: 1
      },

      prevTune = await IDB.get('tunes', options.video.id),

      nextTune = prevTune ? Object.assign({}, prevTune, defaultTune, {
        count: prevTune.count + 1
      }) : defaultTune;

      await IDB.add('tunes', nextTune);

      dispatch({
        type: GET.NICO.API.PLAY,
        data: {
          video: options.video,
          queue: options.videos || [ options.video ],
          audioUrl: JSON.parse(audioData.body).data.audio_url,
          vocaDB: vocaDBData
        }
      });
    })();
  }
}

export function niconicoAccount() {
  return dispatch => {
    dispatch({ type: ACTION.LOAD.START });

    var accessStop = 5,
        accessCounter = 0;

    async function fetchAccounts() {
      var accounts = [],
          defaultAccount = {},
          status = false,
          accountAuthData = await IDB.get('nicoAccounts');

      if (accountAuthData.length) {
        for (let account of accountAuthData) {
          let accountProfile = await fetchApi({
            agent: 'nicobox',
            sessionType: 'sp',
            account,
            request: {
              url: `${APIHOSTS.niconico.gadget}/user/profiles/${account.id}`
            }
          });

          accounts.push(Object.assign({}, {
            id: account.id,
            session_key: account.session_key,
            expire: account.expire
          }, accountProfile.body));
        }

        defaultAccount = accounts.filter(a => a.id == appLocalStorage.get().activeNicoAccountId)[0];

        if (defaultAccount.code) {
          switch (defaultAccount.code) {
            case 'BUSY':
              if (accessStop <= ++accessCounter) {
                status = false;

                dialog.showMessageBox({
                  type: 'info',
                  buttons: ['😢'],
                  message: 'ログイン情報の取得に失敗しました。',
                  detail: `試行回数: ${accessCounter}回`
                });
              } else {
                await new Promise(resolve => setTimeout(() => {
                  fetchAccounts();
                }, 2000));
              }
          }
        } else {
          status = true;

          ipcRenderer.send('setAccessToken', {
            session: defaultAccount.session_key
          });
        }
      }

      dispatch({
        type: GET.IDB.NICO_ACCOUNT,
        status,
        account: defaultAccount,
        accounts: accounts
      });
    }

    fetchAccounts();
  }
}
