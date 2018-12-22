// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()
const db = cloud.database()
// 云函数入口函数
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  const userInfo = event.userInfo
  await db.collection('feedback').add({
    data: {
      stars: event.stars,
      message: event.message,
      createBy: userInfo.openId,
      createTime: new Date()
    }
  })
  return {
    msg: '反馈成功',
    code: 1
  }
}