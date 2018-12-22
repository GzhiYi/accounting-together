// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()
const db = cloud.database()
// 云函数入口函数
exports.main = (event, context) => {
  console.log('打印入参', event)
  db.collection('project').doc(event.projectId).update({
    data: {
      deleted: true
    }
  })
  .then(res => {
    console.log('更新成功')
    db.collection('bill').where({
      _id: event.billId
    })
      .get()
      .then(res => {
        console.log('打印以前的总付款', res.data[0].paidTotal)
        db.collection('bill').doc(event.billId).update({
          data: {
            paidTotal: parseFloat(Number((res.data[0].paidTotal) - Number(event.projectPrice)).toPrecision(12))
          }
        })
      })
  })
}