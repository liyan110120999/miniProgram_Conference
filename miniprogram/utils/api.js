// 本应用的Appid
var thisAppid="wx6cda482d190728e3"
// 本应用的用户 project信息
var thisProject="小程序-拍照转文字"

// ------------- 基础 API base路径 ---------
// 本地测试
// var baseUrl = "http://192.168.1.16:81/cs"
// 线上版本
var baseUrl = "https://api.html9.top/cs"




module.exports = {
  // 本应用基础信息
  thisAppid:thisAppid,
  thisProject:thisProject,

  //活码跳转解析
  baseUrl:baseUrl,

  // 图片内容校验方法
  imgSecCheck : baseUrl+"/WechatCommon/imgSecCheck",

  // oss对象存储验签
  getOssSign:baseUrl+"/AliyunOss/getSign",
  // oss对象 上传地址
  myOssDomain:"https://oss.yizhikeji.top",

}
