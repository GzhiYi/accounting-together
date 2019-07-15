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
    billList: null,
    groupCreateTime: null,
    userInfoFromCloud: {},
    loadingLeave: false,
    showAvatarMenu: false,
    menuUser: {},
    loadingUpdateNote: false,
    editGroupModal: false,
    groupName: '',
    isEscape: getApp().globalData.isEscape,
    exactArray: [],
    theme: 'white-skin'
  },
  onLoad: function (options) {
    // 获取再app.js中拿到的用户信息
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

  callNewBill(event) {
    const self = this
    if (event.detail === 'confirm') {
      if (this.data.billName === '') {
        Notify({
          text: '又忘记起名了?',
          duration: 1500,
          selector: '#notify-selector',
          backgroundColor: '#dc3545'
        })
        self.setData({
          newBillModal: true
        })
        self.selectComponent("#new-bill-modal").stopLoading()
        return
      } else {
        wx.cloud.callFunction({
          name: 'createBill',
          data: {
            billName: this.data.billName,
            groupId: this.data.groupInfo._id
          },
          success(res) {
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
                self.setData({
                  billList: res.result
                })
              }
            })
          },
          fail(error) {
            // console.log('错误', error)
          }
        })
      }
    } else {
      this.setData({
        newBillModal: false
      })
    }

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
      // console.log("错误", error)
    });
  },
  // 跳转到bill详情页面
  goToBillDetail (event) {
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
    const self = this
    getApp().setTheme(this)
    self.getLatestData()
  },
  getLatestData () {
    const { currentGroupInfo } = getApp().globalData
    const self = this
    getApp().showLoading(self)
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
          const userList = res.result.reverse()
          self.setData({
            userList,
            exactArray: new Array((parseInt((userList.length / 5)) + 1) * 5 - userList.length)
          })
          // 向globalData 赋值一个含有备注的用户obj
          const userRemark = {}
          userList.forEach(item => {
            if (item.note) {
              userRemark[`${item.openId}`] = item.note
            }
          })
          app.globalData.currentGroupUserList = userList
          app.globalData.userRemark = userRemark
        }
      })
      wx.cloud.callFunction({
        name: 'getBill',
        data: {
          groupId: currentGroupInfo._id
        },
        success(res) {
          self.setData({
            billList: res.result
          })
        },
        complete() {
          getApp().hideLoading(self)
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
    this.setData({
      showAvatarMenu: true,
      menuUser: event.currentTarget.dataset.user
    })
  },
  leaveGroup () {
    Dialog.confirm({
      message: `确定要离开群组吗？`,
      selector: '#confirm-leave-group'
    }).then(() => {
      const { groupInfo } = this.data
      const self = this
      self.setData({
        loadingLeave: true
      })
      wx.cloud.callFunction({
        name: 'leaveGroup',
        data: {
          relateUserGroupId: groupInfo.relateUserGroupId
        },
        success(res) {
          Notify({
            text: '悄悄的我走了，正如我悄悄的来',
            duration: 1500,
            selector: '#notify-selector',
            backgroundColor: '#28a745'
          })
          setTimeout(() => {
            wx.navigateBack()
          }, 1500)
        },
        complete() {
          self.setData({
            loadingLeave: false
          })
        }
      })
    })
  },
  dropGrouUser () {
    const self = this
    this.setData({
      showAvatarMenu: false
    })
    Dialog.confirm({
      message: `确定将其移出群组吗？`,
      selector: '#confirm-drop-group'
    }).then(() => {
      const { groupInfo, menuUser } = this.data
      const self = this
      self.setData({
        loadingLeave: true
      })
      wx.cloud.callFunction({
        name: 'leaveGroup',
        data: {
          menuUser,
          groupInfo
        },
        success(res) {
          Notify({
            text: `成功移除${menuUser.nickName}`,
            duration: 1500,
            selector: '#notify-selector',
            backgroundColor: '#28a745'
          })
          self.getLatestData()
        },
        complete() {
          self.setData({
            loadingLeave: false
          })
        }
      })
    })
  },
  closeDropGrouUser () {
    this.setData({
      showAvatarMenu: false
    })
  },
  onNoteChange (event) {
    let menuUser = this.data.menuUser
    menuUser.nickName = event.detail
    this.setData({
      menuUser
    })
  },
  updateNote() {
    const { menuUser } = this.data
    const self = this
    // 只好调用扩展的云函数
    if (menuUser.nickName && menuUser.nickName !== '') {
      self.setData({
        loadingUpdateNote: true
      })
      wx.cloud.callFunction({
        name: 'createFeedback',
        data: {
          extend: 'updateNote',
          newNote: menuUser.nickName,
          userGroupId: menuUser.userGroupId
        },
        success(res) {
          Notify({
            text: `备注已修改`,
            duration: 1500,
            selector: '#notify-selector',
            backgroundColor: '#28a745'
          })
          self.setData({
            showAvatarMenu: false
          })
          self.getLatestData()
        },
        complete() {
          self.setData({
            loadingUpdateNote: false
          })
        }
      })
    }
  },
  // 编辑群名
  editGroup () {
    this.setData({
      editGroupModal: true,
      groupName: this.data.groupInfo.name
    })
  },
  onGroupNameChange(event) {
    this.setData({
      groupName: event.detail
    })
  },
  confirmEditGroup (event) {
    const { groupInfo, groupName } = this.data
    const self = this
    if (event.detail === 'confirm') {
      wx.cloud.callFunction({
        name: 'createFeedback',
        data: {
          extend: 'editGroup',
          groupId: groupInfo._id,
          name: groupName
        },
        success(res) {
          groupInfo.name = groupName
          self.setData({
            groupName: '',
            groupInfo
          })
        },
        complete() {
          self.setData({
            editGroupModal: false
          })
        }
      })
    } else {
      this.setData({
        editGroupModal: false
      })
    }
  },
  onShareAppMessage: function () {
    const { groupInfo } = this.data
    const userInfo = app.globalData.userInfo
    if (getApp().globalData.isEscape) {
      return {
        title: `${userInfo.nickName}邀你加入【${groupInfo.name}】一起AA记账，快加入吧 (๑>◡<๑) `,
        path: `/pages/share/share?groupId=${groupInfo._id}&inviter=${userInfo.nickName}&avatarUrl=${userInfo.avatarUrl}&groupName=${groupInfo.name}`,
        imageUrl: getApp().globalData.imageUrl
      }
    }
    return {
      title: getApp().globalData.shareWord(),
      path: getApp().globalData.sharePath,
      imageUrl: getApp().globalData.imageUrl
    }
  }
})