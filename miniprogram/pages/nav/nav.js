Component({
  options: {
    multipleSlots: true
  },
  properties: {
    bgColor: {
      type: String,
      value: 'rgba(0,0,0,0)'
    },
    showIcons: {
      type: Array
    }
  },
  data: {
    showLoadingIcon: false,
    showBackIcon: false,
    showHomeIcons: false,
    isEscape: getApp().globalData.isEscape
  },
  ready() {
    let {
      statusBarHeight,
      navBarHeight
    } = getApp().globalData
    const { showIcons } = this.data
    this.setData({
      statusBarHeight,
      navBarHeight,
      showBackIcon: showIcons.includes('back'),
      showHomeIcons: showIcons.includes('home')
    })
  },
  attached() {
  },
  detached() {
    this.hideLoading()
  },
  methods: {
    back() {
      wx.navigateBack({
        delta: 1
      })
    },
    /**
   * 开始旋转
   */
    showLoading() {
      var that = this;
      this.setData({
        showLoadingIcon: true
      })
    },

    /**
     * 停止旋转
     */
    hideLoading() {
      this.setData({
        showLoadingIcon: false
      })
    },
    goTo(event) {
      const { page } = event.currentTarget.dataset
      wx.navigateTo({
        url: `/pages/${page}/${page}`
      })
    },
    inDev() {
      wx.showToast({
        title: '功能正在开发中...',
        icon: 'none'
      })
    },
    newGroup() {
      getCurrentPages()[0].showNewGroupModal()
    }
  }
})