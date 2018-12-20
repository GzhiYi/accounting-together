// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()
const db = cloud.database()
// 云函数入口函数
exports.main = (event, context) => {
  const userInfo = event.userInfo
  console.log("查看入参", event)
  db.collection('project').add({
    data: {
      title: event.projectTitle,
      createBy: userInfo.openId,
      paidDate: event.paidDate,
      deleted: false,
      expectMe: false,
      groupId: event.groupId,
      price: event.projectPrice,
      type: 'paid',
      containUser: event.containUser
    }
  })
  .then(res => {
    console.log("插入group回调", res)
    // 将bill表对应的paidTotal修改
    db.collection('bill').where({
      _id: event.billId
    })
    .get()
    .then(res => {
      console.log('打印以前的总付款', res.data[0].paidTotal)
      db.collection('bill').doc(event.billId).update({
        data: {
          paidTotal: Number(res.data[0].paidTotal) + Number(event.projectPrice)
        }
      })
    })
    db.collection('bill-project').add({
      data: {
        projectId: res._id,
        billId: event.billId
      }
    })
  })
}