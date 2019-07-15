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
    // 判断是否在审核期间
    const nowTime = Date.parse(new Date())
    if (nowTime < 563181200000) {
      this.globalData.isEscape = false
    }
    // 查看主题设置
    this.globalData.skin.index = wx.getStorageSync('skin') || 0
    // 获取手机信息以配置顶栏
    wx.getSystemInfo({
      success: res => {
        this.globalData.statusBarHeight = res.statusBarHeight
        this.globalData.navBarHeight = 44 + res.statusBarHeight
        this.globalData.screenWidth = res.screenWidth
      }
    }) 
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
              // 如果是旧用户就更新信息
              wx.cloud.callFunction({
                name: 'createUser',
                data: {
                  avatarUrl: infoRes.userInfo.avatarUrl,
                  name: '',
                  nickName: infoRes.userInfo.nickName,
                  sex: infoRes.userInfo.gender
                }
              })
            }
          })
        } else {
          wx.reLaunch({
            url: `/pages/login/login?back=${options.path.split('/')[1]}`
          })
        }
      }
    })
    wx.cloud.callFunction({
      name: 'getUserInfo',
      data: {},
      success (res) {
        self.globalData.userInfoFromCloud = res.result.storeUser
      }
    })
  },
  setTheme(page) {
    const storeTheme = wx.getStorageSync('theme') || 'yellow-skin'
    console.log('hahah', page)
    page.setData({
      theme: storeTheme,
      selectType: storeTheme
    })
  },
  globalData: {
    currentGroupInfo: null,
    currentGroupUserList: [],
    currentBill: null,
    userInfo: null,
    shareParam: null,
    billId: '', // 用于展示结果的billid
    userInfoFromCloud: null,
    userRemark: {},
    statusBarHeight: 0,
    navBarHeight: 0,
    screenWidth: 0,
    isLoading: false,
    shareWord: function() {
      return `你的好友${this.userInfo.nickName}在用这个AA记账，你也来试试吧 (๑>◡<๑) `
    },
    sharePath: '/pages/group/group',
    imageUrl: 'https://images.vrm.cn/2019/07/06/banner-new.png',
    isEscape: true,
    skin: {
      colorList: [
        {
          bg0: 'rgb(255, 232, 59)',
          bg1: 'rgb(252, 241, 163)',
          bg2: 'rgb(255, 248, 198)',
          type: 'yellow-skin'
        },
        {
          bg0: '#F2F2F2',
          bg1: '#F3F3F3',
          bg2: '#fff',
          type: 'white-skin'
        },
        {
          bg0: '#7BB2D9',
          bg1: '#7BB2D9',
          bg02: '#7BB2D9',
          type: 'blue-skin'
        }, {
          bg0: '#60837F',
          bg1: 'rgb(156, 192, 188)',
          bg02: 'rgb(209, 236, 233)',
          type: 'green-skin'
        }
      ],
      index: 0
    }
  },
  showLoading(target) {
    const nav = target.selectComponent('.nav-instance')
    nav.showLoading()
  },
  hideLoading(target) {
    const nav = target.selectComponent('.nav-instance')
    nav.hideLoading()
  },
})
