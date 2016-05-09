export const ACTION = {
  ROUTER: 'ACTION_ROUTER',

  NICOACCOUNT: {
    CHANGE: 'ACTION_NICOACCOUNT_CHANGE',
    DELETE: 'ACTION_NICOACCOUNT_DELETE'
  },

  QUEUE: {
    ADD: 'ACTION_QUEUE_ADD',
    MOVE: 'ACTION_QUEUE_MOVE',
    CLEAR: 'ACTION_QUEUE_CLEAR',
    DELETE: 'ACTION_QUEUE_DELETE',
    STATE: 'ACTION_QUEUE_STATE',
    SHUFFLE: 'ACTION_QUEUE_SHUFFLE'
  },

  PLAY: {
    STATE: 'ACTION_PLAY_STATE',
    END: 'ACTION_PLAY_END'
  },

  RANKING: {
    STATE: 'ACTION_RANKING_STATE'
  },

  SEARCH: {
    STATE: 'ACTION_SEARCH_STATE'
  },

  LOAD: {
    START: 'ACTION_LOAD_START',
    RANKING: 'ACTION_LOAD_RANKING',
    SEARCH: 'ACTION_LOAD_SEARCH'
  }
};

export const GET = {
  NICO: {
    LOGIN: 'GET_NICO_LOGIN',

    API: {
      MYLIST: {
        PAGE: 'GET_NICO_API_MYLIST_PAGE',
        LIST: 'GET_NICO_API_MYLIST_LIST'
      },

      RANKING: 'GET_NICO_API_RANKING',
      SEARCH: 'GET_NICO_API_SEARCH',
      SUGGEST: 'GET_NICO_API_SUGGEST',
      PLAY: 'GET_NICO_API_PLAY',
      GETFLV: 'GET_NICO_API_GETFLV'
    }
  },

  IDB: {
    NICO_ACCOUNT: 'GET_IDB_NICO_ACCOUNT'
  }
};

export const APIHOSTS = {
  niconico: {
    account: 'https://account.nicovideo.jp',
    gadget: 'https://api.gadget.nicovideo.jp',
    ce: 'http://api.ce.nicovideo.jp',
    search: 'http://api.search.nicovideo.jp',
    suggest: 'http://sug.search.nicovideo.jp'
  },

  songle: {
    widget: 'https://widget.songle.jp'
  },

  nicobox: {
    server2: 'https://server2.nicobox.org'
  },

  vocadb: 'http://vocadb.net'
};
