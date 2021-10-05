// pages/login/login.js
const app = getApp()
import Notify from '../dist/notify/notify'
Page({

  /**
   * 页面的初始数据
   */
  data: {
    backPath: '',
    theme: 'white-skin'
  },
  onLoad: function (options) {
    if (options.hasOwnProperty("back")) {
      this.setData({
        backPath: options.back
      })
    }
  },
  onShow: function () {
    getApp().setTheme(this)
  },
  goGroup() {
    wx.redirectTo({
      url: '/pages/group/group',
    })
  },
  onGotUserInfo (event) {
    const { backPath } = this.data
    wx.getUserProfile({
      desc: '展示你的公开信息',
      success(res) {
        if (res.errMsg === 'getUserProfile:ok') {
          app.globalData.userInfo = res.userInfo
          const { avatarUrl, nickName, gender } = res.userInfo
          wx.cloud.callFunction({
            name: 'createUser',
            data: {
              mode: 'add',
              avatarUrl,
              name: '',
              nickName,
              sex: gender
            },
            success(createRes) {
              console.log(createRes);
              if (createRes.result.code === 1) {
                wx.redirectTo({
                  url: `${backPath === '' ? '/pages/group/group' : `/pages/${backPath}/${backPath}`}`
                })
              }
            }
          })
        }
      },
      fail(err) {
        console.log(err);
      }
    })
  }
})