import remote, { dialog } from 'remote'

import cheerio from 'cheerio'
import Request from 'request'

import { ACTION, GET, REQ } from '../constants/action-types'
import IDBController from '../utils/indexeddb'
import LocalStorageController from '../utils/localstorage'

const IDB = new IDBController();
const appLocalStorage = new LocalStorageController('app');

export const Router = (location, details) => ({ type: ACTION.ROUTER, location, details });
export const NicoAccountChange = account => ({ type: ACTION.NICOACCOUNT.CHANGE, account });
export const NicoAccountDelete = account => ({ type: ACTION.NICOACCOUNT.DELETE, account });
export const QueueAdd = (item, targetId) => ({ type: ACTION.QUEUE.ADD, item, targetId });
export const QueueMove = (sourceId, targetId) => ({ type: ACTION.QUEUE.MOVE, sourceId, targetId });
export const QueueClear = item => ({ type: ACTION.QUEUE.CLEAR, item });
export const QueueDelete = id => ({ type: ACTION.QUEUE.DELETE, id });
export const QueueShuffle = () => ({ type: ACTION.QUEUE.SHUFFLE });
export const QueueState = state => ({ type: ACTION.QUEUE.STATE, state });
export const playState = state => ({ type: ACTION.PLAY.STATE, state });
export const RankingState = state => ({ type: ACTION.RANKING.STATE, state });
export const searchState = state => ({ type: ACTION.SEARCH.STATE, state });

const NICOAPIHOST = 'https://api.gadget.nicovideo.jp';

export function NiconicoLogin(req) {
  return (dispatch) => {
    dispatch({ type: ACTION.LOAD.START });

    (async () => {
      let profile = {};

      let [login, status] = await new Promise((resolve, reject) => {
        Request.post({
          url: 'https://account.nicovideo.jp/api/v1/login',
          qs: {
            site: 'nicobox_android'
          },
          form: req
        }, (err, req, res) => {
          let $ = cheerio.load(res);

          let [result, status] = ($('nicovideo_user_response').attr('status') == 'ok') ? [{
            session_key: $('session_key').text(),
            expire: $('expire').text(),
            id: +$('user_id').text()
          }, true] : [{
            status: false,
            code: +$('code').text(),
            description: $('description').text()
          }, false]

          console.info('Login', req);
          resolve([result, status]);
        });
      });

      // IndexedDB 追加
      if (status) await IDB.add('nicoAccounts', login);

      // アクティブアカウント変更
      if (status) appLocalStorage.update({ activeNicoAccountId: login.id });

      // 詳細なプロフィールを取得
      if (status) profile = await getNiconicUserProfile(login);

      let account = Object.assign({}, profile, login, {
        status: status,
      });

      dispatch({
        type: GET.NICO.LOGIN,
        account
      });
    })();
  }
}

function NiconicoApi(req) {
  return new Promise((resolve, reject) => {
    let defaultRequest = {
      method: 'get',
      json: true,
      headers: {
        'User-Agent': 'Niconico/1.0 (Linux; U; Android 6.0.1; ja_JP; nicobox_android Nexus 5X) Version/1.5.0'
      }
    };

    if (req.account) defaultRequest.headers.Cookie = `SP_SESSION_KEY=${req.account.session_key}`;
    if (req.request.headers) req.request.headers = Object.assign({}, defaultRequest.headers, req.request.headers);

    let fetchRequest = Object.assign({}, defaultRequest, req.request);

    Request(fetchRequest, (err, req, res) => {
      console.info('NicoAPI', req);
      resolve(res);
    });
  });
}

function getNiconicUserProfile(account) {
  return new Promise((resolve, reject) => {
    Request({
      method: 'get',
      uri: `${NICOAPIHOST}/user/profiles/${account.id}`,
      json: true,
      headers: {
        'Cookie': `SP_SESSION_KEY=${account.session_key}`,
        'User-Agent': 'Niconico/1.0 (Linux; U; Android 6.0.1; ja_JP; nicobox_android Nexus 5X) Version/1.5.0'
      }
    }, (err, req, res) => {
      console.info('UserProfile', req);
      resolve(res);
    });
  });
}

export function mylistsLookup(req, reload = false) {
  return dispatch => {
    dispatch({ type: ACTION.LOAD.START });

    (async () => {
      let mylists,
          mylistsDetail = [];

      mylists = await IDB.get('myLists', {
        method: 'index',
        keyPath: 'userId',
        keyValue: req.id
      });

      if (!mylists.length || reload) {

        // ユーザーのマイリスト一覧を取得
        let mylistList = await NiconicoApi({
          account: req,
          request: {
            uri: `${NICOAPIHOST}/user/mylists`,
            qs: {
              userId: req.id
            }
          }
        });

        // 少し詳細なマイリスト情報を取ってくる
        mylists = await Promise.all((() => {
          let result = [];

          for (let list of mylistList) {
            if (!list.id) continue;

            result.push(NiconicoApi({
              account: req,
              request: {
                uri: `${NICOAPIHOST}/user/mylists/${list.id}`,
                qs: {
                  pageSize: 4
                }
              }
            }));
          }

          return result;
        })());

        // IndexedDB へ書き込む
        await IDB.add('myLists', mylists);
      }

      dispatch({
        type: GET.NICO.API.MYLIST.LIST,
        mylists,
        userId: req.id
      });
    })();
  }
}

export function getMylistVideos(req) {
  return dispatch => {
    dispatch({ type: ACTION.LOAD.START });

    (async () => {
      let reqData = {
        uri: NICOAPIHOST +'/user/mylists/'+ req.request.id
      };

      if (req.request.query) reqData.qs = req.request.query;

      let mylist = await NiconicoApi({
        account: req.account,
        request: reqData
      });

      mylist.fetchAll = true;

      dispatch({
        type: GET.NICO.API.MYLIST.PAGE,
        mylist
      });
    })();
  }
}

export function getRanking(req) {
  return dispatch => {
    dispatch({ type: ACTION.LOAD.RANKING });

    let defaultRequest = {},

        fetchRequest = (() => {
          switch (req.category) {
            case 'nicobox':
              return Object.assign({}, defaultRequest, {
                uri: 'https://server2.nicobox.org/v2/get/trends',
                headers: null,
                qs: {
                  count: 'more'
                }
              });

            case 'surema':
              return Object.assign({}, defaultRequest, {
                uri: 'http://api.ce.nicovideo.jp/api/v1/step.video.ranking',
                headers: null,
                qs: {
                  __format: 'json',
                  type: 'daily'
                }
              });

            default:
              return Object.assign({}, defaultRequest, {
                uri: `${NICOAPIHOST}/video/videos/by_ranking`,
                qs: {
                  category: req.category,
                  span: req.span
                }
              });
          }
        })();

    (async () => {
      let ranking = await NiconicoApi({ request: fetchRequest }),
          category = { category: req.category },

          result = (() => {
            console.log(ranking);

            switch (req.category) {
              case 'nicobox':
                return Object.assign({}, category, {
                  items: ranking
                });

              case 'surema':
                return Object.assign({}, category, {
                  items: ranking.step_ranking_response.video_info
                });

              default:
                return Object.assign({}, category, ranking, {
                  span: req.span
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
      let response = await new Promise(resolve => {
        Request({
          method: 'get',
          uri: `http://api.search.nicovideo.jp/api/v2/${req.service}/contents/search`,
          json: true,
          qs: req.query,
          headers: {
            'User-Agent': 'NicoTunes dev'
          }
        }, (err, req, res) => {
          console.info('Search', req);
          resolve(res);
        });
      });

      dispatch({
        type: GET.NICO.API.SEARCH,
        data: response
      })
    })();
  }
}

export function niconicoSuggest(query) {
  return dispatch => {
    (async () => {
      let response = await new Promise(resolve => {
        Request({
          method: 'get',
          uri: `http://sug.search.nicovideo.jp/suggestion/complete/${encodeURIComponent(query)}`,
          json: true,
        }, (err, req, res) => {
          console.info('Suggest', req);
          resolve(res);
        });
      });

      dispatch({
        type: GET.NICO.API.SUGGEST,
        data: response.candidates || []
      });
    })();
  }
}

export function PlayMusic(req) {
  return dispatch => {
    dispatch({
      type: ACTION.PLAY.STATE,
      req: { loading: true }
    });

    (async () => {
      var video = req.video;

      let watchApi = await NiconicoApi({
        account: req.account,
        request: {
          uri: `${NICOAPIHOST}/v2.0/video/videos/${video.id}/play`,
          qs: {
            playModeCode: 'auto'
          }
        }
      });

      let audioApi = JSON.parse(await NiconicoApi({
        account: req.account,
        request: {
          uri: watchApi.watchApiUrl,
          json: false,
          headers: {
            'Cookie': `user_session=${req.account.session_key}`
          }
        }
      }));

      if (req.mode) {
        for (let mode of req.mode) {
          switch (mode) {
            case 'chorus': {
              await new Promise((resolve, reject) => {
                Request({
                  method: 'get',
                  uri: 'https://widget.songle.jp/api/v1/song/chorus.json',
                  qs: {
                    url: `www.nicovideo.jp/watch/${video.id}`
                  },
                  json: true
                }, (err, req, res) => {

                  console.log(req);

                  if (req.statusCode != 200) {
                    let code = {
                      404: '楽曲情報が登録されていません。通常再生に移行します。',
                      500: 'Songle API に接続できません。通常再生に移行します。'
                    };

                    dialog.showMessageBox({
                      type: 'info',
                      title: 'NicoTunes',
                      message: code[req.statusCode],
                      buttons: ['ok']
                    });

                  } else {
                    let firstChorus = ~~ (res.chorusSegments[0].repeats[0].start / 1000);
                    audioApi.data.audio_url += `#t=${firstChorus}`;
                  }

                  resolve();
                });
              });

              break;
            }

            case 'fetch': {
              video = await NiconicoApi({
                request: {
                  uri: `${NICOAPIHOST}/video/videos/${video.id}`
                }
              });

              break;
            }
          }
        }
      }

      // 履歴の更新
      let defaultTune = {
            id: video.id,
            last: Date.parse(new Date()),
            count: 1
          },

          prevTune = await IDB.get('tunes', video.id),

          nextTune = prevTune ? Object.assign({}, prevTune, defaultTune, {
            count: prevTune.count + 1
          }) : defaultTune;

      await IDB.add('tunes', nextTune);

      dispatch({
        type: GET.NICO.API.PLAY,
        data: {
          video,
          queue: req.videos || [ video ],
          audioUrl: audioApi.data.audio_url
        }
      });
    })();
  }
}

export function NiconicoAccount() {
  return dispatch => {
    dispatch({ type: ACTION.LOAD.START });

    (async () => {
      let accounts = [],
          status = false,
          accountAuthData = await IDB.get('nicoAccounts');

      if (accountAuthData.length) {
        for (let u of accountAuthData) {
          let user = await getNiconicUserProfile(u);

          accounts.push(Object.assign({}, {
            id: u.id,
            session_key: u.session_key,
            expire: u.expire
          }, user));
        }

        var defaultAccount = accounts.filter(u => u.id == appLocalStorage.get().activeNicoAccountId)[0];

        if (defaultAccount.code) {
          switch (defaultAccount.code) {
            case 'BUSY':
              await new Promise(resolve => setTimeout(() => resolve(), 1000));
              NiconicoAccount();
              return;
          }

          console.error(defaultAccount.code);
        } else {
          status = true;
        }
      }

      dispatch({
        type: GET.IDB.NICO_ACCOUNT,
        status,
        account: defaultAccount,
        accounts: accounts
      });
    })();
  }
}
