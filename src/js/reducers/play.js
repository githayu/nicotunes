import { ACTION, GET, REQ } from '../constants/action-types'

const initialState = {
  video: null,
  paused: true,
  active: false,
  audioUrl: null,
  info: null,
  loading: false,
  selectedTab: 'details',
  audio: new Audio()
};

export default function play(state = initialState, action) {
  switch (action.type) {

    // 再生
    case GET.NICO.API.PLAY: {
      return Object.assign({}, state, {
        audioUrl: action.data.audioUrl,
        getFlvUrl: action.data.getFlvUrl,
        getFlv: null,
        type: 'audio',
        video: action.data.video,
        info: action.data.info,
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
