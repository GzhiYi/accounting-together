// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()
const db = cloud.database()
const _ = db.command
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
  const { OPENID } = cloud.getWXContext()
  let relateUserList = await db.collection('user-group')
  .where({
    groupId: event.groupId
  })
  .get()
  const userIds = relateUserList.data.map(item => item.userId)
  const userRes = await db.collection('user').where({
    openId: _.in(userIds)
  }).get()
  const userList = userRes.data
  userList.forEach(user => {
    const matchRelateUser = relateUserList.data.filter(item => item.userId === user.openId)
    if (matchRelateUser.length) {
      user.userGroupId = matchRelateUser[0]._id
      user.note = matchRelateUser[0].note
    }
  })
  return userList.sort((a, b) => a.createTime < b.createTime ? 1 : -1)
}