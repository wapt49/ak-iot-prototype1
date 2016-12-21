'use strict';

import React, { Component } from 'react';
import {
    AppRegistry,
    BackAndroid,
    Navigator,
    ToolbarAndroid,
    Image,
    ListView,
    StyleSheet,
    Text,
    View,
    PixelRatio,
    TouchableHighlight,
    ActivityIndicator,
    Alert,
    PullToRefreshViewAndroid
} from 'react-native';

var REQUEST_URL = 'http://busintime.id:6001/';
var dismissKeyboard = require('dismissKeyboard');

var ArticleListScreen = React.createClass({
  getInitialState: function () {
    return {
      dataSource: new ListView.DataSource({
        rowHasChanged: (row1, row2) => row1 !== row2,
      }),
      data: [],
      loaded: false,
      isLoadingTail: false,
      isRefreshing: false,
      page: 1,
    };
  },
  getDefaultProps: function () {
    return {
      category: 'featured'
    };
  },
  fetchData: function (page) {
    var url = REQUEST_URL + this.props.category;
    debugger
    if (page)
      url += '?page=' + page;
    return fetch(url);
  },
  selectArticle: function (slug, title) {
    dismissKeyboard();
    this.props.navigator.push({
      title: title,
      slug: slug,
      name: 'article',
    });
  },
  onRefresh: function () {
    this.setState({ isRefreshing: true });
    this.fetchData()
      .then((response) => response.json())
      .then((responseData) => {
        this.setState({
          dataSource: this.state.dataSource.cloneWithRows(responseData),
          loaded: true,
          data: responseData,
          page: this.state.page + 1,
          isRefreshing: false,
        });
      })
      .catch(function (ex) {
        debugger
        Alert.alert('Ziliun', 'Failed to load article');
      })
      .done();
  },
  componentDidMount: function () {
    this.onRefresh();
  },
  renderArticle: function (article) {
    return (
      <TouchableHighlight
        underlayColor="#dddddd"
        onPress={() => this.selectArticle(article.slug, article.title)}>
        <View style={styles.container}>
          <Image
            source={{ uri: article.image }}
            style={styles.thumbnail}
            />
          <View style={styles.rightContainer}>
            <Text style={styles.title}>{article.title}</Text>
          </View>
        </View>
      </TouchableHighlight>
    );
  },
  renderLoadingView: function () {
    return (
      <View style={{ flex: 1, flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator styleAttr="Small" />
        <Text style={{ textAlign: 'center' }}>
          Loading articles...
        </Text>
      </View>
    )
  },
  renderFooter: function () {
    return (
      <View style={{ alignItems: 'center', padding: 10 }}>
        <ActivityIndicator styleAttr="Small" />
      </View>
    );
  },
  onEndReached: function () {
    // if (!this.hasMore() || this.state.isLoadingTail) {
    //   // We're already fetching or have all the elements so noop
    //   return;
    // }

    this.setState({
      isLoadingTail: true,
    });

    this.fetchData(this.state.page)
      .then((response) => response.json())
      .then((responseData) => {
        var data = this.state.data.concat(responseData);
        this.setState({
          dataSource: this.state.dataSource.cloneWithRows(data),
          data: data,
          isLoadingTail: false,
          page: this.state.page + 1,
        });
      })
      .catch(function (ex) {
        Alert.alert('Ziliun', 'Failed to load article');
      })
      .done();
  },
  render: function () {
    if (!this.state.loaded) {
      return this.renderLoadingView();
    }

    return (
      <PullToRefreshViewAndroid
        style={{ flex: 1 }}
        refreshing={this.state.isRefreshing}
        onRefresh={this.onRefresh}
        colors={['#f7913d', '#f7913d', '#f7913d']}
        progressBackgroundColor={'#fff'}
        >
        <ListView
          dataSource={this.state.dataSource}
          renderRow={this.renderArticle}
          style={styles.listView}
          renderFooter={this.renderFooter}
          onEndReached={this.onEndReached}
          />
      </PullToRefreshViewAndroid>
    );

  }
});

var styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'stretch',
    backgroundColor: '#F5FCFF',
  },
  rightContainer: {
    position: 'absolute',
    padding: 20,
    paddingTop: 10,
    paddingBottom: 10,
    bottom: 0,
    left: 0,
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  title: {
    fontSize: 12,
    marginBottom: 8,
    textAlign: 'left',
    color: 'white'
  },
  description: {
    fontSize: 9,
    textAlign: 'left',
  },
  thumbnail: {
    flex: 1,
    height: 140,
  },
  listView: {
    backgroundColor: '#F5FCFF',
  },
});

module.exports = ArticleListScreen;

