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
  const { projectPrice, projectTitle, paidDate, containUser, payType, payItem, billId } = event
  await db.collection('project').doc(event.projectId).update({
    data: {
      price: projectPrice,
      title: projectTitle,
      paidDate: paidDate,
      containUser,
      type: payType == 0 ? 'paid' : 'item',
      payItem
    }
  })
  // 将bill表对应的paidTotal修改，重新计算，不要累加
  const relateBillRes = await db.collection('bill-project').where({
    billId
  }).get()
  console.log('relateBillRes', relateBillRes)
  const projectIds = Array.from(new Set(relateBillRes.data.map(item => item.projectId)))
  const projectRes = await db.collection('project').where({
    _id: _.in(projectIds),
    deleted: false
  }).get()
  console.log('projectRes', projectRes)
  const projectList = projectRes.data
  let total = 0
  projectList.forEach(p => {
    let payItemTotal = 0
    if (p.payItem instanceof Array) {
      p.payItem.forEach(pItem => {
        payItemTotal += Number(pItem.value)
      })
    }
    total += Number(p.price) || payItemTotal
  })
  // 更新bill的total
  db.collection('bill').doc(event.billId).update({
    data: {
      paidTotal: Number(total).toFixed(2)
    }
  })
}