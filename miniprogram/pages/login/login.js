// pages/login/login.js
const app = getApp()
import Notify from '../dist/notify/notify'
Page({

  /**
   * 页面的初始数据
   */
  data: {
    backPath: ''
  },
  onLoad: function (options) {
    if (options.hasOwnProperty("back")) {
      this.setData({
        backPath: options.back
      })
    }
  },
  onShow: function () {

  },
  onGotUserInfo (event) {
    const { backPath } = this.data
    // 确认获取到用户信息
    if (event.detail.errMsg === 'getUserInfo:ok') {
      const userInfo = event.detail.userInfo
      app.globalData.userInfo = userInfo
      wx.cloud.callFunction({
        name: 'createUser',
        data: {
          avatarUrl: userInfo.avatarUrl,
          name: '',
          nickName: userInfo.nickName,
          sex: userInfo.gender
        },
        success(res) {
        }
      })
      wx.redirectTo({
        url: `${backPath === '' ? '/pages/group/group' : `/pages/${backPath}/${backPath}`}`
      })
    } else {
      // 加入提示
      Notify({
        text: "需要获取基本信息，请再次点击登录",
        duration: 1500,
        selector: '#login-tips',
        backgroundColor: '#dc3545'
      });
    }
  },
  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})