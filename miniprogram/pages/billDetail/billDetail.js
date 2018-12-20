// pages/billDetail/billDetail.js
import { parseTime } from '../../utils/parseTime.js'
import Notify from '../dist/notify/notify'
const app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    currentBill: null,
    currentGroupInfo: null,
    projectList: [],
    loadingEnd: false,
    showAddProjectSheet: false,
    currentGroupUserList: [],

    // 所选时间
    minHour: 10,
    maxHour: 20,
    maxDate: new Date().getTime(),
    paidDate: new Date().getTime(),

    projectTitle: '',
    projectPrice: ''
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    console.log(app)
    const self = this
    let currentGroupUserList = app.globalData.currentGroupUserList
    // 让默认情况下所有的头像勾选
    currentGroupUserList.forEach(item => {
      item.checked = true
    })
    self.setData({
      currentBill: app.globalData.currentBill,
      currentGroupInfo: app.globalData.currentGroupInfo,
      currentGroupUserList
    })
    self.getProject()
  },
  getProject () {
    const self = this
    const { currentBill } = this.data
    wx.cloud.callFunction({
      name: 'getProject',
      data: {
        billId: currentBill._id
      },
      success (res) {
        console.log("账单详情返回", res)
        let tempList = res.result
        tempList.forEach(item => {
          item.paidDate = parseTime(item.paidDate, '{y}-{m}-{d}')
        })
        self.setData({
          projectList: tempList
        })
      }
    })
  },
  // 结算账单
  onSubmitBill () {
    const { currentBill } = this.data
    const self = this
    self.setData({
      loadingEnd: true
    })
    wx.cloud.callFunction({
      name: 'endBill',
      data: {
        billId: currentBill._id
      },
      success (res) {
        console.log('更新状态成功')
        // 删除提示
        Notify({
          text: '账单已结算',
          duration: 1500,
          selector: '#bill-notify-selector',
          backgroundColor: '#28a745'
        });
        setTimeout(() => {
          wx.navigateBack()
        }, 2000)
      },
      complete () {
        self.setData({
          loadingEnd: false
        })
      }
    })
  },
  addProject () {
    this.setData({
      showAddProjectSheet: true
    })
  },
  clickAvatar (event) {
    console.log(event)
    const index = event.currentTarget.dataset.index
    const checked = this.data.currentGroupUserList[index].checked
    this.data.currentGroupUserList[index].checked = !checked
    this.setData({
      currentGroupUserList: this.data.currentGroupUserList
    })
  },
  onTimeChange(event) {
    this.setData({
      paidDate: event.detail.value
    });
  },
  addProjectInput (event) {
    console.log('event', event)
    if (event.currentTarget.dataset.field === 'title') {
      this.setData({
        projectTitle: event.detail
      })
    }
    if (event.currentTarget.dataset.field === 'price') {
      this.setData({
        projectPrice: event.detail
      })
    }
  },
  closeAddProjectSheet () {
    this.setData({
      showAddProjectSheet: false
    })
  },
  comfirmAddProject () {
    const { projectTitle, projectPrice, currentGroupUserList,  paidDate } = this.data
    console.log('提交', projectTitle, projectPrice, currentGroupUserList, paidDate)
    // 记得new Date(paidDate)
  },
  onShow: function () {

  },
  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})