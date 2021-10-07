// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()
const db = cloud.database()
// 云函数入口函数
/**
 * 
 * @param {*} groupUserList 组的用户列表
 * @param {*} projectList 当前账单的账单列表
 * result 返回结果数组，单项结构为：{...用户信息,shouldPay: +-Number}
 */
function cal(groupUserList, projectList) {
  let i = -1
  while(++i < groupUserList.length) {
    const user = groupUserList[i]
    user.shouldPay = 0
    // 遍历账单列表
    let pIndex = -1
    let userPayTotal = 0 // 该用户在支出方时的总支出（因为可能有些支出项没包含支出人）
    let userShouldPay = 0 // 该用户每一笔应该的支出总和
    while(++pIndex < projectList.length) {
      const project = projectList[pIndex]
      if (project.createBy.openId === user.openId) {
        userPayTotal += project.price || project.payItemTotal // 只有两种情况，平均的读price，非平均的读payItemTotal
      }
      // 分两种情况计算userShouldPay
      // 计算平均的时候
      if (project.type === 'paid') {
        // 判断该用户是否包含在内(是否在container中)，就算是组成员，也不一定在支出成员内
        const isInContain = project.containUser.findIndex(u => u.openId === user.openId) !== -1
        if (isInContain) {
          userShouldPay += (project.price / project.containUser.length)
        }
      } else if (project.type === 'item') {
        // 判断该用户是否包含在内(是否在payItem中)，就算是组成员，也不一定在支出成员内
        const itemIndex = project.payItem.findIndex(p => p.openId === user.openId)
        if (itemIndex !== -1) {
          userShouldPay += Number(project.payItem[itemIndex].value)
        }
      }
    }
    user.shouldPay = userPayTotal - userShouldPay
  }
  return groupUserList
}
function roundFun(value, n) {
  return Math.round(value * Math.pow(10, n)) / Math.pow(10, n);
}
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  cloud.updateConfig({
    env: wxContext.ENV === 'local' ? 'account-release-73522d' : wxContext.ENV,
  })
  // 初始化数据库
  const db = cloud.database({
    env: wxContext.ENV === 'local' ? 'account-release-73522d' : wxContext.ENV,
  })
  const { groupUserList, billId, projectList, end} = event
  if (end) {
    const result = cal(groupUserList, projectList)
    await db.collection('bill').doc(billId).update({
      data: {
        ended: true,
        endTime: new Date(),
        result
      }
    })
  } else {
    await db.collection('bill').doc(billId).update({
      data: {
        ended: false
      }
    })
  }
}