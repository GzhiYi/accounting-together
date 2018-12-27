// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()

const db = cloud.database()
// 云函数入口函数
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  const removeRes = await db.collection("user-group").doc(event.relateUserGroupId).remove()
  console.log("查看打印", removeRes)
  return {
    msg: '退出成功',
    code: 1
  }
}