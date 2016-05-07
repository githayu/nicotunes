import { ACTION, GET, REQ } from '../constants'

const initialState = {
  location: 'initialize',
  loading: false
};

export default function app(state = initialState, action) {
  switch (action.type) {

    // ローディング開始
    case ACTION.LOAD.START: {
      return Object.assign({}, state, { loading: true });
    }

    // ローディング終了
    case GET.NICO.API.RANKING:
    case GET.NICO.API.MYLIST.LIST: {
      return Object.assign({}, state, { loading: false });
    }

    case GET.NICO.API.MYLIST.PAGE: {
      return Object.assign({}, state, {
        location: 'mylist',
        loading: false
      });
    }

    case GET.NICO.LOGIN: {
      return Object.assign({}, state, {
        location: 'mylists',
        loading: false
      });
    }

    // アカウント取得
    case GET.IDB.NICO_ACCOUNT: {
      return Object.assign({}, state, action.res, {
        location: (action.status == true) ? 'mylists' : 'login',
        loading: false
      });
    }

    // ページャー
    case ACTION.ROUTER: {
      return Object.assign({}, state, {
        location: action.location
      });
    }



    default:
      return state;
  }
}
