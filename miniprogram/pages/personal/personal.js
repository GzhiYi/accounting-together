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
    showFeedbackList: false,
    stars: 5,
    message: '',
    fetchUserInfo: {},
    feedbackList: []
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
        res.result.storeUser.createTime = parseTime(res.result.storeUser.createTime, '{y}-{m}-{d} {h}:{m}')
        self.setData({
          fetchUserInfo: res.result
        })
      }
    })
    // 如果用户未进行授权就进入这个页面就跳转到登录
    app.catchUserInfo = res => {
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
    if (app.globalData.userInfo) {
      self.setData({
        userInfo: app.globalData.userInfo
      })
    }
    wx.cloud.callFunction({
      name: 'createFeedback',
      data: {
        extend: 'getFeedbackList'
      },
      success(res) {
        self.setData({
          feedbackList: res.result
        })
      }
    })
  },
  feedbackModal (event) {
    this.setData({
      showFeedback: event.currentTarget.dataset.modal === 'showFeedback'
    })
  },
  feedbackListModal (event) {
    this.setData({
      showFeedbackList: event.currentTarget.dataset.modal === 'showModal'
    })
  },
  onStarChange (event) {
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
    if (message === '') {
      Notify({
        text: `不写点什么吗?  ＞︿＜`,
        duration: 1000,
        selector: '#feedback-tips',
        backgroundColor: '#dc3545'
      })
      return
    }
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
        if (res.result.code == 1) {
          Notify({
            text: `${res.result.msg}`,
            duration: 1000,
            selector: '#feedback-tips',
            backgroundColor: '#28a745'
          })
        }
      }
    })
  },
  closeLeaveMessage () {
    this.setData({
      showFeedback: false
    })
  },
  showGithub () {
    wx.showToast({
      title: '请到Github搜索"accounting-together"',
      icon: 'none'
    })
  },
  showAbout () {
    const { storeUser } = this.data.fetchUserInfo
    if (storeUser._id === 'XCBZVJT75u22uiN8') {
      wx.showToast({
        title: '岁月静好，很想和妳就这样一起安然老去。不紧不慢，不慌不忙，不离不弃。❤',
        icon: 'none',
        duration: 5000
      })
    } else {
      wx.showToast({
        title: 'Github: GzhiYi, Mail: 745285458@qq.com',
        icon: 'none',
        duration: 5000
      })
    }
  },
  goToUpdateLog() {
    wx.navigateTo({
      url: '/pages/updateLog/updateLog',
    })
  },
  goToHelp() {
    wx.navigateTo({
      url: '/pages/help/help',
    })
  },
  copySourceLink() {
    wx.setClipboardData({
      data: 'https://github.com/GzhiYi/accounting-together',
      success(res) {
        wx.getClipboardData({
          success(inRes) {
            wx.showToast({
              title: '源码地址已复制，到浏览器打开吧～',
              icon: 'none',
              duration: 3000
            })
          }
        })
      }
    })
  },
  copyWechat() {
    wx.setClipboardData({
      data: 'Yi745285458',
      success(res) {
        wx.getClipboardData({
          success(inRes) {
            wx.showToast({
              title: '微信号已复制',
              icon: 'none',
              duration: 3000
            })
          }
        })
      }
    })
  },
  onShareAppMessage: function () {
    return {
      title: getApp().globalData.shareWord(),
      path: getApp().globalData.sharePath,
      imageUrl: getApp().globalData.imageUrl
    }
  }
})