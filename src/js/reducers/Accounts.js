import { ACTION, GET, REQ } from '../constants'
import IndexedDBController from '../utils/IndexedDBController'
import LocalStorageController from '../utils/LocalStorageController'
import electron, { ipcRenderer } from 'electron'

const IDB = new IndexedDBController()
const appLocalStorage = new LocalStorageController('app');
const initialState = {
  niconico: {
    items: null,
    selected: null
  },
  nicofinder: null
};

export default function accounts(state = initialState, action) {
  switch (action.type) {

    // ニコニコログイン
    case GET.NICO.LOGIN: {
      let nextState = {};

      if (action.account.status) {
        nextState = Object.assign({}, state.niconico, {
          items: Array.isArray(state.niconico.items) ? state.niconico.items.concat(action.account) : [ action.account ],
          selected: action.account
        });
      }

      return Object.assign({}, state, {
        niconico: Object.assign({}, state.niconico, nextState)
      });
    }

    case GET.IDB.NICO_ACCOUNT: {
      return Object.assign({}, state, {
        niconico: Object.assign({}, state.niconico, {
          items: action.accounts,
          selected: action.account
        })
      });
    }

    // デフォルトニコニコアカウント変更
    case ACTION.NICOACCOUNT.CHANGE: {
      appLocalStorage.update({
        activeNicoAccountId: action.account.id
      });

      ipcRenderer.send('setAccessToken', {
        session: action.account.session_key
      });

      return Object.assign({}, state, {
        niconico: Object.assign({}, state.niconico, {
          selected: action.account
        })
      });
    }

    // ニコニコアカウント削除
    case ACTION.NICOACCOUNT.DELETE: {
      IDB.delete('nicoAccounts', action.account.id);

      let accounts = state.niconico.items.concat();

      for (let i = 0; i < state.niconico.items.length; i++) {
        if (state.niconico.items[i].id == action.account.id) {
          accounts.splice(i, 1);
          break;
        }
      }

      return Object.assign({}, state, {
        niconico: Object.assign({}, state.niconico, {
          items: accounts
        })
      });
    }

    default:
      return state;
  }
}
