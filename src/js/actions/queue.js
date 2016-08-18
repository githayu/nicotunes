
import { ACTION } from '../constants';

export const queueController = options => {
  var defaultRequest = {
    type: ACTION.QUEUE[options.type.toUpperCase()]
  };

  switch (options.type) {
    case 'add':
      return Object.assign(defaultRequest, {
        item: options.item,
        targetId: options.id || null
      });

    case 'move':
      return Object.assign(defaultRequest, {
        sourceId: options.sourceId,
        targetId: options.targetId
      });

    case 'clear':
      return Object.assign(defaultRequest, {
        item: options.item
      });

    case 'delete':
      return Object.assign(defaultRequest, {
        id: options.id
      });

    default:
      return defaultRequest;
  }
};
