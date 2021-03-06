// pages/record/record.js

// 在页面中定义激励视频广告
let videoAd = null

Page({
  /**
   * 页面的初始数据
   */
  data: {

  },

  // 打开其他小程序
  openMiniPro_AI:function(){
    wx.navigateToMiniProgram({
      appId: 'wx79e25b7ce97ad7cb',
      path: 'pages/AudioFileRecognition/AudioFileRecognition',
      extraData: {
        from: 'img2text'
      },
      envVersion: 'release',
      success(res) {
        // 打开成功
      }
    })
  },

  // 打开其他小程序
  openMiniPro_QR:function(){
    wx.navigateToMiniProgram({
      appId: 'wx8b22d5ff5df940bc',
      path: 'pages/index/index',
      extraData: {
        from: 'img2text'
      },
      envVersion: 'release',
      success(res) {
        // 打开成功
      }
    })
  },

  
  // 打开其他小程序
  openMiniPro_WaterMark:function(){
    wx.navigateToMiniProgram({
      appId: 'wx14e79d94ff818c64',
      path: 'pages/templateList/templateList',
      extraData: {
        from: 'img2text'
      },
      envVersion: 'release',
      success(res) {
        // 打开成功
      }
    })
  },

  // 跳转赞赏
  appreciate_button: function () {
    console.log("跳转赞赏")
    wx.navigateToMiniProgram({
      appId: 'wx18a2ac992306a5a4',
      path: 'pages/apps/largess/detail?id=fW9FX%2BE4yLU%3D',
      extraData: {},
      envVersion: 'release',
      success(res) {
        // 打开成功
      }
    })

  },

  // 展示视频广告
  showVideoAd:function(){
    videoAd.show()
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

    // 在页面onLoad回调事件中创建激励视频广告实例
    if (wx.createRewardedVideoAd) {
      videoAd = wx.createRewardedVideoAd({
        adUnitId: 'adunit-97b003f4a042d2b5'
      })
      videoAd.onLoad(() => { })
      videoAd.onError((err) => { })
      videoAd.onClose((res) => { })
    }

    // 用户触发广告后，显示激励视频广告
    // if (videoAd) {
    //   videoAd.show().catch(() => {
    //     // 失败重试
    //     videoAd.load()
    //       .then(() => videoAd.show())
    //       .catch(err => {
    //         console.log('激励视频 广告显示失败')
    //       })
    //   })
    // }
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
    return {
      title: '拍照转文字 | 图片识别文字 ',
      path: 'pages/ImgToText/ImgToText',
      imageUrl: 'http://nsi.oss-cn-zhangjiakou.aliyuncs.com/test/ImgToText/share/share.jpg',
      success: function (shareTickets) {
        console.info(shareTickets + '成功');
        // 转发成功
      },
      fail: function (res) {
        console.log(res + '失败');
        // 转发失败
      },
      complete: function (res) {
        // 不管成功失败都会执行
      }
    }
  },

     /**
   * 分享朋友圈
   */
  onShareTimeline: function (res) {
    return {
      title: '拍照转文字 | 图片识别文字 ',
      query:'Timeline',
      // path: 'pages/ImgToText/ImgToText',
      imageUrl: 'http://nsi.oss-cn-zhangjiakou.aliyuncs.com/test/ImgToText/share/share.jpg',
      success: function (shareTickets) {
        console.info(shareTickets + '成功');
        // 转发成功
      },
      fail: function (res) {
        console.log(res + '失败');
        // 转发失败
      },
      complete: function (res) {
        // 不管成功失败都会执行
      }
    }
  },

})