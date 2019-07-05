// pages/personal/personal.js
import Notify from '../dist/notify/notify'
import { parseTime } from '../../utils/parseTime.js'
import Dialog from '../dist/dialog/dialog'
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
    app.globalData.billId = options.billId
  },
  onShow: function () {
    const self = this
    // 如果用户未进行授权就进入这个页面就跳转到登录
    app.catchUserInfo = res => {
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
    if (app.globalData.userInfo) {
      self.setData({
        userInfo: app.globalData.userInfo
      })
    }
    getApp().showLoading(self)
    wx.cloud.callFunction({
      name: 'getUserInfo',
      data: {},
      success (userInfoRes) {
        userInfoRes.result.storeUser.createTime = parseTime(userInfoRes.result.storeUser.createTime, '{y}-{m}-{d} {h}:{m}')
        self.setData({
          fetchUserInfo: userInfoRes.result
        })
        wx.cloud.callFunction({
          name: 'getResult',
          data: {
            billId: app.globalData.billId
          },
          success(res) {
            let visitorInBill = false
            const userRemark = app.globalData.userRemark
            res.result.billInfo.result.forEach(user => {
              if (self.data.fetchUserInfo.storeUser.openId === user.openId) {
                visitorInBill = true
              }
              Object.keys(userRemark).forEach(openId => {
                if (openId == user.openId) {
                  user.note = userRemark[`${openId}`]
                }
              })
            })
            if (visitorInBill) {
              res.result.billInfo.createTime = parseTime(res.result.billInfo.createTime, '{y}-{m}-{d} {h}:{m}:{s}')
              res.result.billInfo.endTime = parseTime(res.result.billInfo.endTime, '{y}-{m}-{d} {h}:{m}:{s}')
              self.setData({
                billInfo: res.result.billInfo
              })
            } else {
              Dialog.confirm({
                message: `Sorry鸭，您无权查看这个账单结果哟~`,
                selector: '#permission'
              }).then(() => {
                wx.switchTab({
                  url: '/pages/group/group',
                })
              }).catch(error => {
                wx.switchTab({
                  url: '/pages/group/group',
                })
              })
            }
          },
          complete() {
            getApp().hideLoading(self)
          }
        })
      }
    })

  },
  goBack() {
    wx.navigateBack()
  },
  onShareAppMessage: function () {
    const { billInfo, userInfo } = this.data
    return {
      title: `账单【${billInfo.name}】结算结果已出，快来查看吧~`,
      path: `/pages/result/result?billId=${billInfo._id}`
    }
  }
})