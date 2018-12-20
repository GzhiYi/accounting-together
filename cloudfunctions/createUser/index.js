// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()
const db = cloud.database()
// 云函数入口函数
exports.main = async (event, context) => {
  const userInfo = event.userInfo
  console.log("查看43443入参", userInfo)

  // 先查询有无该用户openId
  const checkUser = await db.collection('user')
  .where({
    openId: userInfo.openId
  })
  .get()
  console.log('查看', checkUser)
  // 如果有该用户，则更新基本用户信息
  if (checkUser.data.length > 0) {
    await db.collection('user').doc(checkUser.data[0]._id)
    .update({
      data: {
        avatarUrl: event.avatarUrl,
        nickName: event.nickName,
        sex: event.sex
      }
    })
    console.log('是更新')
  } else {
    // 插入
    const insertResult = await db.collection('user').add({
      data: {
        avatarUrl: event.avatarUrl,
        nickName: event.nickName,
        sex: event.sex,
        name: '',
        openId: event.userInfo.openId
      }
    })
    console.log("插入返回", insertResult)
  }
}