// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()
const db = cloud.database()
// 云函数入口函数
exports.main = (event, context) => {
  const wxContext = cloud.getWXContext()
  cloud.updateConfig({
    env: wxContext.ENV === 'local' ? 'account-release-73522d' : wxContext.ENV,
  })
  // 初始化数据库
  const db = cloud.database({
    env: wxContext.ENV === 'local' ? 'account-release-73522d' : wxContext.ENV,
  })
  db.collection('project').doc(event.projectId).update({
    data: {
      deleted: true
    }
  })
  .then(res => {
    db.collection('bill').where({
      _id: event.billId
    })
      .get()
      .then(res => {
        db.collection('bill').doc(event.billId).update({
          data: {
            paidTotal: parseFloat(Number((res.data[0].paidTotal) - Number(event.projectPrice)).toPrecision(12))
          }
        })
      })
  })
}