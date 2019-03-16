//index.js
import Notify from '../dist/notify/notify'
const app = getApp()

Page({
  data: {
    newGroupModal: false,
    groupName: '',
    num: 0
  },

  onLoad: function() {
    this.setData({
      num: Math.ceil(Math.random() * 10)
    })
    wx.cloud.callFunction({
      // 云函数名称
      name: 'getGroup',
      // 传给云函数的参数
      data: {
        a: 1,
        b: 2,
      },
      success(res) {
        // console.log(res.result) // 3
      },
      fail: console.error
    })
  },
  onGroupModalClose () {
    this.setData({
      newGroupModal: false
    })
  },

  showNewGroupModal () {
    this.setData({
      newGroupModal: true
    })
  },

  callNewGroup (event) {
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
          setTimeout(() => {
            wx.switchTab({
              url: `/pages/group/group`,
            })
          , 1500})
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
  
  onGroupNameChange (event) {
    this.setData({
      groupName: event.detail
    })
  },
  showLucky() {
    wx.showToast({
      title: '愿所见之人幸运下去💗',
      icon: 'none'
    })
  }
})
