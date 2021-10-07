//app.js
App({
  onLaunch: function (options) {
    const self = this
    if (!wx.cloud) {
      // eslint-disable-next-line no-console
      console.error('请使用 2.2.3 或以上的基础库以使用云能力')
    } else {
      wx.cloud.init({
        traceUser: true,
        // env: 'account-release-73522d', // 测试环境
        env: 'gzhiyi-154dd4', // 正式环境
      })
    }
    // 判断是否在审核期间
    const nowTime = Date.parse(new Date())
    if (nowTime < 1633600800000) { // 2021-10-07 18:00:00
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
    this.checkLogin(options)
  },
  checkAuth() {
    const isLogin =  !!this.globalData.userInfoFromCloud
    if (!isLogin) {
      wx.reLaunch({
        url: `/pages/login/login`
      })
    }
    return isLogin
  },
  checkLogin(options) {
    console.log(options);
    const self = this
    wx.cloud.callFunction({
      name: 'createUser',
      data: {
        mode: 'check'
      },
      success(res) {
        // 未保存信息
        if (res.result.code === 0) {
          let query = ''
          Object.keys(options.query).forEach(key => {
            query += `${key}=${options.query[key]}&`
          })
          console.log('/' + options.path + '?' + query);
          wx.reLaunch({
            url: `/pages/login/login?back=${encodeURIComponent('/' + options.path + '?' + query)}`
          })
        } else {
          // 已有信息
          self.globalData.userInfoFromCloud = res.result.data
        }
      }
    })
  },
  setTheme(page) {
    const storeTheme = wx.getStorageSync('theme') || 'yellow-skin'
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
      return `你的好友${this.userInfoFromCloud.nickName}在用这个AA记账，你也来试试吧 (๑>◡<๑) `
    },
    sharePath: '/pages/group/group',
    imageUrl: 'https://images.vrm.cn/2019/07/06/banner-new.png',
    isEscape: true,
    skin: {
      colorList: [
        {
          bg0: 'rgb(255, 232, 59)',
          type: 'yellow-skin'
        },
        {
          bg0: '#F2F2F2',
          type: 'white-skin'
        },
        {
          bg0: '#7BB2D9',
          type: 'blue-skin'
        }, {
          bg0: '#60837F',
          type: 'green-skin'
        }, {
          bg0: '#AE303F',
          type: 'red-skin'
        }, {
          bg0: '#6B60C8',
          type: 'purple-skin'
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
