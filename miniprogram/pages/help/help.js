// pages/help/help.js
Page({
  data: {
    skin: getApp().globalData.skin,
    theme: 'white-skin'
  },
  onLoad: function () {},
  onShow() {
    getApp().setTheme(this)
  },
  onShareAppMessage: function () {
    return {
      title: getApp().globalData.shareWord(),
      path: getApp().globalData.sharePath
    }
  }
})