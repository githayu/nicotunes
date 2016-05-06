import { ACTION, GET, REQ } from '../constants/action-types'

const initialState = {
  items: [],
  meta: null,
  service: 'video',
  loading: false,
  suggest: [],
  query: {
    q: '',
    targets: ['title', 'description', 'tags'].join(),
    fields: ['contentId', 'title', 'description', 'tags', 'categoryTags', 'viewCounter', 'mylistCounter', 'commentCounter', 'startTime', 'thumbnailUrl', 'lengthSeconds', 'channelId', 'mainCommunityId', 'lastResBody', 'lastCommentTime', 'threadId'].join(),
    filters: {},
    _sort: '-viewCounter',
    _offset: 0,
    _limit: 100
  }
};

export default function search(state = initialState, action) {
  switch (action.type) {

    case ACTION.SEARCH.STATE: {
      return Object.assign({}, state, action.state);
    }

    case GET.NICO.API.SEARCH: {
      let nextItems = action.data.data.map(e => {
        return {
          id: e.contentId,
          thumbnailUrl: e.thumbnailUrl,
          defaultThreadId: e.threadId,
          lengthInSeconds: e.lengthSeconds,
          viewCount: e.viewCounter,
          myListCount: e.mylistCounter,
          thread: {
            commentCount: e.commentCounter,
            summary: e.lastResBody,
            updateTime: e.lastCommentTime
          },
          firstRetrieve: e.startTime,
          title: e.title,
          description: e.description,
          tags: e.tags.split(' ').map(tag => ({ name: tag })),
          categoryTags: e.categoryTags,
          channelId: e.channelId,
          mainCommunityId: e.mainCommunityId
        }
      });

      return Object.assign({}, state, {
        items: nextItems,
        meta: action.data.meta,
        loading: false
      });
    }

    case GET.NICO.API.SUGGEST: {
      return Object.assign({}, state, {
        suggest: action.data
      });
    }

    default:
      return state;
  }
}
