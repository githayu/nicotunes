import Remote, { Menu } from 'remote'
import React, { Component } from 'react'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import { IconButton } from 'material-ui'
import classNames from 'classnames'

import * as Actions from '../actions/app'
import Utils from '../utils/utils'
import IDBController from '../utils/indexeddb'
import LocalStorageController from '../utils/localstorage'
import CreateContextMeun from '../utils/context-menu'

export default class Player extends Component {
  componentWillMount() {
    let storage = this.props.appLocalStorage.get();

    // Audio
    this.audio = new Audio();
    this.audio.autoplay = true;
    this.audio.volume = storage.volume;

    this.setState({
      repeat: 0,
      queueLoop: false,
      seeking: false
    });

    this.audio.addEventListener('timeupdate', this.timeUpdate.bind(this), false);
    this.audio.addEventListener('play', this.props.playState.bind(this, { ended: false, paused: false }), false);
    this.audio.addEventListener('pause', this.props.playState.bind(this, { paused: true }), false);
    this.audio.addEventListener('ended', this.playEnded.bind(this), false);
  }

  componentDidUpdate(prevProps, prevState) {
    if (prevProps.play.audioUrl !== this.props.play.audioUrl) {
      this.audio.src = this.props.play.audioUrl;
      this.audio.play();
    }
  }

  render() {
    let volumeLevel = (this.audio.muted || this.audio.volume == 0) ? 'mute' :
                      (this.audio.volume >= 0.8) ? 'large' :
                      (this.audio.volume >= 0.2) ? 'medium' : 'small',

        volume = this.audio.muted ? 0 : this.audio.volume * 100,

        renderThumbnailUrl = '',
        renderAudioSrc     = '',
        renderDuration     = '--:--',
        renderTitle        = '',
        renderAuthor       = '';

    if (this.props.play.active) {
      renderThumbnailUrl = this.props.play.video.thumbnailLargeUrl ?
                           this.props.play.video.thumbnailLargeUrl :
                           this.props.play.video.thumbnailUrl;

      renderDuration = Utils.FormatSeconds(this.props.play.video.lengthInSeconds);
      renderTitle    = this.props.play.video.title;
      renderAuthor   = Utils.UrlParamDecoder(decodeURIComponent(this.props.play.audioUrl)).artist;
    }

    return (
      <div
        className={classNames({
          'music-player': true,
          'active': this.props.play.active
        })}
        onContextMenu={this.contextMeun.bind(this)}>

        <div
          className="player-thumbnail"
          ref="playerThumbnail"
          style={{
            backgroundImage: `url(${renderThumbnailUrl})`
          }} />

        <div className="player-content">
          <div className="player-info">
            <h1 ref="playerTitle">{renderTitle}</h1>
            <p className="author" ref="playerAuthor">{renderAuthor}</p>
          </div>

          <div className="player-control">
            <div className="player-controller">
              <IconButton
                onClick={this.onRepeat.bind(this)}
                className="repeat-button"
                iconClassName={classNames({
                  icon: true,
                  [this.props.repeat[this.state.repeat]]: true,
                  active: this.state.repeat
                })} />

              <IconButton
                onClick={this.nextPlayMusic.bind(this, 'prev')}
                className="prev-button"
                iconClassName="icon" />

              <IconButton
                onClick={this.playMusic.bind(this)}
                className="play-pause-button"
                iconClassName={classNames({
                  icon: true,
                  play: this.props.play.paused,
                  pause: !this.props.play.paused
                })}
                style={{
                  width: '60px',
                  height: '60px'
                }} />

              <IconButton
                onClick={this.nextPlayMusic.bind(this, 'next')}
                className="next-button"
                iconClassName="icon" />

              <div className="player-volume">
                <IconButton
                  onClick={this.updateProperty.bind(this, 'muted')}
                  ref="playerVolume"
                  className="mute-button"
                  iconClassName={classNames({
                    icon: true,
                    [volumeLevel]: true
                  })}  />

                <div className="player-volume-slider-container">
                  <input
                    type="range"
                    onChange={this.volumeChange.bind(this)}
                    defaultValue={this.audio.volume * 100}
                    className="player-volume-slider"
                    ref="playerVolumeSlider"
                    style={{
                      backgroundImage: `-webkit-linear-gradient(left, #0288d1 ${volume}%, #ddd ${volume}%)`
                    }} />
                </div>
              </div>

              <IconButton
                onClick={this.props.QueueState.bind(this, { active: !this.props.queue.active })}
                className="queue-button"
                iconClassName={classNames({
                  icon: true,
                  active: this.props.queue.active
                })} />
            </div>

            <div className="player-timer">
              <time
                className="player-time"
                ref="playerTime">00:00</time>
              <time
                className="player-duration"
                ref="playerDuration">{renderDuration}</time>
            </div>
          </div>
        </div>

        <div
          className="player-progress"
          ref="playerProgress"
          onMouseDown={this.progressMouseDown.bind(this)}>

          <div
            className="player-play-progress"
            ref="playerPlayProgress" />
        </div>
      </div>
    );
  }

  onRepeat(e) {
    let mode = (this.state.repeat + 1 <= this.props.repeat.length - 1) ? this.state.repeat + 1 : 0;

    switch (mode) {
      case 0: this.audio.loop = false; this.state.queueLoop = false; break;
      case 1: this.audio.loop = false; this.state.queueLoop = true; break;
      case 2: this.audio.loop = true; this.state.queueLoop = false; break;
    }

    this.setState({
      repeat: mode
    });
  }

  updateProperty(prop, value) {
    if (value.constructor.name === 'SyntheticMouseEvent') value = !this.state[prop];

    this.audio[prop] = value;

    this.setState({
      [prop]: value
    });
  }

  nextPlayMusic(type) {
    if (this.props.queue.items.length < 1) return;

    // 次に再生する曲を選択
    let index = (() => {
      for (let i = 0; i < this.props.queue.items.length; i++) {
        if (this.props.queue.items[i].id == this.props.play.video.id) {
          return i += (type == 'prev') ? -1 : +1;
        }
      }
    })();

    // キューリピート無効の場合は終了
    if (this.state.repeat == 0 && index >= this.props.queue.items.length) {
      return this.props.playState({ active: false, video: null });
    }

    let nextIndex = (index <= 0) ? this.props.queue.items.length :
                    (index >= this.props.queue.items.length) ? 0 : index;

    this.props.PlayMusic({
      account: this.props.accounts.niconico.selected,
      video: this.props.queue.items[nextIndex],
      videos: []
    });
  }

  playMusic(e) {
    this.audio.paused ? this.audio.play() : this.audio.pause();
  }

  volumeChange(e) {
    let volume = e.target.valueAsNumber / 100;

    this.setState({ volume });
    this.props.appLocalStorage.update({ volume });

    this.audio.volume = volume;
  }

  timeUpdate(e) {
    this.refs.playerTime.innerText = Utils.FormatSeconds(this.audio.currentTime);

    if (!this.state.seeking) {
      let width = (this.audio.currentTime / this.audio.duration) * 100;
      this.refs.playerPlayProgress.style.width = `${width}%`;
    }
  }

  playEnded() {
    switch (this.state.repeat) {
      case 0: // 無効
      case 1: // 有効
        this.nextPlayMusic('next');
        break;
    }
  }

  contextMeun() {
    let menu = new CreateContextMeun(this, [
      {
        label: this.props.play.paused ? '再生' : '停止',
        click: this.playMusic.bind(this)
      },
      'separator',
      {
        label: '倍速再生',
        submenu: this.props.rate.map(s => {
          return {
            label: s == 1 ? '通常' : String(s),
            click: this.updateProperty.bind(this, 'playbackRate', s)
          }
        })
      }
    ]);

    Menu.buildFromTemplate(menu).popup(Remote.getCurrentWindow());
  }

  progressMouseDown(e) {
    this.setState({ seeking: true });
    window.addEventListener('mousemove', this, false);
    window.addEventListener('mouseup', this, false);
  }

  progressMove(e) {
    let width = ~~ ((e.offsetX / this.refs.playerProgress.clientWidth) * 100);
    this.refs.playerPlayProgress.style.width = `${width}%`;
  }

  progressMouseUp(e) {
    this.audio.currentTime = ~~ ((e.offsetX / this.refs.playerProgress.clientWidth) * this.audio.duration);

    this.setState({ seeking: false });
    window.removeEventListener('mousemove', this, false);
    window.removeEventListener('mouseup', this, false);
  }

  handleEvent(e) {
    switch (e.type) {
      case 'mousemove': this.progressMove(e); break;
      case 'mouseup'  : this.progressMouseUp(e); break;
    }
  }
}

Player.defaultProps = {
  repeat: [
    'no-repeat',
    'repeat',
    'one-repeat'
  ],
  rate: [ 0.5, 1, 1.5, 2, 2.5, 3, 3.5, 4 ],
  appLocalStorage: new LocalStorageController('app')
}

export default connect(
  state => ({
    app: state.app,
    play: state.play,
    queue: state.queue,
    accounts: state.accounts
  }),
  dispatch => bindActionCreators(Actions, dispatch)
)(Player);
