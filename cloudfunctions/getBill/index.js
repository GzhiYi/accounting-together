// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()
const db = cloud.database()
const _ = db.command
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
  let relateBillList = await db.collection('bill-group')
    .where({
      groupId: event.groupId
    })
    .get()
  const billIds = Array.from(new Set(relateBillList.data.map(item => item.billId)))
  const billRes = await db.collection('bill').where({
    _id: _.in(billIds),
    deleted: false
  }).get()
  const billList = billRes.data
  return billList.sort((a, b) => a.createTime < b.createTime ? 1 : -1)
}