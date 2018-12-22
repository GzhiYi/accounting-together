// pages/personal/personal.js
import Notify from '../dist/notify/notify'
import { parseTime } from '../../utils/parseTime.js'
const app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    userInfo: {},
    showFeedback: false,
    stars: 5,
    message: '',
    fetchUserInfo: {}
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
  },
  onShow: function () {
    const self = this
    // 获取账单信息
    wx.cloud.callFunction({
      name: 'getUserInfo',
      data: {},
      success (res) {
        console.log('拿到的信息', res)
        res.result.storeUser.createTime = parseTime(res.result.storeUser.createTime, '{y}-{m}-{d}')
        self.setData({
          fetchUserInfo: res.result
        })
      }
    })
    // 如果用户未进行授权就进入这个页面就跳转到登录
    app.catchUserInfo = res => {
      console.log('回调上', res)
      if (!app.globalData.userInfo && !res) {
        wx.navigateTo({
          url: '/pages/login/login?back=personal',
        })
      } else {
        self.setData({
          userInfo: res || app.globalData.userInfo
        })
      }
    }
    console.log('全局上', app.globalData.userInfo)
    if (app.globalData.userInfo) {
      self.setData({
        userInfo: app.globalData.userInfo
      })
    }
  },
  feedbackModal (event) {
    this.setData({
      showFeedback: event.currentTarget.dataset.modal === 'showFeedback'
    })
  },
  onStarChange (event) {
    console.log(event)
    this.setData({
      stars: event.detail
    });
  },
  onMessageChange (event) {
    this.setData({
      message: event.detail
    })
  },
  leaveMessage () {
    const { stars, message } = this.data
    this.setData({
      showFeedback: false
    })
    wx.cloud.callFunction({
      name: 'createFeedback',
      data: {
        stars,
        message
      },
      success (res) {
        console.log("反馈返回", res)
        if (res.result.code == 1) {
          Notify({
            text: `${res.result.msg}`,
            duration: 1000,
            selector: '#feedback-tips',
            backgroundColor: '#28a745'
          });
        }
      }
    })
  },
  showGithub () {
    wx.showToast({
      title: 'Github搜索“accounting-together“',
      icon: 'none'
    })
  },
  showAbout () {
    wx.showToast({
      title: '喜欢吗，还是空白惹',
      icon: 'none'
    })
  }
})