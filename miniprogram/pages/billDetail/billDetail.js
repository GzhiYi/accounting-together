// pages/billDetail/billDetail.js
import { parseTime } from '../../utils/parseTime.js'
import Dialog from '../dist/dialog/dialog'
import Notify from '../dist/notify/notify'
const app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    currentBill: {
      paidTotal: 0
    },
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
    projectPrice: '',
    loadingConfirm: false,

    // 折叠面板
    activeCollapse: ['1']
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
    self.getBillLatest()
    self.setData({
      currentGroupInfo: app.globalData.currentGroupInfo,
      currentGroupUserList
    })
    self.getProject()
  },
  getBillLatest () {
    // 获取最新bill数据，主要是更新总价格
    const self = this
    wx.cloud.callFunction({
      name: 'getOneBill',
      data: {
        billId: app.globalData.currentBill._id
      },
      success(res) {
        console.log('最新bill数据', res)
        self.setData({
          currentBill: res.result
        })
        // app.globalData.currentBill = res.result
      }
    })
  },
  getProject () {
    const self = this
    const { currentBill, currentGroupUserList } = this.data
    wx.cloud.callFunction({
      name: 'getProject',
      data: {
        billId: app.globalData.currentBill._id
      },
      success (res) {
        console.log("账单详情返回", res)
        let tempList = res.result
        tempList.forEach(item => {
          // 处理购买日期格式转换
          item.paidDate = parseTime(item.paidDate, '{y}-{m}-{d}')

          // 处理包含用户的转换
          item.containUser.forEach((oneContainUser, index) => {
            currentGroupUserList.forEach(user => {
              if (user.openId === oneContainUser) {
                item.containUser[index] = user
              }
            })
          }) 
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
  // 删除账单操作
  deleteBill () {
    const { currentBill } = this.data
    Dialog.confirm({
      message: `确定要删除账单  ${currentBill.name}  吗？`,
      selector: '#confirm-delete-bill'
    }).then(() => {
      wx.cloud.callFunction({
        name: 'deleteBill',
        data: {
          billId: currentBill._id
        },
        success (res) {
          // 删除提示
          Notify({
            text: '已删除',
            duration: 1500,
            selector: '#bill-delete-selector',
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
  deleteProject (event) {
    const projectInfo = event.currentTarget.dataset.item
    const self =this
    console.log("呼啦啦啦", event)
    Dialog.confirm({
      message: `确定要删除改项吗？`,
      selector: '#confirm-delete-bill'
    }).then(() => {
      wx.cloud.callFunction({
        name: 'deleteProject',
        data: {
          projectId: projectInfo._id,
          billId: self.data.currentBill._id,
          projectPrice: projectInfo.price
        },
        success(res) {
          self.getProject()
          self.getBillLatest()
          self.setData({
            activeCollapse: []
          })
          console.log('删除返回', res)
        }
      })
    })
  },
  addProject () {
    this.setData({
      showAddProjectSheet: true
    })
  },
  clickAvatar (event) {
    console.log(event)
    // 先算算勾选的人数
    const { currentGroupUserList } = this.data
    const index = event.currentTarget.dataset.index
    let checkedNum = 0
    currentGroupUserList.forEach(item => {
      if (item.checked) {
        checkedNum ++
      }
    })
    if (checkedNum === 1 && currentGroupUserList[index].checked) {
      Notify({
        text: '总得有人埋单吧？',
        duration: 1500,
        selector: '#bill-notify-selector',
        backgroundColor: '#dc3545'
      });
      return
    } else {
      const checked = this.data.currentGroupUserList[index].checked
      this.data.currentGroupUserList[index].checked = !checked
      this.setData({
        currentGroupUserList: this.data.currentGroupUserList
      })
    }
  },
  onTimeChange(event) {
    console.log('时间', event)
    this.setData({
      paidDate: event.detail.data.innerValue
    });
  },
  addProjectInput (event) {
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
    const { projectTitle, projectPrice, currentGroupUserList, currentGroupInfo, currentBill, paidDate } = this.data
    console.log('提交', projectTitle, projectPrice, currentGroupUserList, paidDate)
    const self = this
    self.setData({
      loadingConfirm: true
    })
    wx.cloud.callFunction({
      name: 'createProject',
      data: {
        projectTitle,
        projectPrice,
        paidDate,
        groupId: currentGroupInfo._id,
        billId: currentBill._id,
        containUser: currentGroupUserList.map(item => {
          if (item.checked) {
            return item.openId
          }
        })
      },
      success (res) {
        console.log('创建project返回', res)
        self.setData({
          showAddProjectSheet: false,
          activeCollapse: [],
          projectPrice: '',
          projectTitle: ''
        })
        self.getProject()
        self.getBillLatest()
      },
      fail (error) {
        console.log("出现什么错误", error)
      },
      complete () {
        self.setData({
          loadingConfirm: false
        })
      }
    })
  },
  onCollapseChange (event) {
    this.setData({
      activeCollapse: event.detail
    })
  },
  onShow: function () {

  },
  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})