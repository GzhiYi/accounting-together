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
    billInfo: {},
    isEscape: getApp().globalData.isEscape,
    theme: 'white-skin'
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    app.globalData.billId = options.billId
  },
  onShow: function () {
    const self = this
    getApp().setTheme(this)
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
              let billInfo = res.result.billInfo
              billInfo.createTime = parseTime(billInfo.createTime, '{y}-{m}-{d} {h}:{m}:{s}')
              billInfo.endTime = parseTime(billInfo.endTime, '{y}-{m}-{d} {h}:{m}:{s}')
              // 将自己提前到最上面
              billInfo.result.forEach((item, index) => {
                if (item.openId === self.data.fetchUserInfo.storeUser.openId) {
                  billInfo.result.splice(index, 1)
                  billInfo.result.unshift(item)
                }
              })
              self.setData({
                billInfo
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
    wx.navigateBack({
      fail(error) {
        wx.redirectTo({
          url: '/pages/group/group',
        })
      }
    })
  },
  onShareAppMessage: function () {
    const { billInfo, userInfo } = this.data
    return {
      title: `AA账单【${billInfo.name}】结算结果已出，你猜这次花了多少钱？`,
      path: `/pages/result/result?billId=${billInfo._id}`,
      imageUrl: getApp().globalData.imageUrl
    }
  }
})