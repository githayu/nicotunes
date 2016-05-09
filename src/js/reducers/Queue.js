import { ACTION, GET } from '../constants';

const initialState = {
  items: [],
  active: false
};

const findIndex = (items, id) => {
  for (let i = 0; i < items.length; i++) {
    if (items[i].id == id) return i;
  }
  return false;
};

export default function queue(state = initialState, action) {
  switch (action.type) {

    case ACTION.ROUTER:
      return Object.assign({}, state, { active: false });

    case GET.NICO.API.PLAY:
      return action.data.queue.length ? Object.assign({}, state, { items: action.data.queue }) : state;

    // 再生キュー制御
    case ACTION.QUEUE.STATE: {
      return Object.assign({}, state, action.state);
    }

    // 再生キュー追加
    case ACTION.QUEUE.ADD: {
      let nextItems = state.items.length ? state.items.concat() : [];

      // 同じ曲があれば削除
      for (let i = 0; i < nextItems.length; i++) {
        if (nextItems[i].id == action.item.id) {
          nextItems.splice(i, 1);
          break;
        }
      }

      if (action.targetId) {
        let targetIndex = findIndex(nextItems, action.targetId);

        if (targetIndex !== false) {
          nextItems.splice(targetIndex + 1, 0, action.item);
        } else {
          nextItems.push(action.item);
        }
      } else {
        nextItems.push(action.item);
      }

      return Object.assign({}, state, {
        items: nextItems
      });
    }

    // 再生キュー削除
    case ACTION.QUEUE.DELETE: {
      let nextItems = state.items.concat();

      for (let i = 0; i < nextItems.length; i++) {
        if (nextItems[i].id == action.id) {
          nextItems.splice(i, 1);
          break;
        }
      }

      return Object.assign({}, state, {
        items: nextItems
      });
    }

    // 再生キュー移動
    case ACTION.QUEUE.MOVE: {
      let nextItems = state.items.concat(),
          sourceIndex = findIndex(nextItems, action.sourceId),
          targetIndex = findIndex(nextItems, action.targetId),
          sourceItem = nextItems.splice(sourceIndex, 1)[0];

      targetIndex += (sourceIndex <= targetIndex) ? 1 : 0;

      nextItems.splice(targetIndex, 0, sourceItem);

      return Object.assign({}, state, {
        items: nextItems
      });
    }

    // 再生キュー消去
    case ACTION.QUEUE.CLEAR: {
      let nextItems = action.item ? [ action.item ] : [];

      return Object.assign({}, state, {
        items: nextItems
      });
    }

    // 再生キューシャッフル
    case ACTION.QUEUE.SHUFFLE: {
      let nextItems = (items => {
        let n = items.length, t, i;

        while (n) {
          i = ~~ (Math.random() * n--);
          t = items[n];
          items[n] = items[i];
          items[i] = t;
        }

        return items;
      })(state.items.concat());

      return Object.assign({}, state, {
        items: nextItems
      });
    }

    default:
      return state;
  }
}
