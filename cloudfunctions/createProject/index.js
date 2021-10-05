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
  const userInfo = event.userInfo
  db.collection('project').add({
    data: {
      title: event.projectTitle,
      createBy: userInfo.openId,
      paidDate: event.paidDate,
      deleted: false,
      groupId: event.groupId,
      price: event.projectPrice,
      type: 'paid',
      containUser: event.containUser
    }
  })
  .then(res => {
    // 将bill表对应的paidTotal修改
    db.collection('bill').where({
      _id: event.billId
    })
    .get()
    .then(res => {
      db.collection('bill').doc(event.billId).update({
        data: {
          paidTotal: parseFloat(Number((res.data[0].paidTotal) + Number(event.projectPrice)).toPrecision(12))
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