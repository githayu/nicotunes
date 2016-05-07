import React, { Component } from 'react'
import classNames from 'classnames'
import Utils from '../utils/Utils'
import PlayAnimation from '../containers/PlayAnimation'

export default class VideoItem extends Component {
  render() {
    return (
      <li
        key={ this.props.video.id }
        onClick={this.props.onClick}
        onContextMenu={this.props.onContextMenu}
        className={classNames({
          active: this.props.active
        })} >
        { this.videoItemRender() }
      </li>
    );
  }

  videoItemRender() {
    return (
      <div>
        { this.videoThumbnailRender() }
        { this.videoInfoRender() }
      </div>
    );
  }

  videoThumbnailRender() {
    let thumbnailUrl = this.props.video.thumbnailLargeUrl ? this.props.video.thumbnailLargeUrl : this.props.video.thumbnailUrl,

    playAnimation = () => {
      if (this.props.active) return <PlayAnimation />
    },

    ranking = () => {
      if (this.props.ranking) return <span className="rank-count">{this.props.ranking}</span>
    };

    return (
      <figure
        className={classNames({
          'video-thumbnail': true,
          'small': !this.props.video.thumbnailLargeUrl,
          'large': this.props.video.thumbnailLargeUrl
        })}
        style={{ backgroundImage: `url(${thumbnailUrl})` }}
        data-video-duration={classNames({
          [Utils.FormatSeconds(this.props.video.lengthInSeconds)]: this.props.duration
        })}
        >
        { playAnimation() }
        { ranking() }
        </figure>
    );
  }

  videoInfoRender() {
    return (
      <div className="video-info">
        <h2 title={this.props.video.title}>{this.props.video.title}</h2>
        { this.videoCategoryRender() }
        { this.videoMetaRender() }
      </div>
    );
  }

  videoCategoryRender() {
    if (this.props.category) {
      return (
        <p className="video-category">{this.props.video.categoryTags}</p>
      );
    }
  }

  videoMetaRender() {
    if (this.props.meta) {
      let view = this.props.video.viewCount ? this.props.video.viewCount.toLocaleString() : String(),
          comment = this.props.video.thread ? this.props.video.thread.commentCount.toLocaleString() : String(),
          mylist = this.props.video.myListCount ? this.props.video.myListCount.toLocaleString() : String();

      return (
        <ul className="video-meta">
          <li className="view">{view}</li>
          <li className="comment">{comment}</li>
          <li className="mylist">{mylist}</li>
        </ul>
      );
    }
  }
};


VideoItem.defaultProps = {
  duration: true,
  meta: true,
  category: false
};
