// pages/personal/personal.js
const app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    userInfo: {}
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
  },
  onShow: function () {
    // 如果用户未进行授权就进入这个页面就跳转到登录
    app.catchUserInfo = res => {
      console.log('回调上', res)
      if (!app.globalData.userInfo && !res) {
        wx.navigateTo({
          url: '/pages/login/login?back=personal',
        })
      } else {
        this.setData({
          userInfo: res || app.globalData.userInfo
        })
      }
    }
    console.log('全局上', app.globalData.userInfo)
    if (app.globalData.userInfo) {
      this.setData({
        userInfo: app.globalData.userInfo
      })
    }
  },
  onShareAppMessage: function () {

  }
})