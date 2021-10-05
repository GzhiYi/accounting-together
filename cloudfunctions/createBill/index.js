// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()
const db = cloud.database()
// 云函数入口函数
exports.main = (event, context) => {
  const wxContext = cloud.getWXContext();
  cloud.updateConfig({
    env: wxContext.ENV === 'local' ? 'account-release-73522d' : wxContext.ENV,
  })
  // 初始化数据库
  const db = cloud.database({
    env: wxContext.ENV === 'local' ? 'account-release-73522d' : wxContext.ENV,
  });
  const userInfo = event.userInfo
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
    db.collection('bill-group').add({
      data: {
        billId: res._id,
        groupId: event.groupId
      }
    })
  })
}