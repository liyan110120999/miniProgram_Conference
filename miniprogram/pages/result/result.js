// miniprogram/pages/result/result.js
var util = require('../../utils/util.js')

Page({

  data: {
    url:"",
    text:""
  },

  // 图片文字-通用识别
  req_imgToText: function (upImgUrl) {
    var that =this;
    that.setData({
      text:"加载中..."
    })
    wx.request({
      url: util.apiHost+'/cs/ImgToTextC/General_ImgToText',
      data: {
        link: upImgUrl,
      },
      header: {
        'content-type': 'application/json'
      },
      success(res) {
        console.log(res.data.data)
        if(res.data.code==0){
          that.setData({
            text:"识别错误，请重新尝试，或联系客服反馈",
          })
          return false;
        }
        var TextString = JSON.parse(res.data.data);
        var wordsArrayString = ""
        for (var i = 0; i < TextString.words_result.length; i++) {
          wordsArrayString = wordsArrayString + TextString.words_result[i].words + "\n"
        }
        // 赋值
        that.setData({
          text: wordsArrayString,
          displayCopyTBL: 'inline-block',
          displayAD: ''
        })
      },fail(res) {
        console.error(res)
        that.setData({
          text:"识别错误，请重新尝试，或联系客服反馈",
        })
      }
    })
  },

  backPage:function(){
    wx.navigateBack({
      delta: 1,
      fail(e){
        wx.switchTab({
          url: '../ImgToText/ImgToText',
        })
      }
    })
  },

  copyContent:function(){
    var that = this
    wx.setClipboardData({
      data:that.data.text,
      success: function (res) {
        console.log("复制成功");
      }
    })
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var that=this;
    console.log(options.url)
    let url=options.url;
    that.setData({
      url:url
    })
    that.req_imgToText(url);
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
  onShareAppMessage: function (res) {
    var that=this;
    return {
      title: '您的好友向你分享了一篇文档',
      path: 'pages/result/result?url='+that.data.url,
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
    var that=this;
    return {
      title: '拍照转文字 | 图片识别文字 ',
      query:'url='+that.data.url,
      imageUrl: 'http://nsi.oss-cn-zhangjiakou.aliyuncs.com/test/ImgToText/share/share.jpg',
      success: function (shareTickets) {
        console.info(shareTickets + '成功');
        // 转发成功
      },
      fail: function (res) {
        console.log(res + '失败'); // 转发失败
      },
      complete: function (res) {
        // 不管成功失败都会执行
      }
    }
  },
})