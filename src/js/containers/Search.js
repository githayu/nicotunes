import Remote, { Menu } from 'remote'
import React, { Component } from 'react'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import classNames from 'classnames'
import {
  DropDownMenu,
  Menu as MuiMenu,
  MenuItem,
  FlatButton,
  IconButton,
  Popover,
  Tabs,
  Tab,
  Checkbox as MuiCheckbox,
  CircularProgress
} from 'material-ui'

import * as Actions from '../actions/App'
import VideoItem from '../components/VideoItem'
import CreateContextMeun from '../utils/ContextMenu'

export default class Search extends Component {
  componentWillMount() {
    this.setState({
      advanced: false,
      sortWindow: false,
      suggest: false,
      suggestIndex: false,
      suggestMouseEnter: false,
      query: this.props.search.query
    });
  }

  componentWillUpdate(prevProps, prevState) {
    if (JSON.stringify(prevProps.search.items) !== JSON.stringify(this.props.search.items)) {
      this.setState({
        suggest: false
      });
    }
  }

  render() {
    return (
      <div className="search-container">
        <header className="search-header">
          <form className="search-form">
            <div className="search-form-basic">
              <fieldset className="search-form-query">
                <input
                  ref="query"
                  type="search"
                  placeholder="検索"
                  list="suggest"
                  value={this.state.query.q}
                  onKeyUp={::this.queryKeyUp}
                  onChange={::this.suggest}
                  onFocus={::this.queryFocus}
                  onBlur={::this.queryBlur} />

                <ul
                  className={classNames({
                    'suggest-list': true,
                    'active': this.state.suggest
                  })}
                  onMouseEnter={::this.suggestMouseEnter}
                  onMouseLeave={::this.suggestMouseLeave}>
                  {
                    this.props.search.suggest.map((candidates, index) => {
                      return (
                        <li
                          key={candidates}
                          className={classNames({
                            selected: this.state.suggestIndex === index
                          })}
                          onClick={this.suggestClick.bind(this, candidates)}>{candidates}</li>
                      );
                    })
                  }
                </ul>
              </fieldset>

              <FlatButton
                className="search-submit-button"
                onClick={::this.search}
                children={<span className="icon" />}
                style={{
                  minWidth: 'auto',
                  flex: '0 0 48px',
                  borderRadius: 0
                }} />

              <IconButton
                className="search-sort-button"
                iconClassName="icon"
                tooltip="並び替え"
                tooltipPosition="bottom-center"
                onClick={e => {
                  this.setState({
                    sortWindow: !this.state.sortWindow,
                    sortAnchor: e.currentTarget
                  })
                }}
                style={{
                  padding: 0,
                  width: 'auto',
                  height: 'auto'
                }}/>

              <Popover
                open={this.state.sortWindow}
                anchorEl={this.state.sortAnchor}
                anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
                targetOrigin={{ horizontal: 'right', vertical: 'top' }}
                onRequestClose={() => {
                  this.setState({ sortWindow: false });
                }}>
                <MuiMenu
                  desktop={true}
                  className="search-sort-select"
                  value={this.state.query._sort}
                  onChange={::this.sortOrderChange} >
                  {
                    this.props.sortOrder.map(e => {
                      return (
                        <MenuItem
                          key={e.value}
                          primaryText={e.label}
                          value={e.value} />
                      );
                    })
                  }
                </MuiMenu>
              </Popover>

              <IconButton
                className="search-form-advance-button"
                iconClassName="icon"
                tooltip="詳細検索"
                tooltipPosition="bottom-center"
                onClick={::this.advanced}
                style={{
                  padding: 0,
                  width: 'auto',
                  height: 'auto'
                }} />
            </div>

            <Tabs
              className={classNames({
                'search-form-advance': true,
                'active': this.state.advanced
              })}
              contentContainerClassName="search-form-tabs-container"
              tabItemContainerStyle={{
                borderBottom: '1px rgba(0,0,0,.15) solid',
                position: 'relative',
                zIndex: 1
              }}
              inkBarStyle={{
                height: '3px',
                marginTop: '-3px',
                zIndex: 2
              }} >

              <Tab label="検索対象" >

                <fieldset
                  className="search-targets">
                  {
                    this.props.targets.map(target => {
                      return (
                        <MuiCheckbox
                          key={target.value}
                          label={target.label}
                          detaultValue={target.value}
                          defaultChecked={this.state.query.targets.includes(target.value)}
                          onCheck={this.targetsChange.bind(this, target.value)} />
                      );
                    })
                  }
                </fieldset>
              </Tab>

              <Tab
                label="数値指定"
                style={{ color: '#333' }} >
                <div className="numeric-fields">
                  {
                    this.props.numericField.map(field => {
                      let gte = (
                        <input
                          key="gte"
                          type={field.type}
                          data-field-name={field.name}
                          onChange={::this.filtersChange}
                          className="gte"
                          placeholder="最小" />
                      ),

                      lte = (
                        <input
                          key="lte"
                          type={field.type}
                          data-field-name={field.name}
                          onChange={::this.filtersChange}
                          className="lte"
                          placeholder="最大" />
                      ),

                      inputForm = (field.type == 'datetime-local') ? ([
                          <label key="gte"><span>開始日</span>{ gte }</label>,
                          <label key="lte"><span>終了日</span>{ lte }</label>
                      ]) : ([
                        gte, <span key="space" className="space" />, lte
                      ]);

                      return (
                        <div
                          key={field.name}
                          className={classNames({
                            [field.name]: true,
                            fieldset: true
                          })}>
                          <h1>{field.label}</h1>
                          <fieldset
                            ref={field.name}
                            name={field.name}
                            className="input-form-container">
                            { inputForm }
                          </fieldset>
                        </div>
                      );
                    })
                  }
                </div>
              </Tab>

              <Tab
                label="カテゴリ指定"
                style={{ color: '#333' }} >

                <fieldset className="category-filter">
                  {
                    this.props.categoryTags.map(e => {
                      let checked = (Array.isArray(this.state.query.filters.categoryTags) && this.state.query.filters.categoryTags.indexOf(e.value) !== -1);

                      return (
                        <MuiCheckbox
                          key={e.value}
                          label={e.value}
                          defaultValue={e.value}
                          defaultChecked={checked}
                          onCheck={::this.categoryTagsChange} />
                      );
                    })
                  }
                </fieldset>
              </Tab>
            </Tabs>
          </form>
        </header>

        <main className="search-content">
          <ul className="video-list">{ this.videoItemsRender() }</ul>
        </main>

        <div className="loading-progress">
          <CircularProgress />
        </div>
      </div>
    );
  }

  videoItemsRender() {
    if (!this.props.search.items.length) return;

    return this.props.search.items.map(video => {
      return (
        <VideoItem
          onClick={this.props.playMusic.bind(this, {
            account: this.props.accounts.niconico.selected,
            video,
            videos: this.props.search.items,
            mode: ['video']
          })}
          onContextMenu={this.contextMeun.bind(this, video)}
          video={video}
          active={this.props.play.active && video.id == this.props.play.video.id}
          key={video.id} />
      );
    })
  }

  sortOrderChange(e, sortOrder) {
    this.setState({
      sortWindow: false,
      query: Object.assign({}, this.state.query, {
        _sort: sortOrder
      })
    });

    if (this.state.query.q.length) {
      this.search({
        _sort: sortOrder
      });
    }
  }

  targetsChange(target) {
    let targets = [];

    if (this.state.query.targets.length) {
      targets = this.state.query.targets.split(',');
      let index = targets.indexOf(target);

      if (index === -1) {
        targets.push(target);
      } else {
        targets.splice(index, 1);
      }
    } else {
      targets.push(target);
    }

    console.log(targets.join());

    this.setState({
      query: Object.assign({}, this.state.query, {
        targets: targets.join()
      })
    });
  }

  categoryTagsChange(e, state) {
    let categoryTags = (typeof this.state.query.filters.categoryTags === 'undefined') ? [] : this.state.query.filters.categoryTags.concat(),
        value = e.target.value,
        index = categoryTags.indexOf(value);

    if (index !== -1 && !state) {
      categoryTags.splice(index, 1);
    } else if (index === -1 && state) {
      categoryTags.push(value)
    }

    this.setState({
      query: Object.assign({}, this.state.query, {
        filters: Object.assign({}, this.state.query.filters, {
          categoryTags
        })
      })
    });
  }

  filtersChange(e) {
    let parent = this.refs[e.target.dataset.fieldName],
        gte = parent.querySelector('.gte'),
        lte = parent.querySelector('.lte'),
        nextState = {};

    switch (parent.name) {
      case 'startTime':
        if (gte.value.length) nextState.gte = gte.value;
        if (lte.value.length) nextState.lte = lte.value;
        break;

      default:
        if (isFinite(gte.valueAsNumber)) nextState.gte = gte.valueAsNumber;
        if (isFinite(lte.valueAsNumber)) nextState.lte = lte.valueAsNumber;
    }

    this.setState({
      query: Object.assign({}, this.state.query, {
        filters: Object.assign({}, this.state.query.filters, {
          [parent.name]: nextState
        })
      })
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

  queryKeyUp(e) {
    let suggestIndex = (this.state.suggestIndex !== false) ? this.state.suggestIndex : -1;

    switch (e.keyCode) {
      case 38: { // ↑
        let nextIndex = (suggestIndex <= 0) ? this.props.search.suggest.length - 1 : suggestIndex - 1;
        this.setState({ suggestIndex: nextIndex });
        break;
      }

      case 40: { // ↓
        let nextIndex = (suggestIndex >= this.props.search.suggest.length - 1) ? 0 : suggestIndex + 1;
        this.setState({ suggestIndex: nextIndex });
        break;
      }

      case 13: {
        if (this.state.suggestIndex !== false) {
          this.search({
            q: this.props.search.suggest[this.state.suggestIndex]
          });
        } else {
          this.search();
        }

        break;
      }
    }
  }

  queryFocus() {
    this.setState({
      suggest: true
    });
  }

  queryBlur() {
    if (!this.state.suggestMouseEnter) {
      this.setState({
        suggest: false
      });
    }
  }

  suggest() {
    let query = this.refs.query.value;

    this.setState({
      suggest: query.length !== 0,
      query: Object.assign({}, this.state.query, {
        q: query
      })
    });

    if (query.length) {
      this.props.niconicoSuggest(query);
    } else {
      this.props.stateChanger('search', {
        suggest: []
      });
    }
  }

  suggestClick(query) {
    this.search({
      q: query
    });
  }

  suggestMouseEnter() {
    this.setState({
      suggestMouseEnter: true
    });
  }

  suggestMouseLeave() {
    this.setState({
      suggestMouseEnter: false
    });

    if (this.state.suggest) this.refs.query.focus();
  }

  advanced() {
    this.setState({
      advanced: !this.state.advanced
    });
  }

  search(optionalQuery) {
    if (typeof optionalQuery === 'object' && optionalQuery.constructor !== Object) {
      optionalQuery = {};
    }

    let req = {
      service: 'video',
      query: Object.assign({}, this.state.query, optionalQuery)
    };

    if (!req.query.q.length || !req.query.targets.length) return;

    this.props.niconicoSearch(req);

    this.setState({
      suggestIndex: false,
      query: req.query
    });
  }
}

Search.defaultProps = {
  sortOrder: [
    { label: '再生が多い順', value: '-viewCounter' },
    { label: '再生が少ない順', value: '+viewCounter' },
    { label: 'マイリスト登録が多い順', value: '-mylistCounter' },
    { label: 'マイリスト登録が少ない順', value: '+mylistCounter' },
    { label: 'コメントが多い順', value: '-commentCounter' },
    { label: 'コメントが少ない順', value: '+commentCounter' },
    { label: 'コメントが新しい順', value: '-lastCommentTime' },
    { label: 'コメントが古い順', value: '+lastCommentTime' },
    { label: '投稿が新しい順', value: '-startTime' },
    { label: '投稿が古い順', value: '+startTime' },
    { label: '再生時間が長い順', value: '-lengthSeconds' },
    { label: '再生時間が短い順', value: '+lengthSeconds' }
  ],

  categoryTags: [
    { value: 'エンターテイメント' },
    { value: '音楽' },
    { value: '歌ってみた' },
    { value: '演奏してみた' },
    { value: '踊ってみた' },
    { value: 'VOCALOID' },
    { value: 'ニコニコインディーズ' },
    { value: '動物' },
    { value: '料理' },
    { value: '自然' },
    { value: '旅行' },
    { value: 'スポーツ' },
    { value: 'ニコニコ動画講座' },
    { value: '車載動画' },
    { value: '歴史' },
    { value: '政治' },
    { value: '科学' },
    { value: 'ニコニコ技術部' },
    { value: 'ニコニコ手芸部' },
    { value: '作ってみた' },
    { value: 'アニメ' },
    { value: 'ゲーム' },
    { value: '東方' },
    { value: 'アイドルマスター' },
    { value: 'ラジオ' },
    { value: '描いてみた' },
    { value: '例のアレ' },
    { value: '日記' },
    { value: 'その他' },
    { value: 'R-18' }
  ],

  numericField: [
    { name: 'viewCounter', label: '再生数', type: 'number' },
    { name: 'mylistCounter', label: 'マイリスト数', type: 'number' },
    { name: 'commentCounter', label: 'コメント数', type: 'number' },
    { name: 'lengthSeconds', label: '再生時間', type: 'number' },
    { name: 'startTime', label: '投稿日時', type: 'datetime-local' }
  ],

  targets: [
    { label: 'タイトル', value: 'title' },
    { label: '説明文', value: 'description' },
    { label: 'タグ', value: 'tags' },
  ]
}

export default connect(
  state => ({
    play: state.play,
    search: state.search,
    accounts: state.accounts
  }),
  dispatch => bindActionCreators(Actions, dispatch)
)(Search);
