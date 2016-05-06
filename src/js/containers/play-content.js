import Remote, { Menu } from 'remote'
import ipc from 'ipc'
import electron, { ipcRenderer } from 'electron'
import React, { Component } from 'react'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import { Tabs, Tab } from 'material-ui'
import classNames from 'classnames'

import Utils from '../utils/utils'
import * as Actions from '../actions/app'
import LocalStorageController from '../utils/localstorage'
import CreateContextMeun from '../utils/context-menu'

export default class PlayContent extends Component {
  constructor(props) {
    super(props);

    this.state = {
      slideId: 'details'
    };
  }

  componentWillMount() {
    ipcRenderer.send('mainWindowResize', 'playing');
  }

  componentWillUnmount() {
    ipcRenderer.send('mainWindowResize', 'default');
  }

  render() {
    return (
      <div className="play-content">
        { this.playHeadRender() }

        <Tabs
          onChange={::this.slideChange}
          className="play-tabs"
          tabItemContainerStyle={{
            backgroundColor: '#fff',
            borderBottom: '1px rgba(0,0,0,.15) solid',
            position: 'relative',
            zIndex: 1
          }}
          inkBarStyle={{
            height: '3px',
            marginTop: '-3px',
            backgroundColor: '#0288D1',
            zIndex: 2
          }} >
          {(() => {
            let slides = [];

            for (let i = 0, slide; slide = this.props.slides[i]; i++) {
              // 歌詞未登録 or ボーカロイド曲 でない場合
              if (slide.value == 'lyrics' && (!this.props.play.info || !this.props.play.info.lyrics.length)) continue;

              console.log(slide.value);

              slides.push(
                <Tab
                  key={slide.value}
                  label={slide.label}
                  value={slide.value}
                  style={{ color: '#333' }} />
              );
            }
            return slides;
          })()}
        </Tabs>

        {(() => this.props.play.info ? this.vocaloidInfoRender() : this.videoInfoRender())()}
      </div>
    );
  }

  playHeadRender() {
    let renderThumbnailUrl = this.props.play.video.thumbnailLargeUrl ?
                             this.props.play.video.thumbnailLargeUrl :
                             this.props.play.video.thumbnailUrl,
        renderTitle,
        renderArtistName;

    if (!this.props.play.info) {
      renderTitle = this.props.play.video.title;
      renderArtistName = Utils.UrlParamDecoder(decodeURIComponent(this.props.play.audioUrl)).artist;
    } else {
      renderTitle = this.props.play.info.defaultName;
      renderArtistName = this.props.play.info.artistString;
    }

    return (
      <div
        className={classNames({
          'play-header': true,
          'play-info': true,
          'active': this.props.play.selectedTab !== 'views'
        })}
        onClick={::this.playVideo} style={{
        backgroundImage: `url(${renderThumbnailUrl})`
      }}>
        <figure
          className="play-thumbnail"
          style={{
            backgroundImage: `url(${renderThumbnailUrl})`
          }} />
        <div className="play-meta">
          <h1 className="play-title">{ renderTitle }</h1>
          <p className="play-artist-name">{ renderArtistName }</p>
        </div>
      </div>
    );
  }

  videoInfoRender() {
    return (
      <div className="play-tab-content">
        <div className={classNames({
          'play-details': true,
          'selected': this.props.play.selectedTab === 'details'
        })}>
          <table className="play-details-table">
            <tbody>
              <tr><th>タイトル</th><td>{ this.props.play.video.title }</td></tr>
              <tr><th>投稿日時</th><td>{ Utils.FormatDateString(this.props.play.video.firstRetrieve) }</td></tr>
              <tr><th>タグ</th><td className="play-detail-tags">{ this.props.play.video.tags.map(tag => {
                return (
                  <a key={tag.name}>{tag.name}</a>
                )
              }) }</td></tr>
              <tr><th>説明文</th><td dangerouslySetInnerHTML={{__html: this.props.play.video.description }} /></tr>
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  vocaloidInfoRender() {
    // 歌詞を見やすくする
    if (this.props.play.info.lyrics.length) {
      let lyricsInfo = this.props.play.info.lyrics.filter(lyrics => lyrics.language === 'Japanese')[0];

      var renderLyrics = lyricsInfo.value.split(/(\r?\n){2,}/g).map((section, i) => {
        return (
          <div key={`lyrics-section-${i}`}>{section.split(/\r?\n/g).map(line => {
            return (
              <p>{line}</p>
            )
          })}</div>
        )
      });
    }

    // アルバムがあれば。
    let albums = this.props.play.info.albums.length ? [
      <tr key="albums">
        <th>アルバム</th>
        <td>
          <ul className="play-detail-table-list">
          {
            this.props.play.info.albums.map((album, i) => {
              return (
                <li
                  className="link"
                  onClick={this.onAlbumClick.bind(this, album.id)}
                  key={`album-${i}`}>{album.name}</li>
              )
            })
          }
          </ul>
        </td>
      </tr>
    ] : [];

    return (
      <div className="play-tab-content">
        <div className={classNames({
          'play-details': true,
          'selected': this.props.play.selectedTab === 'details'
        })}>
          <table className="play-details-table">
            <tbody>
              <tr><th>タイトル</th><td>{ this.props.play.info.defaultName }</td></tr>

              {
                this.props.detailTable.map((artistType, i) => {
                  let artists = this.props.play.info.artists.filter(artist => artist.categories === Utils.CapitalizeFirstLetter(artistType.value));

                  if (!artists.length) return;

                  return (
                    <tr key={`detail-${artistType.value}`}>
                      <th>{artistType.label}</th>
                      <td>
                        <ul className="play-detail-table-list">
                        {
                          artists.map((artist, i) => {
                            let artistClickLink = ('artist' in artist) ? {
                              onClick: this.onArtistClick.bind(this, artist.artist.id)
                            } : {};

                            return (
                              <li
                                className={classNames({
                                  link: Object.keys(artistClickLink).length
                                })}
                                { ...artistClickLink }
                                key={`vocalist-${i}`}>{artist.name}</li>
                            )
                          })
                        }
                        </ul>
                      </td>
                    </tr>
                  )
                })
              }

              <tr><th>楽曲タイプ</th><td>{ this.props.play.info.songType }</td></tr>
              <tr><th>投稿日時</th><td>{ Utils.FormatDateString(this.props.play.video.firstRetrieve) }</td></tr>

              { albums }
            </tbody>
          </table>

        </div>

        <div className={classNames({
          'play-lyrics': true,
          'selected': this.props.play.selectedTab === 'lyrics'
        })}>{ renderLyrics }</div>
      </div>
    );
  }

  playVideo() {
    this.props.play.audio.pause();
    ipcRenderer.send('videoWindow', this.props.play.video.id);
  }

  slideChange(value) {
    this.props.playState({ selectedTab: value });
  }

  onArtistClick(id) {
    console.log(id);
  }

  onAlbumClick(id) {
    console.log(id);
  }
}

PlayContent.defaultProps = {
  slides: [
    {
      value: 'details',
      label: '詳細'
    }, {
      value: 'lyrics',
      label: '歌詞'
    }
  ],

  detailTable: [
    {
      value: 'vocalist',
      label: 'ボーカリスト'
    }, {
      value: 'producer',
      label: 'プロデューサー'
    }, {
      value: 'animator',
      label: '動画製作者'
    }, {
      value: 'label',
      label: 'レーベル'
    }, {
      value: 'circle',
      label: 'サークル'
    }, {
      value: 'other',
      label: 'その他'
    }, {
      value: 'band',
      label: 'バンド'
    }, {
      value: 'nothing',
      label: 'その他'
    }
  ],

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
)(PlayContent);
