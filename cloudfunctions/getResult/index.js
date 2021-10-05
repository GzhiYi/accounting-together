// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()
const db = cloud.database()
// 云函数入口函数
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  cloud.updateConfig({
    env: wxContext.ENV === 'local' ? 'account-release-73522d' : wxContext.ENV,
  })
  // 初始化数据库
  const db = cloud.database({
    env: wxContext.ENV === 'local' ? 'account-release-73522d' : wxContext.ENV,
  })
  let billInfo = await db.collection('bill').where({
    _id: event.billId
  })
  .get()
  const groupInfo = await db.collection('group').where({
    _id: billInfo.data[0].groupId
  })
  .get()
  billInfo.data[0].groupId = groupInfo.data[0]
  return {
    billInfo: billInfo.data[0]
  }
}