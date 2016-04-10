import Remote, { Menu, shell as Shell } from 'remote'
import React, { Component, PropTypes } from 'react'
import { DragDropContext, DropTarget, DragSource } from 'react-dnd'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import classNames from 'classnames'

import * as Actions from '../actions/app'
import Utils from '../utils/utils'
import PlayAnimation from './play-animation'

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

  endDrag(props, monitor) {
    props.dragAction(false);
  }
};

const itemTarget = {
  hover(props, monitor, component) {
    const draggedId = monitor.getItem().id;

    if (draggedId !== props.video.id) {
      props.sortAction(draggedId, props.video.id);
    }
  },

  drop(props, monitor, component) {
    const { id } = props.video;
    return { id };
  }
};

@DropTarget(
  props => Types.ITEM,
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
  props => Types.ITEM,
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
        })}>

        <figure
          className="queue-video-thumbnail"
          style={{ backgroundImage: `url(${thumbnailUrl})` }} >{ playAnimation }</figure>

        <h2 className="queue-video-title">{ video.title }</h2>

        <time className="queue-video-duration">{ Utils.FormatSeconds(video.lengthInSeconds) }</time>
      </li>
    ));
  }
};
