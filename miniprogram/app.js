//app.js
App({
  onLaunch: function (options) {
    const self = this
    if (!wx.cloud) {
      console.error('请使用 2.2.3 或以上的基础库以使用云能力')
    } else {
      wx.cloud.init({
        traceUser: true,
      })
    }
    console.log("在app.js", options)
    this.globalData.shareParam = options.query
    // 查看是否授权
    wx.getSetting({
      success (settingRes) {
        // 已经授权
        if (settingRes.authSetting['scope.userInfo']) {
          wx.getUserInfo({
            success (infoRes) {
              self.globalData.userInfo = infoRes.userInfo
              if (self.catchUserInfo) {
                self.catchUserInfo(infoRes.userInfo)
              }
            }
          })
        } else {
          console.log('测试', `/pages/login/login?back=${options.path.split('/')[1]}`)
          wx.redirectTo({
            url: `/pages/login/login?back=${options.path.split('/')[1]}`,
          })
        }
      }
    })
  },
  globalData: {
    currentGroupInfo: null,
    currentGroupUserList: [],
    currentBill: null,
    userInfo: null,
    shareParam: null,
    billId: '', // 用于展示结果的billid
  }
})
