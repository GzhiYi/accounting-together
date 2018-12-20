// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()
const db = cloud.database()
// 云函数入口函数
exports.main = async (event, context) => {
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
      returnResult.push(oneUser.data[0])
    }
  }))
  return returnResult.sort((a, b) => a.createTime < b.createTime ? 1 : -1)
}