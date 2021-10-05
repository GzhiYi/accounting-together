// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()

const db = cloud.database()
// 云函数入口函数
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  cloud.updateConfig({
    env: wxContext.ENV === 'local' ? 'account-release-73522d' : wxContext.ENV,
  })
  // 初始化数据库
  const db = cloud.database({
    env: wxContext.ENV === 'local' ? 'account-release-73522d' : wxContext.ENV,
  })
  if (event.hasOwnProperty('menuUser')) {
    // 移除成员
    const userGroupRes = await db.collection('user-group').where({
      groupId: event.groupInfo._id,
      userId: event.menuUser.openId
    }).get()
    if (userGroupRes.data.length > 0) {
      await db.collection('user-group').doc(userGroupRes.data[0]._id).remove()
    }
  } else {
    // 自身退出
    const removeRes = await db.collection("user-group").doc(event.relateUserGroupId).remove()
  }
  return {
    msg: '退出成功',
    code: 1
  }
}