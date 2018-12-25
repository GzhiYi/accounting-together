// pages/groupDetail/groupDetail.js
import { parseTime } from '../../utils/parseTime.js'
import Dialog from '../dist/dialog/dialog'
import Notify from '../dist/notify/notify'
const app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    groupInfo: {},
    userList: [],
    newBillModal: false,
    billName: '',
    billList: [],
    groupCreateTime: null,
    userInfoFromCloud: {}
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    console.log('app in groupDetail', app)
    this.setData({
      userInfoFromCloud: app.globalData.userInfoFromCloud
    })
  },

  onBillModalClose() {
    this.setData({
      newBillModal: false
    })
  },

  showNewBillModal() {
    this.setData({
      newBillModal: true
    })
  },

  callNewBill() {
    const self = this
    wx.cloud.callFunction({
      name: 'createBill',
      data: {
        billName: this.data.billName,
        groupId: this.data.groupInfo._id
      },
      success(res) {
        console.log('成功返回', res)
        self.setData({
          billName: '',
          newBillModal: false
        })
        wx.cloud.callFunction({
          name: 'getBill',
          data: {
            groupId: self.data.groupInfo._id
          },
          success(res) {
            console.log('bill返回', res)
            self.setData({
              billList: res.result
            })
          }
        })
      },
      fail(error) {
        console.log('错误', error)
      }
    })
  },

  onBillNameChange(event) {
    this.setData({
      billName: event.detail
    })
  },

  newBill () {
    this.setData({
      newBillModal: true
    })
  },

  deleteGroup () {
    Dialog.confirm({
      message: `确定要删除组  ${this.data.groupInfo.name}  吗？`,
      selector: '#confirm-delete-group'
    }).then(() => {
      wx.cloud.callFunction({
        name: 'deleteGroup',
        data: {
          groupId: this.data.groupInfo._id
        },
        success (res) {
          // 删除提示
          Notify({
            text: '已删除',
            duration: 1500,
            selector: '#notify-selector',
            backgroundColor: '#dc3545'
          });
          setTimeout(() => {
            wx.navigateBack()
          }, 2000)
        }
      })
    })
    .catch(error => {
      console.log("错误", error)
    });
  },
  // 跳转到bill详情页面
  goToBillDetail (event) {
    console.log(event)
    app.globalData.currentBill = event.currentTarget.dataset.bill
    wx.navigateTo({
      url: '/pages/billDetail/billDetail',
    })
  },
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    console.log('具体参数', getApp())
    const { currentGroupInfo } = getApp().globalData
    const self = this
    wx.showLoading({
      title: '正在加载...',
    })
    if (currentGroupInfo) {
      self.setData({
        groupInfo: currentGroupInfo,
        groupCreateTime: parseTime(currentGroupInfo.createTime, '{y}-{m}-{d}')
      })
      wx.cloud.callFunction({
        name: 'getGroupUser',
        data: {
          groupId: currentGroupInfo._id
        },
        success(res) {
          console.log('返回', res)
          self.setData({
            userList: res.result.reverse()
          })
          app.globalData.currentGroupUserList = res.result.reverse()
        }
      })
      wx.cloud.callFunction({
        name: 'getBill',
        data: {
          groupId: currentGroupInfo._id
        },
        success(res) {
          console.log('bill返回', res)
          self.setData({
            billList: res.result
          })
        },
        complete () {
          wx.hideLoading()
        }
      })
      this.setData({
        groupId: currentGroupInfo._id
      })
    }
  },
  showAvatarTips () {
    wx.showToast({
      title: '是群猪没错了',
      icon: 'none'
    })
  },
  showUserName (event) {
    console.log(event)
    wx.showToast({
      title: event.currentTarget.dataset.user.nickName,
      icon: 'none'
    })
  },
  onShareAppMessage: function () {
    const { groupInfo } = this.data
    const userInfo = app.globalData.userInfo
    console.log('打印分享链接', `/pages/share/share?groupId=${groupInfo._id}&inviter=${userInfo.nickName}&avatarUrl=${userInfo.avatarUrl}&groupName=${groupInfo.name}`)
    return {
      title: `快来加入群组【${groupInfo.name}】啦，AA收款跷方便~`,
      path: `/pages/share/share?groupId=${groupInfo._id}&inviter=${userInfo.nickName}&avatarUrl=${userInfo.avatarUrl}&groupName=${groupInfo.name}`
    }
  }
})