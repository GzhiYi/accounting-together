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
    billInfo: {}
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    console.log(options)
    app.globalData.billId = options.billId
  },
  onShow: function () {
    const self = this
    // 如果用户未进行授权就进入这个页面就跳转到登录
    app.catchUserInfo = res => {
      console.log('回调上', res)
      if (!app.globalData.userInfo && !res) {
        wx.navigateTo({
          url: '/pages/login/login?back=result',
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

    wx.cloud.callFunction({
      name: 'getResult',
      data: {
        billId: app.globalData.billId
      },
      success (res) {
        console.log('获取返回', res)
        res.result.billInfo.createTime = parseTime(res.result.billInfo.createTime, '{y}-{m}-{d} {h}:{m}:{s}')
        res.result.billInfo.endTime = parseTime(res.result.billInfo.endTime, '{y}-{m}-{d} {h}:{m}:{s}')
        self.setData({
          billInfo: res.result.billInfo
        })
      }
    })
  },
  goHome () {
    wx.switchTab({
      url: '/pages/index/index',
    })
  },
  onShareAppMessage: function () {
    const { billInfo, userInfo } = this.data
    console.log('打印分享链接', `/pages/result/result?billId=${billInfo._id}`)
    return {
      title: `账单【${billInfo.name}】结算结果已出，快来查看吧~`,
      path: `/pages/result/result?billId=${billInfo._id}`
    }
  }
})