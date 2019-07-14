// pages/help/help.js
Page({
  data: {
    skin: getApp().globalData.skin
  },
  onLoad: function () {},
  onShareAppMessage: function () {
    return {
      title: getApp().globalData.shareWord(),
      path: getApp().globalData.sharePath
    }
  }
})