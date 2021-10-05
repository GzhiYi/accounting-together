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
  const groupNum = await db.collection('user-group')
  .where({
    userId: cloud.getWXContext().OPENID
  })
  .get()


  const billNum = await db.collection('project')
  .get()
  let returnBillNum = 0
  billNum.data.forEach(bill => {
    bill.containUser.forEach(openId => {
      if (openId === cloud.getWXContext().OPENID) {
        returnBillNum ++ 
      }
    })
  })
  const storeUser = await db.collection('user').where({
    openId: cloud.getWXContext().OPENID
  })
  .get()
  return {
    groupNum: groupNum.data.length,
    billNum: returnBillNum,
    storeUser: storeUser.data[0]
  }
}