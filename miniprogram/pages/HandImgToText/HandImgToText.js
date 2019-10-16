// pages/ImgToText/ImgToText.js
var util = require('../../utils/util.js')

Page({
  //页面的初始数据
  data: {
    text: "",
    displayCopyTBL: 'none',
    displayAD: 'display:none',
    imgPath: ""
    // displayCopyTBL: 'inline-block'
  },

  // 入口选项
  uploadImg: function () {
    var that = this;
    // 选项
    wx.showActionSheet({
      itemList: ['相机', '相册选择', '微信聊天'],
      success(res) {
        // 选择相机
        if (res.tapIndex == 0) { that.chooseCamera(); }
        // 选择图库
        if (res.tapIndex == 1) { that.chooseImage(); }
        // 选择微信会话
        if (res.tapIndex == 2) { that.chooseMessage(); }
      },
      fail(res) {
        console.log(res.errMsg)
      }
    })
  },

  //选择照相机
  chooseCamera: function () {

    Promise.resolve()
      .then(this.wx_chooseCamera)
      .then(this.wx_compressImage)
      .then(this.wx_getFileSystemManager_readFile)
      .then(this.wx_cloud_callFunction)
      .then(this.wx_uploadFile)
 

  },
  //选择图库
  chooseImage: function () {

    Promise.resolve()
      .then(this.wx_chooseImage_gallery)
      .then(this.wx_compressImage)
      .then(this.wx_getFileSystemManager_readFile)
      .then(this.wx_cloud_callFunction)
      .then(this.wx_uploadFile)

  },
  //选择微信会话
  chooseMessage: function () {

    Promise.resolve()
      .then(this.wx_chooseImage_wechat)
      .then(this.wx_compressImage)
      .then(this.wx_getFileSystemManager_readFile)
      .then(this.wx_cloud_callFunction)
      .then(this.wx_uploadFile)

  },


  // ------------子函数----------

  // 选择图片——相机
  wx_chooseCamera: function () {
    return new Promise((resolve, reject) => {
      var that = this;
      var util_wx_chooseImage = util.wxPromisify(wx.chooseImage)
      util_wx_chooseImage({
        count: 1,
        sourceType: ['camera'],
      }).then(function (res) {
        console.log(res)
        // 赋值
        that.setData({
          text: "上传中...",
          displayCopyTBL: 'none',
          imgPath: res.tempFilePaths[0]
        })
        // 输出
        resolve(res.tempFilePaths[0]);
      }).catch(function (res) {
        console.error(res)
      })
    });
  },
  // 选择图片——图库
  wx_chooseImage_gallery: function () {
    return new Promise((resolve, reject) => {
      var that = this;
      var util_wx_chooseImage = util.wxPromisify(wx.chooseImage)
      util_wx_chooseImage({
        count: 1,
      }).then(function (res) {
        console.log(res)
        // 赋值
        that.setData({
          text: "上传中...",
          displayCopyTBL: 'none',
          imgPath: res.tempFilePaths[0]
        })
        // 输出
        resolve(res.tempFilePaths[0]);
      }).catch(function (res) {
        console.error(res)
      })
    });
  },
  // 选择图片——微信会话
  wx_chooseImage_wechat: function () {
    return new Promise((resolve, reject) => {
      var that = this;
      var util_wx_MessageFile = util.wxPromisify(wx.chooseMessageFile)

      util_wx_MessageFile({
        count: 1,
        type: 'image',
      }).then(function (res) {
        console.log(res)
        // 赋值
        that.setData({
          text: "上传中...",
          displayCopyTBL: 'none',
          imgPath: res.tempFiles[0].path
        })
        // 输出
        resolve(res.tempFiles[0].path);
      }).catch(function (res) {
        console.error(res)
      })
    });
  },


  // 图片压缩
  wx_compressImage: function (tempFilePaths) {
    return new Promise((resolve, reject) => {
      var util_wx_compressImage = util.wxPromisify(wx.compressImage)
      util_wx_compressImage({
        src: tempFilePaths, // 图片路径
        quality: 5, // 压缩质量
      }).then(function (res) {
        console.log(res)
        console.log(res.tempFilePath)
        // 输出
        resolve(res.tempFilePath);
      }).catch(function (res) {
        console.error(res)
      })

    })
  },

  // 读取图片文件
  wx_getFileSystemManager_readFile: function (imagePath) {
    return new Promise((resolve, reject) => {
      var util_wx_FileSystem_readFile = util.wxPromisify(wx.getFileSystemManager().readFile)
      util_wx_FileSystem_readFile({
        filePath: imagePath,
      }).then(function (buffer) {
        console.log(buffer);
        resolve(buffer.data)
      }).catch(function (res) {
        console.error(res)
      })
    })
  },

  // 云调用：审核图片
  wx_cloud_callFunction: function (buffer) {
    var that = this
    return new Promise((resolve, reject) => {
      wx.cloud.callFunction({
        name: 'openapi',
        data: {
          action: 'imgSecCheck',
          value: buffer
        }
      }).then(res => {
        console.log(res)
        if (res.result.errCode == '87014') {
          wx.showToast({
            title: '图片含有违法违规内容',
            icon: 'none'
          })
          // 提示重新上传
          that.setData({
            text: "请重新上传图片"
          })
          reject()
        } else {
          resolve()
        }
      }).catch(err => {
        console.error(err)
        // 赋值
        that.setData({
          text: "图片过大，请编辑剪裁后重新识别！",
          displayCopyTBL: 'none',
        })
      })
    })
  },

  // 上传文件-识别文字
  wx_uploadFile: function () {
    var that = this;
    return new Promise((resolve, reject) => {
      console.log("---进入上传文件步骤---")
      console.log(that.data.imgPath)
      // 上传图片
      wx.uploadFile({
        url: 'https://www.xinxueshuo.top/cs/ImgToTextC/handWriting_ImgToText', // 仅为示例，非真实的接口地址
        filePath: that.data.imgPath,
        name: 'file',
        formData: {
          type: "test/ImgToText/img/"
        },
        success(res) {
          console.log(res);
          var jsonData = JSON.parse(res.data)
          // 赋值
          that.setData({
            text: jsonData.data,
            displayCopyTBL: 'inline-block',
            displayAD: ''
          })
        },fail(res){
          console.log(res)
          // 赋值
          that.setData({
            text: "图片过大，请编辑剪裁后重新识别！",
            displayCopyTBL: 'none',
          })
        
        }
      })
      console.log("---上传文件结束---")
    })
  },






// ----------------------旧函数----------------------



  uploadImg_old: function () {
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

  // 赞赏
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


    // // 在页面中定义插屏广告
    // let interstitialAd = null
    // // 在页面onLoad回调事件中创建插屏广告实例
    // if (wx.createInterstitialAd) {
    //   interstitialAd = wx.createInterstitialAd({
    //     adUnitId: 'adunit-e31ffec08cdc9366'
    //   })
    //   interstitialAd.onLoad(() => { })
    //   interstitialAd.onError((err) => { })
    //   interstitialAd.onClose(() => { })
    // }
    // // 在适合的场景显示插屏广告
    // if (interstitialAd) {
    //   interstitialAd.show().catch((err) => {
    //     console.error(err)
    //   })
    // }
    
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

  //页面切换 插屏广告
  onTabItemTap(item) {
    
    console.log("tab切换：" + item)
    wx.showLoading({
      title: '加载中',
    })

    setTimeout(function () {
      wx.hideLoading()
    }, 500)

    // // 在页面中定义插屏广告
    // let interstitialAd = null

    // // 在页面onLoad回调事件中创建插屏广告实例
    // if (wx.createInterstitialAd) {
    //   interstitialAd = wx.createInterstitialAd({
    //     adUnitId: 'adunit-e31ffec08cdc9366'
    //   })
    //   interstitialAd.onLoad(() => { })
    //   interstitialAd.onError((err) => { })
    //   interstitialAd.onClose(() => { })
    // }

    // // 在适合的场景显示插屏广告
    // if (interstitialAd) {
    //   interstitialAd.show().catch((err) => {
    //     console.error(err)
    //   })
    // }

  },



})