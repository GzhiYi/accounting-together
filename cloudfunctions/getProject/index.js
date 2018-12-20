// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()
const db = cloud.database()
// 云函数入口函数
exports.main = async (event, context) => {
  const openId = cloud.getWXContext().OPENID

  let projectList = await db.collection('bill-project')
    .where({
      billId: event.billId
    })
    .get()
  let returnResult = []
  await Promise.all(projectList.data.map(async item => {
    const oneProject = await db.collection('project')
      .where({
        _id: item.projectId,
        deleted: false
      })
      .get()
    console.log('打印oneproject', oneProject)
    if (oneProject.data.length > 0) {
      const userInfo = await db.collection('user').where({
        openId: oneProject.createBy
      })
      .get()
      oneProject.data[0].createBy = userInfo.data[0]
      returnResult.push(oneProject.data[0])
    }
  }))
  return returnResult.sort((a, b) => a.paidDate < b.paidDate ? 1 : -1)
}