// pages/goodby/goodby.js
Page({

  /**
   * 页面的初始数据
   */
  data: {

  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

  },
  copy() {
    wx.setClipboardData({
      data: 'https://github.com/GzhiYi/accounting-together',
      success(res) {
        wx.getClipboardData({
          success(inRes) {
            wx.showToast({
              title: '源码地址已复制，到浏览器打开吧～',
              icon: 'none',
              duration: 3000
            })
          }
        })
      }
    })
  },
  goHome() {
    wx.redirectTo({
      url: '/pages/group/group'
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

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})