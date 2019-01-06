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
      paidTotal: 0,
      ended: false
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
    activeCollapse: ['1'],
    userInfoFromCloud: {},
    isEditProject: false,
    targetProject: {},
    myPaid: 0,
    showMyPaid: false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    const self = this
    wx.showNavigationBarLoading()
    let currentGroupUserList = app.globalData.currentGroupUserList
    // 让默认情况下所有的头像勾选
    currentGroupUserList.forEach(item => {
      item.checked = true
    })
    self.getBillLatest()
    self.setData({
      currentGroupInfo: app.globalData.currentGroupInfo,
      currentGroupUserList,
      userInfoFromCloud: app.globalData.userInfoFromCloud
    })
    self.getProject()
  },
  roundFun(value, n) {
    return Math.round(value * Math.pow(10, n)) / Math.pow(10, n);
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
        self.setData({
          currentBill: res.result
        })
        // app.globalData.currentBill = res.result
      }
    })
  },
  roundFun(value, n) {
    return Math.round(value * Math.pow(10, n)) / Math.pow(10, n);
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
        let tempList = res.result
        let myPaid = 0
        tempList.forEach(item => {
          // 处理购买日期格式转换
          item.paidDate = parseTime(item.paidDate, '{y}-{m}-{d} {h}:{m}')
          if (item.createBy.openId === self.data.userInfoFromCloud.openId) {
            console.log(item.price)
            myPaid += self.roundFun(item.price, 2)
          }
        })
        self.setData({
          projectList: tempList,
          myPaid,
          showMyPaid: true
        })
      },
      complete () {
        wx.hideNavigationBarLoading()
      }
    })
  },
  // 结算账单
  onSubmitBill (event) {
    const { currentBill, currentGroupUserList, projectList } = this.data
    const self = this
    self.setData({
      loadingEnd: true
    })
    if (event.currentTarget.dataset.isend === 'Y') {
      wx.cloud.callFunction({
        name: 'endBill',
        data: {
          projectList,
          currentBill,
          groupUserList: currentGroupUserList,
          end: true
        },
        success (res) {
          // 删除提示
          Notify({
            text: '账单已结算',
            duration: 1500,
            selector: '#bill-notify-selector',
            backgroundColor: '#28a745'
          })
          self.setData({
            currentBill: {
              ended: true,
              paidTotal: self.data.currentBill.paidTotal
            }
          })
          setTimeout(() => {
            self.getBillLatest()
            self.getProject()
            wx.navigateTo({
              url: `/pages/result/result?billId=${currentBill._id}`,
            })
          }, 2000)
        },
        complete () {
          self.setData({
            loadingEnd: false
          })
        }
      })
    }
    if (event.currentTarget.dataset.isend === 'N') {
      wx.cloud.callFunction({
        name: 'endBill',
        data: {
          projectList,
          currentBill,
          groupUserList: currentGroupUserList,
          end: false
        },
        success(res) {
          // 删除提示
          Notify({
            text: '取消结算成功',
            duration: 1500,
            selector: '#bill-notify-selector',
            backgroundColor: '#28a745'
          })
          self.getBillLatest()
          self.getProject()
        },
        complete() {
          self.setData({
            loadingEnd: false
          })
        }
      })
    }
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
      // console.log("错误", error)
    });
  },
  editProject (event) {
    const self = this
    const { currentGroupUserList } = this.data
    const clickProject = event.currentTarget.dataset.item
    // 首先将所有勾选改为false
    currentGroupUserList.forEach((user, index) => {
      this.data.currentGroupUserList[index].checked = false
    })
    this.setData({
      currentGroupUserList: this.data.currentGroupUserList
    })
    // 判断哪些是勾选的
    this.data.currentGroupUserList.forEach((user, index) => {
      clickProject.containUser.forEach(item => {
        if (user.openId === item.openId) {
          this.data.currentGroupUserList[index].checked = true
        }
      })
    })
    self.setData({
      showAddProjectSheet: true,
      projectTitle: clickProject.title,
      projectPrice: clickProject.price,
      currentGroupUserList: this.data.currentGroupUserList,
      isEditProject: true,
      targetProject: clickProject
    })
  },
  deleteProject (event) {
    const projectInfo = event.currentTarget.dataset.item
    const self = this
    Dialog.confirm({
      message: `确定要删除支出项【${event.currentTarget.dataset.item.title}】？`,
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
        }
      })
    })
  },
  addProject () {
    this.setData({
      showAddProjectSheet: true
    })
  },
  showUserName(event) {
    wx.showToast({
      title: event.currentTarget.dataset.user.nickName,
      icon: 'none'
    })
  },
  clickAvatar (event) {
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
    this.data.currentGroupUserList.forEach((user, index) => {
      this.data.currentGroupUserList[index].checked = true
    })
    this.setData({
      showAddProjectSheet: false,
      projectPrice: '',
      projectTitle: '',
      isEditProject: false,
      paidDate: new Date().getTime(),
      currentGroupUserList: this.data.currentGroupUserList
    })
  },
  confirmAddProject () {
    const { projectTitle, projectPrice, currentGroupUserList, currentGroupInfo, currentBill, paidDate } = this.data
    const self = this
    if (projectTitle=== '') {
      Notify({
        text: '请输入支出项标题',
        duration: 1500,
        selector: '#bill-notify-selector',
        backgroundColor: '#dc3545'
      })
      return
    } else if (projectTitle.length > 10) {
      Notify({
        text: '支出项标题不能超过10个字哦~',
        duration: 1500,
        selector: '#bill-notify-selector',
        backgroundColor: '#dc3545'
      })
      return
    } else if ( projectPrice === '') {
      Notify({
        text: '价格未填写',
        duration: 1500,
        selector: '#bill-notify-selector',
        backgroundColor: '#dc3545'
      })
      return
    }
    self.setData({
      loadingConfirm: true
    })
    const tempContainUser = []
    currentGroupUserList.forEach(item => {
      if (item.checked) {
        tempContainUser.push(item.openId)
      }
    })
    wx.cloud.callFunction({
      name: 'createProject',
      data: {
        projectTitle,
        projectPrice: self.roundFun(projectPrice, 2),
        paidDate,
        groupId: currentGroupInfo._id,
        billId: currentBill._id,
        containUser: tempContainUser
      },
      success (res) {
        self.setData({
          activeCollapse: []
        })
        self.getProject()
        self.getBillLatest()
        self.closeAddProjectSheet()
      },
      fail (error) {
        // console.log("出现什么错误", error)
      },
      complete () {
        self.setData({
          loadingConfirm: false
        })
      }
    })
  },
  confirmEditProject () {
    const { targetProject, currentBill, projectPrice, projectTitle, currentGroupUserList, paidDate } = this.data
    const self = this
    const tempContainUser = []
    currentGroupUserList.forEach(item => {
      if (item.checked) {
        tempContainUser.push(item.openId)
      }
    })
    wx.cloud.callFunction({
      name: 'editProject',
      data: {
        projectPrice,
        projectTitle,
        paidDate,
        containUser: tempContainUser,
        projectId: targetProject._id,
        billId: currentBill._id,
        lastProjectPrice: targetProject.price
      },
      success (res) {
        Notify({
          text: '修改成功',
          duration: 1500,
          selector: '#bill-notify-selector',
          backgroundColor: '#28a745'
        })
        self.setData({
          showAddProjectSheet: false,
          activeCollapse: [],
          projectPrice: '',
          projectTitle: '',
          isEditProject: false
        })
        self.getProject()
        self.getBillLatest()
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
  goToResult () {
    wx.navigateTo({
      url: `/pages/result/result?billId=${this.data.currentBill._id}`,
    })
  },
  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})