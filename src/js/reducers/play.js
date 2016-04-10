import { ACTION, GET, REQ } from '../constants/action-types'

const initialState = {
  video: null,
  paused: true,
  active: false,
  audioUrl: null,
  loading: false
};

export default function play(state = initialState, action) {
  switch (action.type) {

    // 再生
    case GET.NICO.API.PLAY: {
      return Object.assign({}, state, {
        audioUrl: action.data.audioUrl,
        video: action.data.video,
        paused: false,
        active: true,
        loading: false
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
