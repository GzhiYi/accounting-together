// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()
const db = cloud.database()
// 云函数入口函数
exports.main = async (event, context) => {
  const openId = cloud.getWXContext().OPENID

  let groupList = await db.collection('user-group')
  .where({
    userId: openId
  })
  .get()
  let returnResult = []
  await Promise.all(groupList.data.map(async item => {
    const oneGroup = await db.collection('group')
    .where({
      _id: item.groupId,
      deleted: false
    })
    .get()
    console.log('打印onegroup', oneGroup)
    if (oneGroup.data.length > 0) {
      returnResult.push(oneGroup.data[0]) 
    }
  }))
  return returnResult.sort((a, b) => a.createTime < b.createTime ? 1 : -1)
}