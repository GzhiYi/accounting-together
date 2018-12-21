// pages/login/login.js
const app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    backPath: ''
  },
  onLoad: function (options) {
    console.log(options)
    if (options.hasOwnProperty("back")) {
      this.setData({
        backPath: options.back
      })
    }
  },
  onShow: function () {

  },
  onGotUserInfo (event) {
    console.log(event)
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
          console.log('增加返回')
        }
      })
      const tabList = ['index', 'group', 'history', 'personal']
      if (tabList.indexOf(backPath) !== -1) {
        wx.switchTab({
          url: `${backPath === '' ? '/pages/index/index' : `/pages/${backPath}/${backPath}`}`
        })
      } else {
        wx.redirectTo({
          url: `${backPath === '' ? '/pages/index/index' : `/pages/${backPath}/${backPath}`}`
        })
      }

    }
  },
  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})