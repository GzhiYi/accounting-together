// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()
const db = cloud.database()
// 云函数入口函数
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  const groupNum = await db.collection('user-group')
  .where({
    userId: cloud.getWXContext().OPENID
  })
  .get()
  console.log('groupNum', groupNum)


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
  console.log('billNum', billNum)
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