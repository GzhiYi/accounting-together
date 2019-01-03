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
  for (let item of projectList.data) {
    const oneProject = await db.collection('project')
      .where({
        _id: item.projectId,
        deleted: false
      })
      .get()
    
    if (oneProject.data.length > 0) {
      const userInfo = await db.collection('user').where({
        openId: oneProject.data[0].createBy
      })
      .get()
      let resultContainUser = []
      for (let con_openId of oneProject.data[0].containUser) {
        const oneContainUserInfo = await db.collection('user').where({
          openId: con_openId
        })
        .get()
        resultContainUser.push(oneContainUserInfo.data[0])
      }
      oneProject.data[0].createBy = userInfo.data[0]
      oneProject.data[0].containUser = resultContainUser
      returnResult.push(oneProject.data[0])
    }
  }
  return returnResult.sort((a, b) => a.paidDate < b.paidDate ? 1 : -1)
}