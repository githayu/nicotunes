import Remote, { Menu } from 'remote';
import React, { Component } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import classNames from 'classnames';
import { Tabs, Tab, CircularProgress } from 'material-ui';
import * as Actions from '../actions/App';
import VideoItem from '../components/VideoItem';
import CreateContextMeun from '../utils/ContextMenu';

export default class Ranking extends Component {
  componentDidMount() {
    if (!this.props.ranking.items) {
      this.props.getRanking({ category: this.props.ranking.category });
    }
  }

  categoryChange() {
    this.props.getRanking({
      category: this.refs.category.value,
      span: this.props.ranking.span
    });
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

  headerCategoryRender() {
    return (
      <select
        className="ranking-category"
        value={this.props.ranking.category}
        ref="category"
        onChange={::this.categoryChange}
      >
      {
        this.props.categories.map(category => {
          if (category.sub) {
            return (
              <optgroup
                label={category.name}
                key={category.name}
              >
              {
                category.sub.map(sub => {
                  return (
                    <option
                      label={sub.name}
                      value={sub.value}
                      key={sub.value}
                    />
                  );
                })
              }
              </optgroup>
            );
          } else {
            return (
              <option
                label={category.name}
                value={category.value}
                key={category.value}
              />
            );
          }
        })
      }
      </select>
    );
  }

  headerSpanRender() {
    if (['nicobox', 'surema'].indexOf(this.props.ranking.category) != -1) return;

    return (
      <Tabs
        onChange={::this.spanChange}
        className="ranking-span-tabs"
        ref="spanTab"
        value={this.props.ranking.span}
        tabItemContainerStyle={{
          borderBottom: '1px rgba(0,0,0,.15) solid',
          position: 'relative',
          zIndex: 1
        }}
        inkBarStyle={{
          height: '3px',
          marginTop: '-3px',
          zIndex: 2
        }}
      >
      {
        this.props.span.map(span => {
          return (
            <Tab
              label={span.label}
              key={span.value}
              value={span.value}
            />
          );
        })
      }
      </Tabs>
    );
  }

  rankingRender() {
    if (!this.props.ranking.items || !this.props.ranking.items.length || this.props.ranking.loading) return;

    if (this.props.ranking.category == 'nicobox') {
      return (
        <ul className="video-list">{
          this.props.ranking.items.map((item, i) => {

            let thumbnailId = item.smcode.match(/^(sm|so|nm)(\d+)$/)[2],
                thumbnailHost = (thumbnailId % 4) + 1,
                video = {
                  id: item.smcode,
                  thumbnailUrl: `http://tn-skr${thumbnailHost}.smilevideo.jp/smile?i=${thumbnailId}`,
                  title: item.title
                };

            return (
              <VideoItem
                onClick={this.props.playMusic.bind(this, {
                  account: this.props.accounts.niconico.selected,
                  video: video,
                  videos: this.props.ranking.items,
                  mode: ['video']
                })}
                onContextMenu={this.contextMeun.bind(this, video)}
                video={video}
                active={this.props.play.active && video.id == this.props.play.video.id}
                meta={false}
                duration={false}
                ranking={i+1}
                key={video.id}
              />
            );
          })
        }</ul>
      );

    } else if (this.props.ranking.category == 'surema') {

      return (
        <ul className="video-list">{
          this.props.ranking.items.map((item, i) => {

            const video = {
              id: item.video.id,
              thumbnailUrl: item.video.thumbnail_url,
              title: item.video.title,
              viewCount: +item.video.view_counter,
              myListCount: +item.video.mylist_counter,
              lengthInSeconds: +item.video.length_in_seconds,
              thread: {
                commentCount: +item.thread.num_res
              }
            };

            return (
              <VideoItem
                onClick={this.props.playMusic.bind(this, {
                  account: this.props.accounts.niconico.selected,
                  video,
                  videos: this.props.ranking.items,
                  mode: ['video']
                })}
                onContextMenu={this.contextMeun.bind(this, video)}
                video={video}
                active={this.props.play.active && video.id == this.props.play.video.id}
                ranking={i+1}
                key={video.id}
              />
            );
          })
        }</ul>
      );

    } else {

      return (
        <ul className="video-list">
        {
          this.props.ranking.items.map((item, i) => {
            return (
              <VideoItem
                onClick={this.props.playMusic.bind(this, {
                  account: this.props.accounts.niconico.selected,
                  video: item.video,
                  videos: this.props.ranking.items.map(i => i.video)
                })}
                onContextMenu={this.contextMeun.bind(this, item.video)}
                video={item.video}
                ranking={i+1}
                active={this.props.play.active && item.video.id == this.props.play.video.id}
                key={item.video.id}
              />
            );
          })
        }
        </ul>
      );
    }
  }

  spanChange(span) {
    this.props.getRanking({
      category: this.refs.category.value,
      span: span
    });
  }

  render() {
    return (
      <div
        className={classNames({
          'ranking-container': true,
          [this.props.ranking.category]: true,
          'loading': this.props.ranking.loading
        })}
      >
        <header className="ranking-header">
          { this.headerCategoryRender() }
          { this.headerSpanRender() }
        </header>
        <div className="ranking-content">
          { this.rankingRender() }
        </div>
        <div className="loading-progress">
          <CircularProgress />
        </div>
      </div>
    );
  }
}

Ranking.defaultProps = {
  categories: [
    {
      name: 'NicoBox',
      value: 'nicobox'
    }, {
      name: 'スレマ度力',
      value: 'surema'
    }, {
      name: 'カテゴリ合算',
      value: 'all'
    }, {
      name: 'エンタメ・音楽',
      sub: [
        { name: '合算', value: 'g_ent2' },
        { name: 'エンターテイメント', value: 'ent' },
        { name: '音楽', value: 'music' },
        { name: '歌ってみた', value: 'sing' },
        { name: '演奏してみた', value: 'play' },
        { name: '踊ってみた', value: 'dance' },
        { name: 'VOCALOID', value: 'vocaloid' },
        { name: 'ニコニコインディーズ', value: 'nicoindies' }
      ]
    }, {
      name: '生活・一般・スポ',
      sub: [
        { name: '合算', value: 'g_life2' },
        { name: '動物', value: 'animal' },
        { name: '料理', value: 'cooking' },
        { name: '自然', value: 'nature' },
        { name: '旅行', value: 'travel' },
        { name: 'スポーツ', value: 'sport' },
        { name: 'ニコニコ動画講座', value: 'lecture' },
        { name: '車載動画', value: 'drive' },
        { name: '歴史', value: 'history' }
      ]
    }, {
      name: '政治',
      value: 'politics'
    }, {
      name: '科学・技術',
      sub: [
        { name: '合算', value: 'g_tech' },
        { name: '科学', value: 'science' },
        { name: 'ニコニコ技術部', value: 'tech' },
        { name: 'ニコニコ手芸部', value: 'handcraft' },
        { name: '作ってみた', value: 'make' }
      ]
    }, {
      name: 'アニメ・ゲーム・絵',
      sub: [
        { name: '合算', value: 'g_culture' },
        { name: 'アニメ', value: 'anime' },
        { name: 'ゲーム', value: 'game' },
        { name: '東方', value: 'toho' },
        { name: 'アイドルマスター', value: 'imas' },
        { name: 'ラジオ', value: 'radio' },
        { name: '描いてみた', value: 'draw' }
      ]
    }, {
      name: 'その他',
      sub: [
        { name: '合算', value: 'g_other' },
        { name: '例のアレ', value: 'are' },
        { name: '日記', value: 'diary' },
        { name: 'その他', value: 'other' }
      ]
    }
  ],

  span: [
    { label: '毎時', value: 'hourly' },
    { label: '今日', value: 'daily' },
    { label: '週間', value: 'weekly' },
    { label: '月間', value: 'monthly' },
    { label: '合計', value: 'total' }
  ]
};

export default connect(
  state => ({
    ranking: state.ranking,
    play: state.play,
    accounts: state.accounts
  }),
  dispatch => bindActionCreators(Actions, dispatch)
)(Ranking);
