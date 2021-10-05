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
  const openId = cloud.getWXContext().OPENID

  let relateGroupList = await db.collection('user-group')
  .where({
    userId: openId
  })
  .get()
  let groupIds = relateGroupList.data.map(item => item.groupId)
  // 请求组列表
  const groupRes = await db.collection('group').where({
    _id: _.in(groupIds),
    deleted: false,
  }).get()
  const groupList = groupRes.data
  const userIds = groupList.map(item => item.createBy)
  const userRes = await db.collection('user').where({
    openId: _.in(Array.from(new Set(userIds)))
  }).get()
  const userList = userRes.data
  let i = -1;
  let temp = []
  while(++i < groupList.length) {
    let groupInfo = groupList[i]
    const matchUser = userList.filter(u => u.openId === groupInfo.createBy)
    const matchRelateGroup = relateGroupList.data.filter(item => item.groupId === groupInfo._id)
    groupInfo.createBy = matchUser[0]
    groupInfo.relateUserGroupId = matchRelateGroup[0]._id
    temp.push(groupInfo)
  }
  return temp.sort((a, b) => a.createTime < b.createTime ? 1 : -1)
}