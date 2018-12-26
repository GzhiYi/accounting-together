// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()
const db = cloud.database()
// 云函数入口函数
exports.main = async (event, context) => {
  const openId = cloud.getWXContext().OPENID

  let oneBill = await db.collection('bill')
    .where({
      _id: event.billId
    })
    .get()
  return oneBill.data[0]
}