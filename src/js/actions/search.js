import { ACTION, GET, APIHOSTS } from '../constants';
import { fetchApi } from './app';

export function niconicoSearch(req) {
  return async dispatch => {
    dispatch({
      type: ACTION.SEARCH.STATE,
      state: {
        loading: true,
        service: req.service,
        query: req.query
      }
    });

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
    });
  };
}

export function niconicoSuggest(query) {
  return async dispatch => {
    var response = await fetchApi({
      request: {
        url: `${APIHOSTS.niconico.suggest}/suggestion/complete/${encodeURIComponent(query)}`
      }
    });

    dispatch({
      type: GET.NICO.API.SUGGEST,
      data: response.body.candidates || []
    });
  };
}
