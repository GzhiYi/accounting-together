// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()
const db = cloud.database()
// 云函数入口函数
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  const userInfo = event.userInfo
  if (event.hasOwnProperty('extend')) {
    if (event.extend === 'getFeedbackList' && userInfo.openId === 'oUsod0XGJPCi_Sax1bMWVJAeRMok') {
      const feedbackList = await db.collection('feedback').get()
      for(let item of feedbackList.data) {
        const user = await db.collection('user')
        .where({
          openId: item.createBy
        })
        .get()
        item.createBy = user.data[0]
      }
      return feedbackList.data.reverse()
    }
  } else {
    await db.collection('feedback').add({
      data: {
        stars: event.stars,
        message: event.message,
        createBy: userInfo.openId,
        createTime: new Date()
      }
    })
    return {
      msg: '反馈成功',
      code: 1
    }
  }
}