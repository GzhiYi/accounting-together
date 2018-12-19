// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()
const db = cloud.database()
// 云函数入口函数
exports.main = (event, context) => {
  const userInfo = event.userInfo
  console.log("查看入参", event)
  db.collection('bill').add({
    data: {
      name: event.billName,
      createBy: userInfo.openId,
      createTime: new Date(),
      ended: false,
      deleted: false,
      groupId: event.groupId,
      paidTotal: 0
    }
  })
  .then(res => {
    console.log("插入group回调", res)
    db.collection('bill-group').add({
      data: {
        billId: res._id,
        groupId: event.groupId
      }
    })
  })
}