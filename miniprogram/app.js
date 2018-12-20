//app.js
App({
  onLaunch: function () {
    const self = this
    if (!wx.cloud) {
      console.error('请使用 2.2.3 或以上的基础库以使用云能力')
    } else {
      wx.cloud.init({
        traceUser: true,
      })
    }
    // 查看是否授权
    wx.getSetting({
      success (settingRes) {
        // 已经授权
        if (settingRes.authSetting['scope.userInfo']) {
          wx.getUserInfo({
            success (infoRes) {
              self.globalData.userInfo = infoRes.userInfo
            }
          })
        } else {
          wx.redirectTo({
            url: '/pages/login/login?back=index',
          })
        }
      }
    })
  },
  globalData: {
    currentGroupInfo: null,
    currentGroupUserList: [],
    currentBill: null,
    userInfo: null
  }
})
