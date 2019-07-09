// pages/group/group.js
import Dialog from '../dist/dialog/dialog'
import Notify from '../dist/notify/notify'

Page({
  data: {
    groupList: [],
    newGroupModal: false,
    groupName: '',
    statusBarHeight: getApp().globalData.statusBarHeight,
    screenWidth: getApp().globalData.screenWidth,
    showTips: false,
    showShareTips: false,
    isEscape: true
  },
  onLoad: function () {
    const self = this
    // 用于判断是否显示账单留言
    const nowTime = Date.parse(new Date())
    if (nowTime < 1562749200000) { // 2019-07-10 17:00:00
      self.setData({
        isEscape: false
      })
      getApp().globalData.isEscape = false
    }
    // 处理是否查看过教程
    const isVisitedHelp = wx.getStorageSync('isVisitedHelp') || false
    if (!isVisitedHelp) {
      Dialog.confirm({
        title: '等一下！',
        message: '先看下教程咧～'
      }).then(() => {
        wx.setStorageSync('isVisitedHelp', true)
        wx.navigateTo({
          url: '/pages/help/help',
        })
      }).catch(() => {
        wx.setStorageSync('isVisitedHelp', true)
        wx.showToast({
          title: '看来你会用了呢～😊',
          icon: 'none'
        })
      });
    }
    // 这里逻辑是，如果打开次数为2就提示
    const openCount = wx.getStorageSync('openCount') || 0
    self.handleTips([3, 20], 'showTips', 8000, openCount)
    self.handleTips([4, 15, 25, 36, 50], 'showShareTips', 8000, openCount)
    wx.setStorageSync('openCount', openCount + 1)
  },
  handleTips(inArr, whatTip, time, openCount) {
    const self = this
    if (inArr.includes(openCount)) {
      self.setData({
        [`${whatTip}`]: true
      })
      setTimeout(() => {
        self.setData({
          [`${whatTip}`]: false
        })
      }, time)
    }
  },
  onShow: function () {
    this.getGroup()
  },
  getGroup() {
    const self = this
    getApp().showLoading(self)
    wx.cloud.callFunction({
      name: 'getGroup',
      data: {},
      success(res) {
        self.setData({
          groupList: res.result
        })
      },
      complete() {
        getApp().hideLoading(self)
      }
    })
  },
  goToGroupDetail (event) {
    getApp().globalData.currentGroupInfo = event.currentTarget.dataset.group
    wx.navigateTo({
      url: `/pages/groupDetail/groupDetail`
    })
  }, onGroupModalClose() {
    this.setData({
      newGroupModal: false
    })
  },
  showNewGroupModal() {
    this.setData({
      newGroupModal: true
    })
  },
  callNewGroup(event) {
    if (event.detail === 'confirm') {
      // 异步关闭弹窗
      const self = this
      if (this.data.groupName === '') {
        Notify({
          text: '起个名字吧',
          duration: 1500,
          selector: '#notify-selector',
          backgroundColor: '#dc3545'
        })
        self.setData({
          newGroupModal: true
        })
        self.selectComponent("#new-group-modal").stopLoading()
        return
      }
      wx.cloud.callFunction({
        name: 'createGroup',
        data: {
          groupName: this.data.groupName
        },
        success() {
          self.setData({
            groupName: '',
            newGroupModal: false
          })
          Notify({
            text: '新建成功',
            duration: 1500,
            selector: '#notify-selector',
            backgroundColor: '#28a745'
          })
          self.getGroup()
        }
      })
    } else {
      this.setData({
        newGroupModal: false
      })
    }

  },
  onGroupNameChange(event) {
    this.setData({
      groupName: event.detail
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