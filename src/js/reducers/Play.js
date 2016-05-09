import { ACTION, GET } from '../constants';

const initialState = {
  video: null,
  paused: true,
  active: false,
  audioUrl: null,
  vocaDB: null,
  loading: false,
  audio: new Audio(),
  selectedTab: 'details'
};

export default function play(state = initialState, action) {
  switch (action.type) {

    // 再生
    case GET.NICO.API.PLAY: {
      return Object.assign({}, state, {
        audioUrl: action.data.audioUrl,
        video: action.data.video,
        vocaDB: action.data.vocaDB,
        paused: false,
        active: true,
        loading: false
      });
    }

    case GET.NICO.API.GETFLV : {
      return Object.assign({}, state, {
        getFlv: action.getFlv,
        selectedTab: 'views',
        type: 'video'
      });
    }

    // 再生ステータス変更
    case ACTION.PLAY.STATE: {
      return Object.assign({}, state, action.state);
    }

    default:
      return state;
  }
}
