// pages/groupDetail/groupDetail.js
import { parseTime } from '../../utils/parseTime.js'
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
    groupCreateTime: null
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    console.log('具体参数', getApp())
    const { currentGroupInfo } = getApp().globalData
    const self = this
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
        success (res) {
          console.log('返回', res)
          self.setData({
            userList: res.result
          })
        }
      })
      wx.cloud.callFunction({
        name: 'getBill',
        data: {
          groupId: currentGroupInfo._id
        },
        success (res) {
          console.log('bill返回', res)
          self.setData({
            billList: res.result
          })
        }
      })
      this.setData({
        groupId: currentGroupInfo._id
      })
    }
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

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})