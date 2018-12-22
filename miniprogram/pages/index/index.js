//index.js
import Notify from '../dist/notify/notify'
const app = getApp()

Page({
  data: {
    newGroupModal: false,
    groupName: ''
  },

  onLoad: function() {
    wx.cloud.callFunction({
      // 云函数名称
      name: 'getGroup',
      // 传给云函数的参数
      data: {
        a: 1,
        b: 2,
      },
      success(res) {
        console.log(res.result) // 3
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

  callNewGroup () {
    const self = this
    wx.cloud.callFunction({
      name: 'createGroup',
      data: {
        groupName: this.data.groupName
      },
      success (res) {
        console.log('成功返回', res)
        self.setData({
          groupName: '',
          newGroupModal: false
        })
        Notify({
          text: '新建成功，请到组页面查看',
          duration: 1500,
          selector: '#notify-selector',
          backgroundColor: '#28a745'
        })
      },
      fail (error) {
        console.log('错误', error)
      }
    })
  },
  
  onGroupNameChange (event) {
    this.setData({
      groupName: event.detail
    })
  }
})
