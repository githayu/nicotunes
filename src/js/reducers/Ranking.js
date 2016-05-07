import { ACTION, GET, REQ } from '../constants'

const initialState = {
  items: null,
  category: 'nicobox',
  span: 'daily',
  loading: false
};

export default function ranking(state = initialState, action) {
  switch (action.type) {

    case ACTION.LOAD.RANKING:
      return Object.assign({}, state, {
        loading: true
      });

    case ACTION.RANKING.STATUS: {
      return Object.assign({}, state, {
        [action.key]: action.value
      });
    }

    case GET.NICO.API.RANKING: {
      return Object.assign({}, state, {
        items: action.items,
        category: action.category,
        span: action.span || initialState.span,
        loading: false
      });
    }

    default:
      return state;
  }
}
