// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()

// 云函数入口函数
exports.main = async (event, context) => {
  try{
    const result = await cloud.openapi.wxacode.get({
      path: event.path,
      width: 430
    })
    const upload= await cloud.uploadFile({
      cloudPath: 'qrcode/qrcode.png',
      fileContent: result.buffer
    })
    return upload
  }catch(e){

  }
}