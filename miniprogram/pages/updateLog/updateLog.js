// pages/updateLog/updateLog.js
Page({
  data: {
    logs: []
  },
  onLoad: function () {},
  onShow: function () {
    const self = this
    wx.cloud.callFunction({
      name: 'createFeedback',
      data: {
        extend: 'getUpdateLog'
      },
      success(res) {
        console.log(res)
        self.setData({
          logs: res.result
        })
      }
    })
  },
  onShareAppMessage: function () {
    return {
      title: getApp().globalData.shareWord(),
      path: getApp().globalData.sharePath
    }
  }
})