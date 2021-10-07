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
  const containGroup = await db.collection('user-group').where({
    userId: wxContext.OPENID
  })
  .get()

  let alreadyInGroup = false
  containGroup.data.forEach(item => {
    if (item.groupId === event.groupId) {
      alreadyInGroup = true
    }
  })
  const groupRes = await db.collection('group').where({
    _id: event.groupId
  }).get()
  if (alreadyInGroup) {
    return {
      msg: '你已在该组内，即将跳转至组页面',
      code: event.mode === 'check' ? 2 : 0,
      data: groupRes.data[0]
    }
  } else {
    if (event.mode !== 'check') {
      await db.collection('user-group').add({
        data: {
          userId: wxContext.OPENID,
          groupId: event.groupId,
          invalid: false
        }
      })
      return {
        msg: '加入成功',
        code: 1,
        data: groupRes.data[0]
      }
    }
  }
}