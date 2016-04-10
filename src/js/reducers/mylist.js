import { ACTION, GET, REQ } from '../constants/action-types'

const initialState = {
  items: null,
  selected: null,
  loading: false,
  userId: null
};

export default function mylist(state = initialState, action) {
  switch (action.type) {

    case ACTION.ROUTER:
      return Object.assign({}, state, {
        selected: action.details.mylist
      });

    // マイリスト取得
    case GET.NICO.API.MYLIST.PAGE: {
      let index = (() => {
        for (let i = 0; i < state.items.length; i++) {
          if (state.items[i].id == action.mylist.id) return i;
        }
      })();

      state.items[index] = Object.assign({}, state.items[index], action.mylist);

      return Object.assign({}, state, {
        selected: action.mylist
      });
    }

    // マイリストリスト取得
    case GET.NICO.API.MYLIST.LIST: {
      return Object.assign({}, state, {
        items: action.mylists,
        userId: action.userId
      });
    }

    default:
      return state;
  }
}
