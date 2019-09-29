// pages/ImgToText/ImgToText.js
Page({
  //页面的初始数据
  data: {
    text: "",
    displayCopyTBL: 'none',
    displayAD: 'none'
    // displayCopyTBL: 'inline-block'
  },

  uploadImg: function () {
    var that = this
    wx.chooseImage({
      success(res) {
        const tempFilePaths = res.tempFilePaths
        // 赋值
        that.setData({
          text: "上传中...",
          displayCopyTBL: 'none'
        })

        // 调用云调用-图片审核
        wx.getFileSystemManager().readFile({
          filePath: tempFilePaths[0],

          success: buffer => {
            console.log(buffer);
            // 调用云调用
            wx.cloud.callFunction({
              name: 'openapi',
              data: {
                action: 'imgSecCheck',
                value: buffer.data
              }

            }).then(imgRes => {
              console.log(imgRes);
              if (imgRes.result.errCode == '87014') {
                wx.showToast({
                  title: '图片含有违法违规内容',
                  icon: 'none'
                })
                // 提示重新上传
                that.setData({
                  text: "请重新上传图片"
                })

              } else {
                //图片正常
                console.log("图片正常")
                // 上传图片
                wx.uploadFile({
                  url: 'https://www.xinxueshuo.top/cs/ImgToTextC/handWriting_ImgToText', // 仅为示例，非真实的接口地址
                  filePath: tempFilePaths[0],
                  name: 'file',
                  formData: {
                    type: "test/ImgToText/img/"
                  },
                  success(res) {
                    // console.log(res);
                    var jsonData=JSON.parse(res.data)
                    // 赋值
                    that.setData({
                      text: jsonData.data,
                      displayCopyTBL: 'inline-block',
                      displayAD:''
                    })

                  }
                })
                
              }
              }).catch(err => {
                console.log(err);
              })
          }, fail: e => {
            console.error(e)
          }
        })

      }
    })
  },


  // 一键复制
  copyTBL: function () {
    var that = this
    wx.setClipboardData({
      data: that.data.text,
      success: function (res) {
        wx.showToast({
          title: '复制成功',
          icon: 'success',
          duration: 1500
        })

        // 在页面中定义插屏广告
        let interstitialAd = null
        // 在页面onLoad回调事件中创建插屏广告实例
        if (wx.createInterstitialAd) {
          interstitialAd = wx.createInterstitialAd({
            adUnitId: 'adunit-e31ffec08cdc9366'
          })
          interstitialAd.onLoad(() => { })
          interstitialAd.onError((err) => { })
          interstitialAd.onClose(() => { })
        }
        // 在适合的场景显示插屏广告
        if (interstitialAd) {
          interstitialAd.show().catch((err) => {
            console.error(err)
          })
        }

        
      }
    })
  },

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

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    wx.setNavigationBarTitle({
      title: '拍照转文字 | 手写文字识别'
    })

  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {


    // 在页面中定义插屏广告
    let interstitialAd = null
    // 在页面onLoad回调事件中创建插屏广告实例
    if (wx.createInterstitialAd) {
      interstitialAd = wx.createInterstitialAd({
        adUnitId: 'adunit-e31ffec08cdc9366'
      })
      interstitialAd.onLoad(() => { })
      interstitialAd.onError((err) => { })
      interstitialAd.onClose(() => { })
    }
    // 在适合的场景显示插屏广告
    if (interstitialAd) {
      interstitialAd.show().catch((err) => {
        console.error(err)
      })
    }
    
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

  onTabItemTap(item) {
    
    console.log("tab切换：" + item)
    wx.showLoading({
      title: '加载中',
    })

    setTimeout(function () {
      wx.hideLoading()
    }, 500)

    // 在页面中定义插屏广告
    let interstitialAd = null

    // 在页面onLoad回调事件中创建插屏广告实例
    if (wx.createInterstitialAd) {
      interstitialAd = wx.createInterstitialAd({
        adUnitId: 'adunit-e31ffec08cdc9366'
      })
      interstitialAd.onLoad(() => { })
      interstitialAd.onError((err) => { })
      interstitialAd.onClose(() => { })
    }

    // 在适合的场景显示插屏广告
    if (interstitialAd) {
      interstitialAd.show().catch((err) => {
        console.error(err)
      })
    }

  },



})