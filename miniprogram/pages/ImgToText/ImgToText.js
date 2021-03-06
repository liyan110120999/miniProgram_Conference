// pages/ImgToText/ImgToText.js
var util = require('../../utils/util.js')
const api = require("../../utils/api");

let my_publicPath="";

Page({
  //页面的初始数据
  data: {
    text:"",
    displayCopyTBL:'none',
    displayAD: 'display:none',
    imgPath:""
    // displayCopyTBL: 'inline-block'
  },

  // 入口选项
  uploadImg: function () {
    var that = this;
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

  //选择照相机
  chooseCamera: function () {
    Promise.resolve()
      .then(this.wx_chooseCamera)
      .then(this.upImgOss)
  },

  //选择图库
  chooseImage:function(){
    Promise.resolve()
      .then(this.wx_chooseImage_gallery)
      .then(this.upImgOss)
  },
  
  //选择微信会话
  chooseMessage:function(){
    Promise.resolve()
      .then(this.wx_chooseImage_wechat)
      .then(this.upImgOss)
  },


// ------------子函数----------


  // 选择图片——相机
  wx_chooseCamera: function () {
    return new Promise((resolve, reject) => {
      var that = this;
      var util_wx_chooseImage = util.wxPromisify(wx.chooseImage)
      util_wx_chooseImage({
        count: 1,
        sizeType:['original','compressed'],
        sourceType: ['camera'],
      }).then(function (res) {
        console.log(res)
        // 赋值
        that.setData({
          text: "识别中...",
          displayCopyTBL: 'none',
          imgPath:res.tempFilePaths[0]
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
        sizeType:['original','compressed'],
      }).then(function (res) {
        console.log(res)
        // 赋值
        that.setData({
          text: "识别中...",
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
          text: "识别中...",
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



  
  // 图片上传oss
  upImgOss:function(){
    var that=this;
    // 获取服务器oss的Sign
    wx.request({
      url: api.getOssSign,
      data: { type: api.thisProject,
      },
      header: { 'content-type': 'application/json' 
      },success(res) {
        console.log(res.data.data);
        let resData=res.data.data;

        let accessid=resData.accessid;
        let policy=resData.policy;
        let signature=resData.signature;
        let dir=resData.dir;
        let myHost = api.myOssDomain;
        let timestamp = Date.parse(new Date())/1000;
        let random3 = Math.floor(Math.random () * 900) + 100; 
        let filePathName= dir+"temp/"+timestamp+random3+".jpg";

        console.log("api.myOssDomain: "+api.myOssDomain);
        
        // 对象存储上传
        wx.uploadFile({
          url: api.myOssDomain, 
          filePath: that.data.imgPath,
          name: 'file', // 必须填file。
          formData: {
            key:filePathName, //"common/myphoto02.jpg",
            policy:policy,
            OSSAccessKeyId: accessid,
            signature:signature,
          },
          success: (res) => {
            console.log(res);
            if (res.statusCode === 204) {
              console.log('上传成功');console.log(myHost+"/"+filePathName);
              let publicPath=myHost+"/"+filePathName;
              my_publicPath=publicPath;
              that.imgSecCheck_server(publicPath);//安全检查     
            }
          },
          fail: err => {
            wx.hideLoading();//关闭动画
            console.log(err);
          }
        })

      },fail: err => {
        console.log(err);
        wx.hideLoading();//关闭动画
      }
    })//request

  },

    // 图片审核 服务器版
    imgSecCheck_server: function (upImgUrl) {
      var that = this;
      // let cutOpt="?x-oss-process=image/resize,h_1000,m_lfit";
      // 上传图片
      wx.request({
        url: api.imgSecCheck,
        data: {
          type: "test",
          imgUrl: upImgUrl
        },
        header: {
          'content-type': 'application/json' // 默认值
        },success(res) {
          console.log("---图片审核完成---");console.log(res);
          if(res.data.code==1){
            // that.serviceCutImage();//剪裁功能
            that.toResultPage(my_publicPath); //跳转详情页面
          }else{
            console.log("---图片违规---")
            wx.showToast({
              title: '图片含有违规内容,请重新选择',
              icon: 'none'
            })
            return false;
          }
        }, fail(res) {
          console.error(res);
          wx.hideLoading();//关闭动画
        }
      })
    },

  // 去详情页面
  toResultPage:function(url){
    var that=this;
    that.setData({
      text: "",
      displayAD: ''
    })
    wx.navigateTo({
      url: '../result/result?url='+url,
    })
  },

  // // 图片压缩-  仅对jpg文件 有效
  // wx_compressImage: function (tempFilePaths){
  //   return new Promise((resolve,reject) =>{
  //     var util_wx_compressImage = util.wxPromisify(wx.compressImage)
  //     util_wx_compressImage({
  //       src: tempFilePaths, // 图片路径
  //       quality: 5, // 压缩质量
  //     }).then(function (res) {
  //       console.log(res)
  //       console.log(res.tempFilePath)
  //       // 输出
  //       resolve(res.tempFilePath);
  //     }).catch(function (res) {
  //       console.error(res)
  //     })

  //   })
  // },

  // 读取图片文件
  // wx_getFileSystemManager_readFile: function (imagePath){
  //   return new Promise((resolve, reject) => {
  //     var util_wx_FileSystem_readFile = util.wxPromisify(wx.getFileSystemManager().readFile)
  //     util_wx_FileSystem_readFile({
  //       filePath:imagePath,
  //     }).then(function (buffer){
  //       console.log(buffer);
  //       resolve(buffer.data)
  //     }).catch(function (res) { 
  //       console.error(res) 
  //     })
  //   })
  // },

  // // 云调用：审核图片
  // wx_cloud_callFunction: function (buffer){
  //   var that = this;
  //   return new Promise((resolve, reject)=>{
  //     wx.cloud.callFunction({
  //       name: 'openapi',
  //       data: {
  //         action: 'imgSecCheck',
  //         value: buffer
  //       }
  //     }).then(res => {
  //       console.log(res)
  //       if (res.result.errCode == '87014') {
  //         wx.showToast({
  //           title: '图片含有违法违规内容',
  //           icon: 'none'
  //         })
  //         // 提示重新上传
  //         that.setData({
  //           text: "请重新上传图片"
  //         })
  //         reject()
  //       } else {
  //         resolve()
  //       }
  //     }).catch(err => {
  //       console.error(err)
  //       // 赋值
  //       that.setData({
  //         text: "图片过大，请编辑剪裁后重新识别！",
  //         displayCopyTBL: 'none',
  //       })
  //     })
  //   })
  // },

  // // 上传文件
  // wx_uploadFile:function(){
  //   var that=this;
  //   return new Promise((resolve, reject) => {
  //     console.log("---进入上传文件步骤---")
  //     console.log(that.data.imgPath)
  //     // 上传图片
  //     wx.uploadFile({
  //       url: util.uploadHost+'/nsi-1.0/manager/talent/upload.do', 
  //       filePath: that.data.imgPath,
  //       name: 'file',
  //       formData: {
  //         type: "test/ImgToText/img/"
  //       },success(res) {
  //         console.log(res);
  //         var jsonStringUrl = JSON.parse(res.data).data.url
  //         var newjsonStringUrl = "http" + jsonStringUrl.slice(5)
  //         console.log(newjsonStringUrl)
  //         resolve(newjsonStringUrl)
  //       },fail(res) {
  //         console.error(res)
  //         wx.reportMonitor('0', res)
  //       }
  //     })
  //     console.log("---上传文件结束---")
  //   })
  // },

  // // 图片审核 服务器版
  // imgSecCheck_server: function (upImgUrl) {
  //   var that = this;
  //   return new Promise((resolve, reject) => {
  //     console.log("---进入图片审核 服务器版步骤---")
  //     console.log(that.data.imgPath)
  //     // 上传图片
  //     wx.request({
  //       url: util.apiHost+'/cs/WechatCommon/imgSecCheck',
  //       data: {
  //         type: "test",
  //         imgUrl: upImgUrl
  //       },
  //       header: {
  //         'content-type': 'application/json' // 默认值
  //       },success(res) {
  //         console.log(res);
  //         console.log(res.data.msg);
  //         if(res.data.code==1){
  //           resolve(upImgUrl)
  //         }else{
  //           wx.showToast({
  //             title: '图片含有违法违规内容',
  //             icon: 'none'
  //           })
  //           // 提示重新上传
  //           that.setData({
  //             text: "请重新上传图片"
  //           })
  //         }
          
  //       }, fail(res) {
  //         console.error(res)
  //         wx.reportMonitor('0', res)
  //       }
  //     })
  //     console.log("---图片审核结束---")
  //   })
  // },

  // // 图片文字-通用识别
  // wx_request_imgToText: function (upImgUrl) {
  //   var that =this;
  //   return new Promise((resolve, reject) => {
  //     // 发送请求
  //     wx.request({
  //       url: util.apiHost+'/cs/ImgToTextC/General_ImgToText',
  //       data: {
  //         link: upImgUrl,
  //       },
  //       header: {
  //         'content-type': 'application/json' // 默认值
  //       },
  //       success(res) {
  //         console.log(res.data.data)
  //         var TextString = JSON.parse(res.data.data)
  //         console.log(TextString.words_result)
  //         var wordsArrayString = ""
  //         for (var i = 0; i < TextString.words_result.length; i++) {
  //           // console.log(TextString.words_result[i].words)
  //           wordsArrayString = wordsArrayString + TextString.words_result[i].words + "\n"
  //         }
  //         // 赋值
  //         that.setData({
  //           text: wordsArrayString,
  //           displayCopyTBL: 'inline-block',
  //           displayAD: ''
  //         })
  //       },fail(res) {
  //         console.error(res)
  //         wx.reportMonitor('0', res)
  //         // 赋值
  //         that.setData({
  //           text: "图片过大，请编辑剪裁后重新识别！",
  //           displayCopyTBL: 'none',
  //         })
  //       }
  //     })
          
  //   })
  // },





  // // 一键复制
  // copyTBL:function () {
  //   var that = this
  //   wx.setClipboardData({
  //     data:that.data.text,
  //     success: function (res) {
  //       wx.showToast({
  //         title: '复制成功',
  //         icon: 'success',
  //         duration: 1500
  //       })
  //     }
  //   })
  // },

  // //跳转赞赏
  // appreciate_button: function () {
  //   console.log("跳转赞赏")
  //   wx.navigateToMiniProgram({
  //     appId: 'wx18a2ac992306a5a4',
  //     path: 'pages/apps/largess/detail?id=fW9FX%2BE4yLU%3D',
  //     extraData: {},
  //     envVersion: 'release',
  //     success(res) {
  //       // 打开成功
  //     }
  //   })
  // },

  // // 打开其他小程序
  // openMiniPro_AI:function(){
  //   wx.navigateToMiniProgram({
  //     appId: 'wx79e25b7ce97ad7cb',
  //     path: 'pages/AudioFileRecognition/AudioFileRecognition',
  //     extraData: {
  //       from: 'img2text'
  //     },
  //     envVersion: 'release',
  //     success(res) {
  //       // 打开成功
  //     }
  //   })
  // },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
      wx.setNavigationBarTitle({
        title: '拍照转文字 | 文字识别'
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

  onTabItemTap(item) {
    // console.log(item.index)
    // wx.showLoading({
    //   title: '加载中',
    // })
    // setTimeout(function () {
    //   wx.hideLoading()
    // }, 500)
    // console.log("tab切换：" + item)
  },

})