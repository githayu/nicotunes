import React, { Component } from 'react';
import classNames from 'classnames';
import Utils from '../utils/Utils';
import PlayAnimation from '../containers/PlayAnimation';

export default class VideoItem extends Component {
  videoCategoryRender() {
    if (this.props.category) {
      return (
        <p
          key="video-category"
          className="video-category"
        >{this.props.video.categoryTags}</p>
      );
    }
  }

  videoInfoRender() {
    return (
      <div
        key="video-info"
        className="video-info"
      >
        <h2 title={this.props.video.title}>{this.props.video.title}</h2>
        {[ this.videoCategoryRender(), this.videoMetaRender() ]}
      </div>
    );
  }

  videoItemRender() {
    return (
      <div>{[ this.videoThumbnailRender(), this.videoInfoRender() ]}</div>
    );
  }

  videoMetaRender() {
    if (this.props.meta) {
      let view = this.props.video.viewCount ? this.props.video.viewCount.toLocaleString() : String(),
          comment = this.props.video.thread ? this.props.video.thread.commentCount.toLocaleString() : String(),
          mylist = this.props.video.myListCount ? this.props.video.myListCount.toLocaleString() : String();

      return (
        <ul
          key="video-meta"
          className="video-meta"
        >
          <li className="view">{view}</li>
          <li className="comment">{comment}</li>
          <li className="mylist">{mylist}</li>
        </ul>
      );
    }
  }

  videoThumbnailRender() {
    var thumbnailUrl = this.props.video.thumbnailLargeUrl ? this.props.video.thumbnailLargeUrl : this.props.video.thumbnailUrl,
        playAnimation = this.props.active ? <PlayAnimation key="playAnimation" /> : [],
        ranking = this.props.ranking ? (
          <span
            className="rank-count"
            key="rank-count"
          >{this.props.ranking}</span>
        ) : [];

    return (
      <figure
        key="video-thumbnail"
        className={classNames({
          'video-thumbnail': true,
          'small': !this.props.video.thumbnailLargeUrl,
          'large': this.props.video.thumbnailLargeUrl
        })}
        style={{ backgroundImage: `url(${thumbnailUrl})` }}
        data-video-duration={classNames({
          [Utils.FormatSeconds(this.props.video.lengthInSeconds)]: this.props.duration
        })}
      >{[ playAnimation, ranking ]}</figure>
    );
  }

  render() {
    return (
      <li
        key={ this.props.video.id }
        onClick={this.props.onClick}
        onContextMenu={this.props.onContextMenu}
        className={classNames({
          active: this.props.active
        })}
      >{ this.videoItemRender() }</li>
    );
  }
}

VideoItem.defaultProps = {
  duration: true,
  meta: true,
  category: false
};
