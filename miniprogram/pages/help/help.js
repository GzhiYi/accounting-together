// pages/help/help.js
Page({
  data: {
    skin: getApp().globalData.skin,
    theme: 'white-skin'
  },
  onLoad: function () {},
  onShareAppMessage: function () {
    return {
      title: getApp().globalData.shareWord(),
      path: getApp().globalData.sharePath
    }
  }
})