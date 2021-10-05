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
  const openId = cloud.getWXContext().OPENID
  let userList = await db.collection('user-group')
  .where({
    groupId: event.groupId
  })
  .get()
  let returnResult = []
  await Promise.all(userList.data.map(async item => {
    const oneUser = await db.collection('user')
    .where({
      openId: item.userId
    })
    .get()
    if (oneUser.data.length > 0) {
      let oneUserData = oneUser.data[0]
      oneUserData.userGroupId = item._id
      oneUserData.note = item.note
      returnResult.push(oneUserData)
    }
  }))
  return returnResult.sort((a, b) => a.createTime < b.createTime ? 1 : -1)
}