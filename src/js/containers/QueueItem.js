import React, { Component } from 'react';
import { DropTarget, DragSource } from 'react-dnd';
import classNames from 'classnames';
import Utils from '../utils/Utils';
import PlayAnimation from './PlayAnimation';

const Types = {
  ITEM: 'item'
};

const itemSource = {
  beginDrag(props) {
    const { id } = props.video;
    props.dragAction(true);
    return { id };
  },

  isDragging(props, monitor) {
    return monitor.getItem().id === props.video.id;
  },

  endDrag(props) {
    props.dragAction(false);
  }
};

const itemTarget = {
  hover(props, monitor) {
    const draggedId = monitor.getItem().id;

    if (draggedId !== props.video.id) {
      props.sortAction({
        type: 'move',
        sourceId: draggedId,
        targetId: props.video.id
      });
    }
  },

  drop(props) {
    const { id } = props.video;
    return { id };
  }
};

@DropTarget(
  Types.ITEM,
  itemTarget,
  (connect, monitor) => ({
    connectDropTarget: connect.dropTarget(),
    isOver: monitor.isOver(),
    isOverCurrent: monitor.isOver({ shallow: true }),
    canDrop: monitor.canDrop(),
    itemType: monitor.getItemType()
  })
)

@DragSource(
  Types.ITEM,
  itemSource,
  (connect, monitor) => ({
    connectDragSource: connect.dragSource(),
    isDragging: monitor.isDragging()
  })
)

export default class QueueItem extends Component {
  render() {
    const {
      connectDragSource,
      connectDropTarget,
      onContextMenu,
      onClick,
      active,
      video
    } = this.props;

    let thumbnailUrl = video.thumbnailLargeUrl ? video.thumbnailLargeUrl : video.thumbnailUrl,
        playAnimation = active ? <PlayAnimation /> : String();

    return connectDragSource(connectDropTarget(
      <li
        key={video.id}
        onContextMenu={onContextMenu}
        onClick={onClick}
        className={classNames({
          active: active,
          dragging: this.props.isDragging
        })}
      >
        <figure
          className="queue-video-thumbnail"
          style={{ backgroundImage: `url(${thumbnailUrl})` }}
        >{ playAnimation }</figure>
        <h2 className="queue-video-title">{ video.title }</h2>
        <time className="queue-video-duration">{ Utils.FormatSeconds(video.lengthInSeconds) }</time>
      </li>
    ));
  }
}
