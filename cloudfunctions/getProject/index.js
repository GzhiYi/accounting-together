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

  let relateProjectList = await db.collection('bill-project')
    .where({
      billId: event.billId
    })
    .get()
  let returnResult = []
  const projectIds = Array.from(new Set(relateProjectList.data.map(item => item.projectId)))
  const projectRes = await db.collection('project').where({
    _id: _.in(projectIds),
    deleted: false
  })
  .get()
  const projectList = projectRes.data
  let userIds = []
  projectList.forEach(p => {
    userIds.push(...p.containUser)
    userIds.push(p.createBy)
  })
  userIds = Array.from(new Set(userIds))
  console.log('看看处理的userId', userIds)
  const userRes = await db.collection('user').where({
    openId: _.in(userIds)
  }).get()
  const userList = userRes.data
  const fillUser = openId => {
    const matchUser = userList.filter(u => u.openId === openId)
    if (matchUser.length) {
      return matchUser[0]
    }
    return openId
  }
  let i = -1
  while(++i < projectList.length) {
    const project = projectList[i]
    project.createBy = fillUser(project.createBy)
    project.containUser = project.containUser.map(p => fillUser(p))
    returnResult.push(project)
  }
  return returnResult.sort((a, b) => a.paidDate < b.paidDate ? 1 : -1)
}