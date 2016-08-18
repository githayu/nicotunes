import { ipcRenderer, dialog } from 'electron';
import IndexedDBController from '../utils/IndexedDBController';
import cheerio from 'cheerio';
import { ACTION, GET, APIHOSTS } from '../constants';
import { fetchApi } from './app';
import LocalStorageController from '../utils/LocalStorageController';

const appLocalStorage = new LocalStorageController('app');
const IDB = new IndexedDBController();

export const nicoAccountController = options => {
  var defaultRequest = {
    type: ACTION.NICOACCOUNT[options.type.toUpperCase()]
  };

  return Object.assign(defaultRequest, {
    account: options.account
  });
};

export function niconicoLogin(query) {
  return async dispatch => {
    dispatch({ type: ACTION.LOAD.START });

    var profile = {},
        login = {};

    login = await fetchApi({
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

      return ($('nicovideo_user_response').attr('status') == 'ok') ? {
        status: true,
        session_key: $('session_key').text(),
        expire: $('expire').text(),
        id: +$('user_id').text()
      } : {
        status: false,
        code: +$('code').text(),
        description: $('description').text()
      };
    });

    if (login.status) {
      // IndexedDB 追加
      await IDB.add('nicoAccounts', login);

      // アクティブアカウント変更
      appLocalStorage.update({ activeNicoAccountId: login.id });

      // 詳細なプロフィールを取得
      profile = await fetchApi({
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
    }

    dispatch({
      type: GET.NICO.LOGIN,
      account: Object.assign({}, profile.body, login)
    });
  };
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
                await setTimeout(() => {
                  fetchAccounts();
                }, 2000);
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
  };
}
