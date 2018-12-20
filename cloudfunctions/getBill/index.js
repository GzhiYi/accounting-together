// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()
const db = cloud.database()
// 云函数入口函数
exports.main = async (event, context) => {
  const openId = cloud.getWXContext().OPENID

  let billList = await db.collection('bill-group')
    .where({
      groupId: event.groupId
    })
    .get()
  let returnResult = []
  await Promise.all(billList.data.map(async item => {
    const oneBill = await db.collection('bill')
      .where({
        _id: item.billId,
        deleted: false
      })
      .get()
    
    if (oneBill.data.length > 0) {
      returnResult.push(oneBill.data[0])
    }
  }))
  return returnResult.sort((a, b) => a.createTime < b.createTime ? 1 : -1)
}