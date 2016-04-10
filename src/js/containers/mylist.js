import Remote, { Menu } from 'remote'
import React, { Component } from 'react'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import classNames from 'classnames'
import { FloatingActionButton } from 'material-ui'

import * as Actions from '../actions/app'
import VideoItem from '../components/video-item'
import CreateContextMeun from '../utils/context-menu'

export default class MyList extends Component {
  render() {
    if (!this.props.mylist.selected) {
      return <div className="mylist-container" />
    } else if (!this.props.mylist.selected.myListEntries.items.length) {
      return <div className="mylist-container">動画がありません</div>
    }

    return (
      <div className="mylist-container">
        <figure className="mylist-introduction">{this.introductionCreator()}</figure>

        <div className="mylist-content">
          <header className="mylist-header">
            <div className="mylist-info">
              <h2>{this.props.mylist.selected.name}</h2>
              <span className="music-count">
                {`${this.props.mylist.selected.myListEntries.items.length}曲`}
              </span>
            </div>

            <div className="mylist-play-button">
              <FloatingActionButton
                backgroundColor="#0288d1"
                iconClassName="icon"
                onClick={
                  this.play.bind(this, this.props.mylist.selected.myListEntries.items[0].video)
                } >
              </FloatingActionButton>
            </div>
          </header>

          <div className="mylist-action">
            <select
              className="mylist-sort"
              defaultValue={this.props.mylist.selected.sortType.code}
              onChange={this.sortOrderChange.bind(this)} >
              {
                this.props.sortOrder.map(o => {
                  return <option key={o.code} label={o.label} value={o.code} />
                })
              }
            </select>
          </div>

          <ul className="video-list" ref="videoList">
            {
              this.props.mylist.selected.myListEntries.items.map(video => {
                return (
                  <VideoItem
                    onClick={this.play.bind(this, video.video)}
                    onContextMenu={this.contextMeun.bind(this, video.video)}
                    video={video.video}
                    active={this.props.play.active && video.video.id == this.props.play.video.id}
                    key={video.video.id} />
                );
              })
            }
          </ul>
        </div>
      </div>
    );
  }

  play(video) {
    this.props.PlayMusic({
      account: this.props.accounts.niconico.selected,
      video,
      videos: this.props.mylist.selected.myListEntries.items.map(video => video.video)
    });
  }

  introductionCreator() {
    let result = [];

    for (let i = 0; i < 9; i++) {
      let video = this.props.mylist.selected.myListEntries.items[i],
          thumbnailUrl = video.video.thumbnailLargeUrl ? video.video.thumbnailLargeUrl : video.video.thumbnailUrl;

      result.push(
        <div key={video.id}
             style={{ backgroundImage: `url(${thumbnailUrl})` }} />
      );
    }

    return result;
  }

  contextMeun(video) {
    let menu = new CreateContextMeun(this, [
      'play',
      'playChorus',
      'nextPlay',
      'queueAdd',
      'separator',
      'videoDetail',
      'separator',
      'niconico',
      'nicofinder'
    ], video);

    Menu.buildFromTemplate(menu).popup(Remote.getCurrentWindow());
  }

  sortOrderChange(e) {
    this.props.getMylistVideos({
      account: this.props.accounts.niconico.selected,
      request: {
        id: this.props.mylist.selected.id,
        query: {
          sortOrderTypeCode: e.target.value
        }
      }
    });
  }
}

MyList.defaultProps = {
  sortOrder: [
    { label: '登録が新しい順', code: 1 },
    { label: '登録が古い順', code: 0 },
    { label: 'タイトル昇順', code: 4 },
    { label: 'タイトル降順', code: 5 },
    { label: 'マイリストコメント昇順', code: 2 },
    { label: 'マイリストコメント降順', code: 3 },
    { label: '投稿が新しい順', code: 6 },
    { label: '投稿が古い順', code: 7 },
    { label: '再生が多い順', code: 8 },
    { label: '再生が少ない順', code: 9 },
    { label: 'コメントが新しい順', code: 10 },
    { label: 'コメントが古い順', code: 11 },
    { label: 'コメントが多い順', code: 12 },
    { label: 'コメントが少ない順', code: 13 },
    { label: 'マイリスト登録が多い順', code: 14 },
    { label: 'マイリスト登録が少ない順', code: 15 },
    { label: '再生時間が長い順', code: 16 },
    { label: '再生時間が短い順', code: 17 }
  ]
}

export default connect(
  state => ({
    play: state.play,
    mylist: state.mylist,
    accounts: state.accounts,
    queue: state.queue
  }),
  dispatch => bindActionCreators(Actions, dispatch)
)(MyList);
