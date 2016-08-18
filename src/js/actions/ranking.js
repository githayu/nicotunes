
import { ACTION, GET, APIHOSTS } from '../constants';
import { fetchApi } from './app';

export function getRanking(options) {
  return async dispatch => {
    dispatch({ type: ACTION.LOAD.RANKING });

    var fetchRequest = (() => {
      switch (options.category) {
        case 'nicobox':
          return {
            request: {
              url: `${APIHOSTS.nicobox.server2}/v2/get/trends`,
              qs: {
                count: 'more'
              }
            }
          };

        case 'surema':
          return {
            request: {
              url: `${APIHOSTS.niconico.ce}/api/v1/step.video.ranking`,
              qs: {
                __format: 'json',
                type: 'daily'
              }
            }
          };

        default: return {
          agent: 'nicobox',
          request: {
            url: `${APIHOSTS.niconico.gadget}/video/videos/by_ranking`,
            qs: {
              category: options.category,
              span: options.span
            }
          }
        };
      }
    })();

    var result = {},
        ranking = await fetchApi(fetchRequest),
        category = { category: options.category };

    result = (() => {
      switch (options.category) {
        case 'nicobox':
          return Object.assign({}, category, {
            items: ranking.body
          });

        case 'surema':
          return Object.assign({}, category, {
            items: ranking.body.step_ranking_response.video_info
          });

        default:
          return Object.assign({}, category, ranking.body, {
            span: options.span
          });
      }
    })();

    dispatch(Object.assign({}, result, {
      type: GET.NICO.API.RANKING
    }));
  };
}
