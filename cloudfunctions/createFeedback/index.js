// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()
const db = cloud.database()
// 云函数入口函数
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  const userInfo = event.userInfo
  if (event.hasOwnProperty('extend')) {
    // 获取反馈列表
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
    // 更新备注信息
    if (event.extend === 'updateNote') {
      await db.collection('user-group').doc(event.userGroupId).update({
        data: {
          note: event.newNote
        }
      })
    }
    // 获取版本更新内容
    if (event.extend === 'getUpdateLog') {
      const version = await db.collection('update-log').get()
      return version.data.reverse()
    }
    // 获取留话信息
    if (event.extend === 'getWord') {
      const wordData = await db.collection('bill-word').where({
        billId: event.billId
      }).get()
      if (wordData.data.length > 0) {
        for(let [index, oneWord] of wordData.data.entries()) {
          let userInfo = await db.collection('user').where({
            openId: oneWord.userId
          })
          .get()
          wordData.data[index].user = userInfo.data[0]
        }
      }
      return wordData.data
    }
    // 新增留话信息
    if (event.extend === 'sendWord') {
      const wordData = await db.collection('bill-word').add({
        data: {
          billId: event.billId,
          userId: userInfo.openId,
          word: event.word,
          createTime: event.createTime
        }
      })
      return {
        msg: '成功',
        code: 1
      }
    }
    // 编辑群标题
    if (event.extend === 'editGroup') {
      await db.collection('group').doc(event.groupId).update({
        data: {
          name: event.name
        }
      })
      return {
        msg: '修改成功',
        code: 1
      }
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