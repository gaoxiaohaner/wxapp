const envid = 'code-test'; //云开发环境id
// 云函数入口文件
const cloud = require('wx-server-sdk')
const TcbRouter = require('tcb-router'); //云函数路由

const TmplId = 'zskXwIP3LzMdHucIKIYWvjj88q2onMThnJXlM0fomUg';

cloud.init({
  env: envid,
})


const db = cloud.database();
// 云函数入口函数
exports.main = async (event, context) => {
  const app = new TcbRouter({
    event
  });
  //通过router传递路由参数
  //用户进行注册
  app.router('login', async (ctx) => {
    const wxContext = cloud.getWXContext()
    try {
      ctx.body = {
        data: wxContext
      }
    } catch (e) {
      console.error(e)
    }
    await db.collection('user').add({
      // data 字段表示需新增的 JSON 数据
      data: {
        _openid: wxContext.OPENID,
        userInfo: event.userInfo,
        phone: event.phone,
        campus: event.campus,
        qqnum: event.qqnum,
        email: event.email,
        wxnum: event.wxnum,
        stamp: event.stamp,
        money: 0,
        dba: 0,
        friends: []
      }
    })
  });


//审核是否通过
  app.router('shenhetongguo', async (ctx) => {
    const wxContext = cloud.getWXContext()
    try {
      ctx.body = await db.collection('dba')
        .where({
          number: 2017011370
        }).get()
    } catch (e) {
      console.error(e)
    }
  })


  //用户获取openid
  app.router('openid', async (ctx) => {
    const wxContext = cloud.getWXContext()
    ctx.body = wxContext.OPENID;
  });
  //获取用户信息
  app.router('huoquUserinfo', async (ctx) => {
    try {
      ctx.body = await db.collection('user').where({
        _openid: event.openid,
      }).get()
    } catch (e) {
      console.error(e)
    }
  });

  //发送消息提醒
  app.router('tixing', async (ctx) => {
    try {
      await cloud.openapi.subscribeMessage.send({
        touser: event.haoyou_openid,
        page: 'pages/example/chatroom_example/im',
        lang: 'zh_CN',
        data: event.data,
        templateId: 'wP0DrgBo_CKL51uA2QYFRJS-_IMnLUMWataPkALuw6s',
      })

    } catch (e) {
      console.error(e)
    }
  });


  //消息订阅
  app.router('subscribeMessage', async (ctx) => {
    const wxContext = cloud.getWXContext()
    const openid = wxContext.OPENID;
    try {
      ctx.body = await db.collection('SubscribeMessage').add({
        data: {
          //具体的字段可以根据自己的需求使用，但是data的值要注意
          //一定要这样传，和模板消息给的对应起来
          touser: openid,
          page: event.page,
          data: event.data,
          id: event.data.id,
          templateId: event.templateId,
          done: false,
        },
      });
    } catch (e) {
      console.error(e)
    }
  });

  //订阅消息发送
  app.router('subscribeMessagesend', async (ctx) => {
    const wxContext = cloud.getWXContext()
    const openid = wxContext.OPENID;
    try {
      // 从云开数据库中查询等待发送的消息列表
      const messages = await db.collection('SubscribeMessage')
        // 查询条件这里做了简化，只查找了状态为未发送的消息
        // 在真正的生产环境，可以根据开课日期等条件筛选应该发送哪些消息
        .where({
          done: false,
          // id: event.id
        })
        .get();
      // 循环消息列表
      const sendPromises = messages.data.map(async message => {
        try {
          // 发送订阅消息
          await cloud.openapi.subscribeMessage.send({
            touser: message.touser,
            page: message.page,
            data: message.data,
            templateId: message.templateId,
          });
          // 发送成功后将消息的状态改为已发送
          db.collection('SubscribeMessage').doc(message._id).update({
            data: {
              done: true,
            },
          });
        } catch (e) {
          console.error(e)
        }
      });
      ctx.body = Promise.all(sendPromises);
    } catch (err) {
      console.log(err);
    }
  });


  //添加好友
  app.router('searchpeople', async (ctx) => {
    try {
      ctx.body = await db.collection('user').where({
        phone: event.phone,
      }).get()
    } catch (e) {
      console.error(e)
    }
  });
  app.router('addpeople', async (ctx) => {
    try {
      await db.collection('SubscribeMessage').add({
        data: {
          //具体的字段可以根据自己的需求使用，但是data的值要注意
          //一定要这样传，和模板消息给的对应起来
          touser: event.askpeopleid,
          page: 'pages/index/index',
          data: {
            thing1: {
              value: event.peopleadd.nickName
            },
            thing2: {
              value: '对方接收了您的好友请求'
            },
            date3: {
              value: "2020-02-10"
            }, //这里的时间一定要填对，不然没有办法发送订阅消息
            thing4: {
              value: '点击好友聊天吧'
            },
            phrase5: {
              value: '哈哈哈'
            },
          },
          id: event.chatid,
          templateId: TmplId,
          status: 0, //表示需要发送这个请求
        },
      })
      await db.collection('addpeople').add({
        data: {
          addpeopleid: event.addpeopleid, //想要加的那个人的id
          askpeopleid: event.askpeopleid,
          peopleask: event.peopleask, //发起好友请求的人信息
          peopleadd: event.peopleadd,
          chatid: event.chatid,
          status: 0, //0代表未接受（申请中），1代表同意 2 代表拒绝  3 代表拒绝并且知道了
        }
      })
    } catch (e) {
      console.error(e)
    }
  });
  //检查是否有好友请求
  app.router('checkpeopleadd', async (ctx) => {
    try {
      ctx.body = await db.collection('addpeople').where({
        addpeopleid: event.id, //应该接受好友请求的那个人的openid
        status: event.status
      }).get()
    } catch (e) {
      console.error(e)
    }
  });
  app.router('confirmpeopleadd', async (ctx) => {
    try {
      await db.collection('addpeople').where({
        chatid: event.peopleconfim.chatid,
        status: 0
      }).update({
        data: {
          status: 1,
        }
      })
      await db.collection('user').where({
        _openid: event.peopleconfim.askpeopleid
      }).update({
        data: {
          friends: db.command.push([{
            id: event.peopleconfim.chatid,
            userInfo: event.peopleconfim.peopleadd,
            _openid: event.peopleconfim.addpeopleid,
            backgroundimage: ''
          }])
        }
      })
      await db.collection('user').where({
        _openid: event.peopleconfim.addpeopleid
      }).update({
        data: {
          friends: db.command.push([{
            id: event.peopleconfim.chatid,
            userInfo: event.peopleconfim.peopleask,
            _openid: event.peopleconfim.askpeopleid,
            backgroundimage: ''
          }])
        }
      })

      //发送订阅消息
      const wxContext = cloud.getWXContext()
      const openid = wxContext.OPENID;
      const messages = await db.collection('SubscribeMessage')
        .where({
          id: event.peopleconfim.chatid,
          status: 0
        })
        .get();

      const sendPromises = messages.data.map(async message => {
        await cloud.openapi.subscribeMessage.send({
          touser: message.touser,
          page: message.page,
          data: message.data,
          templateId: message.templateId,
        });
        db.collection('SubscribeMessage').doc(message._id).update({
          data: {
            status: 1
          },
        });
      });
      Promise.all(sendPromises);
    } catch (e) {
      console.error(e)
    }
  });
  //更新好友聊天的背景
  app.router('upadatebackground', async (ctx) => {
    const wxContext = cloud.getWXContext()
    const myopenid = wxContext.OPENID;
    const _ = db.command
    try {
      await db.collection('user')
        .where({
          _openid: myopenid,
          'friends._openid': event.haoyouopenid
        })
        .update({
          data: {
            'friends.$.backgroundimage': event.pic
          }
        })
    } catch (e) {
      console.error(e)
    }
  });
  /////////电话号码重复查重/////////  
  app.router('checkphone', async (ctx) => {
    try {
      ctx.body = await db.collection('user').where({
        phone: event.phone,
      }).get()
    } catch (e) {
      console.error(e)
    }
  });


  //我拒绝他添加我为好友
  app.router('jujueask', async (ctx) => {
    try {
      await db.collection('addpeople').where({
        chatid: event.peopleconfim.chatid,
      }).update({
        data: {
          status: 2, //拒绝添加
        }
      })
    } catch (e) {
      console.error(e)
    }
  });

  //拒绝这个地方不行，逻辑有问题，先不管拒绝的事情了就
  //知道我被拒绝了
  app.router('knowjujue', async (ctx) => {
    try {
      await db.collection('addpeople').where({
        chatid: event.jujuelist.chatid,
      }).update({
        data: {
          status: 3, //知道被拒绝
        }
      })
    } catch (e) {
      console.error(e)
    }
  });
  app.router('HuoquFriends', async (ctx) => {

    try {
      ctx.body = await db.collection('user').where({
        _openid: event.openid
      }).get()
    } catch (e) {
      console.error(e)
    }
  });

  //将ctx中的数据返回小程序端
  return app.serve();
}