// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()
const db = cloud.database()
// 云函数入口函数
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  const editRes = await db.collection('project').doc(event.projectId).update({
    data: {
      price: event.projectPrice,
      title: event.projectTitle,
      paidDate: event.paidDate,
      containUser: event.containUser
    }
  })
  const gotBill = await db.collection('bill').where({
    _id: event.billId
  })
  .get()
  await db.collection('bill').doc(event.billId).update({
    data: {
      paidTotal: parseFloat(Number((gotBill.data[0].paidTotal) - Number(event.lastProjectPrice) + Number(event.projectPrice)).toPrecision(12))
    }
  })
}