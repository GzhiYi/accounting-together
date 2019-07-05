// pages/group/group.js
import Dialog from '../dist/dialog/dialog'
import Notify from '../dist/notify/notify'

Page({
  data: {
    groupList: [],
    newGroupModal: false,
    groupName: ''
  },
  onLoad: function (options) {
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
          title: '别不会用哦～😊',
          icon: 'none'
        })
      });
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
        success(res) {
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
        },
        fail(error) {
          // console.log('错误', error)
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
})