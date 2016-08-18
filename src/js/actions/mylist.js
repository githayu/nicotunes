import IndexedDBController from '../utils/IndexedDBController';
import { ACTION, GET, APIHOSTS } from '../constants';
import { fetchApi } from './app';

const IDB = new IndexedDBController();

export function mylistsLookup(account, reload = false) {
  return async dispatch => {
    dispatch({ type: ACTION.LOAD.START });

    var mylists;

    mylists = await IDB.get('myLists', {
      method: 'index',
      keyPath: 'userId',
      keyValue: account.id
    });

    if (!mylists.length || reload) {

      // ユーザーのマイリスト一覧を取得
      let mylistList = await fetchApi({
        agent: 'nicobox',
        sessionType: 'sp',
        account,
        request: {
          url: `${APIHOSTS.niconico.gadget}/user/mylists`,
          qs: {
            userId: account.id
          }
        }
      });

      if (mylistList.statusCode === 200 && 1 < mylistList.body.length) {
        mylists = await Promise.all((() => {
          var result = [];

          for (let list of mylistList.body) {
            if (!list.id) continue;

            result.push(fetchApi({
              agent: 'nicobox',
              sessionType: 'sp',
              account,
              request: {
                url: `${APIHOSTS.niconico.gadget}/user/mylists/${list.id}`,
                qs: {
                  pageSize: 4
                }
              }
            }));
          }

          return result;
        })())

        .then(res => {
          var result = [];

          for (let i = 0; i < res.length; i++) {
            if (res[i].statusCode !== 200) continue;
            result.push(res[i].body);
          }

          return result;
        });

        await IDB.add('myLists', mylists);
      }
    }

    dispatch({
      type: GET.NICO.API.MYLIST.LIST,
      mylists,
      userId: account.id
    });
  };
}

export function getMylistVideos(options) {
  return async dispatch => {
    dispatch({ type: ACTION.LOAD.START });

    var fetchRequest = {
      url: `${APIHOSTS.niconico.gadget}/user/mylists/${options.request.id}`
    };

    if (options.request.query) fetchRequest.qs = options.request.query;

    var mylist = await fetchApi({
      agent: 'nicobox',
      sessionType: 'sp',
      account: options.account,
      request: fetchRequest
    });

    mylist.body.fetchAll = true;

    dispatch({
      type: GET.NICO.API.MYLIST.PAGE,
      mylist: mylist.body
    });
  };
}
