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
    userInfoFromCloud: {}
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    console.log('app in billDetail', app)
    const self = this
    wx.showLoading({
      title: '正在加载...',
    })
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
      },
      complete () {
        wx.hideLoading()
      }
    })
  },
  // 结算账单
  onSubmitBill (event) {
    console.log(event)
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
          console.log('更新状态成功')
          // 删除提示
          Notify({
            text: '账单已结算',
            duration: 1500,
            selector: '#bill-notify-selector',
            backgroundColor: '#28a745'
          })
          self.setData({
            currentBill: {
              ended: true
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
          console.log('更新状态成功', res)
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
  onRecoverBill () {

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
    console.log('clickProject', clickProject)
    this.data.currentGroupUserList.forEach((user, index) => {
      clickProject.containUser.forEach(item => {
        if (user.openId === item.openId) {
          this.data.currentGroupUserList[index].checked = true
        }
      })
    })
    console.log('打印结果', this.data.currentGroupUserList)
    self.setData({
      showAddProjectSheet: true,
      projectTitle: clickProject.title,
      projectPrice: clickProject.price,
      currentGroupUserList: this.data.currentGroupUserList
    })
  },
  deleteProject (event) {
    const projectInfo = event.currentTarget.dataset.item
    const self =this
    console.log("呼啦啦啦", event)
    Dialog.confirm({
      message: `确定要删除【${event.currentTarget.dataset.item.title}】？`,
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
  showUserName(event) {
    console.log(event)
    wx.showToast({
      title: event.currentTarget.dataset.user.nickName,
      icon: 'none'
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
    this.data.currentGroupUserList.forEach((user, index) => {
      this.data.currentGroupUserList[index].checked = true
    })

    this.setData({
      showAddProjectSheet: false,
      projectPrice: '',
      projectTitle: '',
      currentGroupUserList: this.data.currentGroupUserList
    })
  },
  comfirmAddProject () {
    const { projectTitle, projectPrice, currentGroupUserList, currentGroupInfo, currentBill, paidDate } = this.data
    console.log('提交', projectTitle, projectPrice, currentGroupUserList, paidDate)
    const self = this
    if (projectTitle=== '') {
      Notify({
        text: '请输入支出项标题',
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