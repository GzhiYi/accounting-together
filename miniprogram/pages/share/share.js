// pages/share/share.js
import Notify from '../dist/notify/notify'
const app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    inviteInfo: {},
    loading: false,
    isEscape: getApp().globalData.isEscape,
    theme: 'white-skin',
    isInGroup: false,
    groupData: null
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    if (!getApp().globalData.isEscape) {
      wx.redirectTo({
        url: '/pages/group/group'
      })
    }
    if (options.hasOwnProperty('groupId')) {
      this.setData({
        inviteInfo: options
      })
      this.getGroupInfo(options.groupId)
    } else if (app.globalData.shareParam) {
      this.setData({
        inviteInfo: app.globalData.shareParam
      })
    } else {
      wx.switchTab({
        url: '/pages/group/group',
      })
    }
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    getApp().setTheme(this)
  },
  // 获取组的信息
  getGroupInfo(groupId) {
    const self = this
    wx.cloud.callFunction({
      name: 'joinGroup',
      data: {
        mode: 'check',
        groupId
      },
      success(res) {
        if (res.result.code === 2) {
          self.setData({
            isInGroup: true,
            groupData: res.result.data
          })
          getApp().globalData.currentGroupInfo = res.result.data
        }
      }
    })
  },
  goToGroup() {
    wx.redirectTo({
      url: '/pages/groupDetail/groupDetail',
    })
  },
  joinGroup () {
    const { inviteInfo } = this.data
    const self = this
    self.setData({
      loading: true
    })
    wx.cloud.callFunction({
      name: 'joinGroup',
      data: {
        groupId: inviteInfo.groupId
      },
      success (joinRes) {
        // 加入提示
        Notify({
          text: `${joinRes.result.msg}`,
          duration: 1500,
          selector: '#join-tips',
          backgroundColor: `${joinRes.result.code === 1 ? '#28a745' : '#dc3545'}`
        });
        getApp().globalData.currentGroupInfo = joinRes.result.data
        setTimeout(() => {
          self.goToGroup()
        }, 2000)
      },
      complete() {
        self.setData({
          loading: false
        })
      }
    })
  }
})