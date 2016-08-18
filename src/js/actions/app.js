import request from 'request';
import { ACTION } from '../constants';

export const Router = (location, details) => ({ type: ACTION.ROUTER, location, details });

export const stateChanger = (storeName, state) => {
  return {
    type: ACTION[storeName.toUpperCase()].STATE,
    state
  };
};

export function fetchApi(options) {
  return new Promise(resolve => {
    var fetchRequest = { json: true },
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
      if (res.statusCode !== 200) console.error(res);
      if ('nameTag' in options) res.nameTag = options.nameTag;
      resolve(res);
    });
  });
}
