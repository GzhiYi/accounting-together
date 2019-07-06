// pages/help/help.js
Page({
  data: {},
  onLoad: function () {},
  onShareAppMessage: function () {
    return {
      title: getApp().globalData.shareWord(),
      path: getApp().globalData.sharePath
    }
  }
})