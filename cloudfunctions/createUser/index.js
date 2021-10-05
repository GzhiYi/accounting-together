// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()
const db = cloud.database()
// 云函数入口函数
exports.main = async (event) => {
  const { mode, avatarUrl, nickName, sex, _id } = event
  const { OPENID, ENV } = cloud.getWXContext()
  cloud.updateConfig({
    env: ENV === 'local' ? 'account-release-73522d' : ENV,
  })
  // 初始化数据库
  const db = cloud.database({
    env: ENV === 'local' ? 'account-release-73522d' : ENV,
  })
  console.log('OPENID', OPENID)
  // 检查数据库是否已经保存了这个用户的信息
  if (mode === 'check') {
    const res = await db.collection('user').where({
      openId: OPENID
    }).get()
    if (res.data.length) {
      return {
        code: 1,
        msg: '已有该用户信息',
        data: res.data[0]
      }
    } else {
      return {
        code: 0,
        msg: '新用户',
        data: null
      }
    }
  }
  if (mode === 'add') {
    await db.collection('user').add({
      avatarUrl,
      nickName,
      sex,
      name: '',
      openId: OPENID,
      createTime: new Date()
    })
  }
  if (mode === 'update') {
    await db.collection('user').doc(_id)
    .update({
      data: {
        avatarUrl,
        nickName,
        sex
      }
    })
  }
}