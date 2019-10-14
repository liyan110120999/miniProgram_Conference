// pages/ImgToText/ImgToText.js
var util = require('../../utils/util.js')

Page({
  //页面的初始数据
  data: {
    text:"",
    displayCopyTBL:'none',
    displayAD: 'display:none'
    // displayCopyTBL: 'inline-block'
  },

  // 入口选项
  uploadImg: function () {
    var that = this;
    // 选项
    wx.showActionSheet({
      itemList: ['相机','相册选择','微信聊天'],
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



// promise测试 选择照相机
  chooseCamera02: function () {

    Promise.resolve()
      .then(this.wx_chooseImage)
      .then(this.test02);
  },

  // 微信选择图片
  wx_chooseImage: function () {
    return new Promise((resolve, reject) => {
      var util_wx_chooseImage = util.wxPromisify(wx.chooseImage)
      util_wx_chooseImage({
        count: 1,
        sourceType: ['camera'],
      }).then(function (res) {
        console.log("then:res::")
        console.log(res)
        // 赋值
        that.setData({
          text: "上传中...",
          displayCopyTBL: 'none'
        })
        // 输出
        resolve(res.tempFilePaths[0]);
      }).catch(function (res) {
        console.error("catch:res::")
        console.log(res)
      })
    });
  },

  // 图片压缩
  wx_compressImage:function(){
    return new Promise((resolve,reject) =>{
      var util_wx_compressImage = util.wxPromisify(wx.compressImage)
      util_wx_compressImage({
        src: tempFilePaths[0], // 图片路径
        quality: 5, // 压缩质量
      })

    })
  },




  test02: function (data) {
    return new Promise((resolve, reject) => {
      console.log("test02:start")
      if (resolve) {
        console.log("test02:resolve::")
        console.log(data)
        resolve(data);
      } else {
        throw new Error("throw Error @ task1");
      }
    });
  },
















  // 选择照相机
  chooseCamera:function(){
    var that = this;
    wx.chooseImage({
      count: 1,
      sourceType: ['camera'],
      success(res) {
        const tempFilePaths = res.tempFilePaths
        // 赋值
        that.setData({
          text: "上传中...",
          displayCopyTBL: 'none'
        })

        // 图片压缩
        wx.compressImage({
          src: tempFilePaths[0], // 图片路径
          quality: 5, // 压缩质量
          success: function (res) {
            console.log("压缩后地址"+res.tempFilePath)

            const compressImagePaths = res.tempFilePath;
            

            // 调用云调用-图片审核
            wx.getFileSystemManager().readFile({
              // filePath: tempFilePaths[0],
              filePath: compressImagePaths,
              success: buffer => {
                console.log("buffer::");
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
                        url: 'https://data.xinxueshuo.cn/nsi-1.0/manager/talent/upload.do', // 仅为示例，非真实的接口地址
                        filePath: tempFilePaths[0],
                        name: 'file',
                        formData: {
                          type: "test/ImgToText/img/"
                        },
                        success(res) {
                          // 赋值
                          that.setData({
                            text: "数据提取中..."
                          })
                          console.log(res);
                          var jsonStringUrl = JSON.parse(res.data).data.url
                          var newjsonStringUrl = "http" + jsonStringUrl.slice(5)
                          console.log(newjsonStringUrl)
                          // 发送请求
                          wx.request({
                            url: 'https://www.xinxueshuo.top/cs/ImgToTextC/General_ImgToText',
                            data: {
                              link: newjsonStringUrl,
                            },
                            header: {
                              'content-type': 'application/json' // 默认值
                            },
                            success(res) {
                              console.log(res.data.data)
                              var TextString = JSON.parse(res.data.data)
                              console.log(TextString.words_result)
                              var wordsArrayString = ""
                              for (var i = 0; i < TextString.words_result.length; i++) {
                                console.log(TextString.words_result[i].words)
                                // 赋值
                                wordsArrayString = wordsArrayString + TextString.words_result[i].words + "\n"
                              }
                              console.log("TextString:" + TextString)
                              // 赋值
                              that.setData({
                                text: wordsArrayString,
                                displayCopyTBL: 'inline-block',
                                displayAD: ''
                              })
                            }
                            , fail(res) {
                              wx.reportMonitor('1', res)
                            }
                          })
                        },
                        fail(res) {
                          wx.reportMonitor('0', res)
                        }

                      })
                    }
                  }).catch(err => { console.log("审核错误");  console.log(err);
                  })
              }, fail:e => { console.log("文件读取错误::"); console.error(e) }

            })








            // 结束-图片压缩
          }
          ,fail: function (res) {
            console.log("压缩错误")
            console.log(res)
          }
        })
   
        // // 调用云调用-图片审核
        // wx.getFileSystemManager().readFile({
        //   filePath: tempFilePaths[0],
        //   success: buffer => {
        //     console.log(buffer);

        //     // 调用云调用
        //     wx.cloud.callFunction({
        //       name: 'openapi',
        //       data: {
        //         action: 'imgSecCheck',
        //         value: buffer.data
        //       }

        //     }).then(imgRes => {
        //       console.log(imgRes);
        //       if (imgRes.result.errCode == '87014') {
        //         wx.showToast({
        //           title: '图片含有违法违规内容',
        //           icon: 'none'
        //         })
        //         // 提示重新上传
        //         that.setData({
        //           text: "请重新上传图片"
        //         })

        //       } else {
        //         //图片正常
        //         console.log("图片正常")
        //         // 上传图片
        //         wx.uploadFile({
        //           url: 'https://data.xinxueshuo.cn/nsi-1.0/manager/talent/upload.do', // 仅为示例，非真实的接口地址
        //           filePath: tempFilePaths[0],
        //           name: 'file',
        //           formData: {
        //             type: "test/ImgToText/img/"
        //           },
        //           success(res) {
        //             // 赋值
        //             that.setData({
        //               text: "数据提取中..."
        //             })
        //             console.log(res);
        //             var jsonStringUrl = JSON.parse(res.data).data.url
        //             var newjsonStringUrl = "http" + jsonStringUrl.slice(5)
        //             console.log(newjsonStringUrl)
        //             // 发送请求
        //             wx.request({
        //               url: 'https://www.xinxueshuo.top/cs/ImgToTextC/General_ImgToText',
        //               data: {
        //                 link: newjsonStringUrl,
        //               },
        //               header: {
        //                 'content-type': 'application/json' // 默认值
        //               },
        //               success(res) {
        //                 console.log(res.data.data)
        //                 var TextString = JSON.parse(res.data.data)
        //                 console.log(TextString.words_result)
        //                 var wordsArrayString = ""
        //                 for (var i = 0; i < TextString.words_result.length; i++) {
        //                   console.log(TextString.words_result[i].words)
        //                   // 赋值
        //                   wordsArrayString = wordsArrayString + TextString.words_result[i].words + "\n"
        //                 }
        //                 console.log("TextString:" + TextString)
        //                 // 赋值
        //                 that.setData({
        //                   text: wordsArrayString,
        //                   displayCopyTBL: 'inline-block',
        //                   displayAD: ''
        //                 })
        //               }
        //               , fail(res) {
        //                 wx.reportMonitor('1', res)
        //               }
        //             })
        //           },
        //           fail(res) {
        //             wx.reportMonitor('0', res)
        //           }

        //         })
        //       }
        //     }).catch(err => {
        //       console.log(err);
        //     })
        //   }, fail: e => {
        //     console.error(e)
        //   }
        // })

      }
    })
  },



  // 选择图库
  chooseImage:function(){
    var that = this;
    wx.chooseImage({
      count: 1,
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

                wx.uploadFile({
                  url: 'https://data.xinxueshuo.cn/nsi-1.0/manager/talent/upload.do', // 仅为示例，非真实的接口地址
                  filePath: tempFilePaths[0],
                  name: 'file',
                  formData: {
                    type: "test/ImgToText/img/"
                  },
                  success(res) {
                    // 赋值
                    that.setData({
                      text: "数据提取中..."
                    })
                    console.log(res);
                    var jsonStringUrl = JSON.parse(res.data).data.url
                    var newjsonStringUrl = "http" + jsonStringUrl.slice(5)
                    console.log(newjsonStringUrl)
                    // 发送请求
                    wx.request({
                      url: 'https://www.xinxueshuo.top/cs/ImgToTextC/General_ImgToText',
                      data: {
                        link: newjsonStringUrl,
                      },
                      header: {
                        'content-type': 'application/json' // 默认值
                      },
                      success(res) {
                        console.log(res.data.data)
                        var TextString = JSON.parse(res.data.data)
                        console.log(TextString.words_result)

                        var wordsArrayString = ""
                        for (var i = 0; i < TextString.words_result.length; i++) {
                          console.log(TextString.words_result[i].words)
                          // 赋值
                          wordsArrayString = wordsArrayString + TextString.words_result[i].words + "\n"
                        }
                        console.log("TextString:" + TextString)
                        // 赋值
                        that.setData({
                          text: wordsArrayString,
                          displayCopyTBL: 'inline-block',
                          displayAD: ''
                        })
                      },
                      fail(res) {
                        wx.reportMonitor('1', res)
                      }
                    })
                  },
                  fail(res) {
                    wx.reportMonitor('0', res)
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



  // 选择微信会话
  chooseMessage: function () {
    var that = this;
    wx.chooseMessageFile({
      count: 1,
      type: 'image',
      success(res) {
        // console.log(res);
        console.log("success-res:" + res.tempFiles[0].path);
        const tempFilePaths = res.tempFiles[0].path
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

                wx.uploadFile({
                  url: 'https://data.xinxueshuo.cn/nsi-1.0/manager/talent/upload.do', // 仅为示例，非真实的接口地址
                  // filePath: tempFilePaths[0],
                  filePath: tempFilePaths,
                  name: 'file',
                  formData: {
                    type: "test/ImgToText/img/"
                  },
                  success(res) {
                    // 赋值
                    that.setData({
                      text: "数据提取中..."
                    })
                    console.log(res);
                    var jsonStringUrl = JSON.parse(res.data).data.url
                    var newjsonStringUrl = "http" + jsonStringUrl.slice(5)
                    console.log(newjsonStringUrl)
                    // 发送请求
                    wx.request({
                      url: 'https://www.xinxueshuo.top/cs/ImgToTextC/General_ImgToText',
                      data: {
                        link: newjsonStringUrl,
                      },
                      header: {
                        'content-type': 'application/json' // 默认值
                      },
                      success(res) {
                        console.log(res.data.data)
                        var TextString = JSON.parse(res.data.data)
                        console.log(TextString.words_result)

                        var wordsArrayString = ""
                        for (var i = 0; i < TextString.words_result.length; i++) {
                          console.log(TextString.words_result[i].words)
                          // 赋值
                          wordsArrayString = wordsArrayString + TextString.words_result[i].words + "\n"
                        }
                        console.log("TextString:" + TextString)
                        // 赋值
                        that.setData({
                          text: wordsArrayString,
                          displayCopyTBL: 'inline-block',
                          displayAD: ''
                        })
                      },
                      fail(res) {
                        wx.reportMonitor('1', res)
                      }
                    })
                  },
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
  copyTBL:function () {
    var that = this
    wx.setClipboardData({
      data:that.data.text,
      success: function (res) {
        wx.showToast({
          title: '复制成功',
          icon: 'success',
          duration: 1500
        })
      }
    })
  },

  //跳转赞赏
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
        title: '拍照转文字 | 通用文字识别'
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
    console.log(" onPullDownRefresh")
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
    console.log(item.index)
    wx.showLoading({
      title: '加载中',
    })
    setTimeout(function () {
      wx.hideLoading()
    }, 500)

    console.log("tab切换：" + item)


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