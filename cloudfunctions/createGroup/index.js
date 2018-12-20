// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()
const db = cloud.database()
// 云函数入口函数
exports.main = (event, context) => {
  console.log('打印event', event)
  const userInfo = event.userInfo
  db.collection('group').add({
    data: {
      name: event.groupName,
      createBy: userInfo.openId,
      createTime: new Date(),
      deleted: false,
      updateTime: new Date()
    }
  })
  .then(res => {
    console.log("插入group回调", res)
    db.collection('user-group').add({
      data: {
        groupId: res._id,
        userId: userInfo.openId
      }
    })
  })
}