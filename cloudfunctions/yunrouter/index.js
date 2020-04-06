const envid = 'code-test'; //云开发环境id
// 云函数入口文件
const cloud = require('wx-server-sdk')
const TcbRouter = require('tcb-router'); //云函数路由
const rq = require('request');
const bookappkey = 'd17b7257627cae1e';
const TmplId = 'zskXwIP3LzMdHucIKIYWvjj88q2onMThnJXlM0fomUg';
var xlsx=require('node-xlsx')
cloud.init({
  env: envid,
})
//1，引入支付的三方依赖
const tenpay = require('tenpay');
//2，配置支付信息
const config = {
  appid: 'wx9d892f7ee590f5e5', //
  mchid: '1550926131', //
  partnerKey: '147342977214734297721473429772gh', //
  notify_url: 'https://mp.weixin.qq.com', //支付回调网址,这里可以先随意填一个网址
  spbill_create_ip: '127.0.0.1'
};

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

  app.router('pay', async (ctx) => {
    const wxContext = cloud.getWXContext()
    try {
      const api = tenpay.init(config);
      ctx.body = await api.getPayParams({
        out_trade_no: '12123',
        body: '报名费',
        total_fee: '1', //订单金额(分),
        openid: wxContext.OPENID //付款用户的openid
      });
    } catch (e) {
      console.error(e)
    }
  });

  //点击头像的次数
  app.router('buttontimes', async (ctx) => {
    const wxContext = cloud.getWXContext()
    try {
      if (event.times >= 150) {
        ctx.body = 1;
      }
    } catch (e) {
      console.error(e)
    }
  })
//审核是否通过
  app.router('shenhetongguo', async (ctx) => {
    const wxContext = cloud.getWXContext()
    try {
      ctx.body = await db.collection('dba')
      .where({
        number:2017011370
      }).get()
    } catch (e) {
      console.error(e)
    }
  })
//dba管理员登录
  app.router('adminlogin', async (ctx) => {
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
//gps信息获取
  app.router('gps1', async (ctx) => {
    const wxContext = cloud.getWXContext()
    try {
      if(event.number>0&&event.number<999999999)
      {
        ctx.body=1
      }
      else{
        ctx.body=0
      }
    } catch (e) {
      console.error(e)
    }
  })

  //位置信息上传
  app.router('gps2', async (ctx) => {
    try {
      //先查重
      const judge=await db.collection('gps')
        .where({
          number:event.number
        }).get()
        ctx.body=judge.data.length
        //长度为0就是没有数据呢还
        if(judge.data.length==0){
        await db.collection('gps').add({
          // data 字段表示需新增的 JSON 数据
          data: {
            number:event.number,
            location: event.location,
            time:event.time
          }
        })
        }
        else{
        await db.collection('gps').where({
            number: event.number
          }).update({
            data:{
              location: event.location,
              time: event.time
            }
          })
        }
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

  //根据isbn码获取图书详情信息
  app.router('bookinfo', async (ctx) => {
    ctx.body = new Promise(resolve => {
      rq({
        url: 'https://api.jisuapi.com/isbn/query?appkey=' + bookappkey + '&isbn=' + event.isbn,
        method: "GET",
        json: true,
      }, function (error, response, body) {
        resolve({
          body: body
        })
      });
    });
  });

  //充值钱包
  app.router('recharge', async (ctx) => {
    const wxContext = cloud.getWXContext();
    const curTime = Date.now();
    let result = await api.getPayParams({
      //商户订单号
      out_trade_no: 'bookcz' + event.num + '' + curTime,
      body: '充值钱包',       //商品名称
      total_fee: parseInt(event.num),     //金额，注意是数字，不是字符串
      openid: wxContext.OPENID //***用户的openid
    });
    ctx.body = result;//返回前端结果
  });

  //修改卖家在售状态
  app.router('changeP', async (ctx) => {
    try {
      return await db.collection('publish').doc(event._id).update({
        data: {
          status: event.status
        }
      })
    } catch (e) {
      console.error(e)
    }
  });

  //修改订单状态
  app.router('changeO', async (ctx) => {
    try {
      return await db.collection('order').doc(event._id).update({
        data: {
          status: event.status
        }
      })
    } catch (e) {
      console.error(e)
    }
  });

  //钱包充值
  app.router('moneycharge', async (ctx) => {
    const wxContext = cloud.getWXContext()
    const openid = wxContext.OPENID;
    const userinfo = await db.collection('user').where({
      _openid: openid // 填入当前用户 openid
    }).get()
    try {
      ctx.body = await db.collection('user').doc(userinfo.data[0]._id).update({
        data: {
          money: userinfo.data[0].money + parseInt(event.num)
        }
      });
    } catch (e) {
      console.error(e)
    }
  });


  //买家确认收货
  app.router('toseller', async (ctx) => {
    //先增加历史记录
    await db.collection('history').add({
      // data 字段表示需新增的 JSON 数据
      data: {
        oid: event.seller,
        _openid: event.seller,
        name: '出售书籍',
        num: event.num,
        stamp: new Date().getTime(),
        type: 1,
      }
    })

    //再修改钱包值
    let userinfo = await db.collection('user').where({
      _openid: event.seller, // 卖家openid
    }).get()
    ctx.body = await db.collection('user').doc(userinfo.data[0]._id).update({
      data: {
        money_balance: userinfo.data[0].money_balance + parseInt(event.num)
      }
    });

  });

  //卖家取消订单退款
  app.router('tobuyer', async (ctx) => {
    //先增加历史记录
    await db.collection('history').add({
      // data 字段表示需新增的 JSON 数据
      data: {
        oid: event.buyer,
        _openid: event.seller,
        name: '卖家取消交易退款',
        num: event.num,
        stamp: new Date().getTime(),
        type: 1,
      }
    })
    //再修改钱包值
    let userinfo = await db.collection('user').where({
      _openid: event.buyer,
    }).get()
    ctx.body = await db.collection('user').doc(userinfo.data[0]._id).update({
      data: {
        money_balance: userinfo.data[0].money_balance + parseInt(event.num)
      }
    });
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
            thing1: { value: event.peopleadd.nickName },
            thing2: { value: '对方接收了您的好友请求' },
            date3: { value: "2020-02-10" },//这里的时间一定要填对，不然没有办法发送订阅消息
            thing4: { value: '点击好友聊天吧' },
            phrase5: { value: '哈哈哈' },
          },
          id: event.chatid,
          templateId: TmplId,
          status: 0,//表示需要发送这个请求
        },
      })
      await db.collection('addpeople').add({
        data: {
          addpeopleid: event.addpeopleid,//想要加的那个人的id
          askpeopleid: event.askpeopleid,
          peopleask: event.peopleask,//发起好友请求的人信息
          peopleadd: event.peopleadd,
          chatid: event.chatid,
          status: 0,//0代表未接受（申请中），1代表同意 2 代表拒绝  3 代表拒绝并且知道了
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
        addpeopleid: event.id,//应该接受好友请求的那个人的openid
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
          friends: db.command.push([{ id: event.peopleconfim.chatid, userInfo: event.peopleconfim.peopleadd, _openid: event.peopleconfim.addpeopleid,backgroundimage:''}])
        }
      })
      await db.collection('user').where({
        _openid: event.peopleconfim.addpeopleid
      }).update({
        data: {
          friends: db.command.push([{ id: event.peopleconfim.chatid, userInfo: event.peopleconfim.peopleask, _openid: event.peopleconfim.askpeopleid,backgroundimage:''}])
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
        _openid:myopenid,
        'friends._openid':event.haoyouopenid
      })
      .update({
        data:{
          'friends.$.backgroundimage':event.pic
        }
      })
    } catch (e) {
      console.error(e)
    }
  });
/////////电话号码重复查重/////////  
  app.router('checkphone', async (ctx) => {
    try {
      ctx.body =await db.collection('user').where({
        phone: event.phone,
      }).get()
    } catch (e) {
      console.error(e)
    }
  });


////获取源码文字
  app.router('codeurl', async (ctx) => {
    try {

      ctx.body = await db.collection('code').where({
        number: 001,
      }).get()
      //更新获取源码的次数
      await db.collection('code').where({
        number:001,
      }).update({
        data: {
          times: db.command.inc(1) ,//自增1 
        }
      })
    } catch (e) {
      console.error(e)
    }
  });

///更新源码下载的链接
  app.router('upcodeurl', async (ctx) => {
    try {
      //更新获取源码的次数
      await db.collection('code').where({
        number: 001,
      }).update({
        data: {
          url: event.url,//自增1 
        }
      })
    } catch (e) {
      console.error(e)
    }
  });
  

//获取源码下载的次数
  app.router('huoqucodedowntimes', async (ctx) => {
    try {
      //获取源码下载次数
      ctx.body = await db.collection('code').where({
        number: 001,
      }).get()
    } catch (e) {
      console.error(e)
    }
  });
  
/*
  //获取小程序码
  app.router('huoquQrcode', async (ctx) => {
    try {
      const result = await cloud.openapi.wxacode.get({
        path:  event.path,
        width:430
      })
      ctx.body  = await cloud.uploadFile({
        cloudPath: 'qrcode.jpg',
        fileContent: result.buffer
      })

    } catch (e) {
      console.error(e)
    }
  });
  
*/
  //我拒绝他添加我为好友
  app.router('jujueask', async (ctx) => {
    try {
      await db.collection('addpeople').where({
        chatid: event.peopleconfim.chatid,
      }).update({
        data: {
          status: 2,//拒绝添加
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
          status: 3,//知道被拒绝
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


//解析excel表格
  app.router('excel', async (ctx) => {
    try{
      //1,通过fileID下载云存储里的excel文件
      const res=await cloud.downloadFile({
        fileID: event.fileID,
      })
      const buffer = res.fileContent
      const tasks = [] //用来存储所有的添加数据操作
      //2,解析excel文件里的数据
      var sheets = xlsx.parse(buffer); //获取到所有sheets

      //foreach是遍历循环有几个sheet表格
      sheets.forEach(function (sheet) {
        console.log(sheet['name']);//循环到的第几个sheet名字
        //这样可以获取当前sheet表中的第一行有内容的列数
         /*
        var length =sheet['data'][0].length
        var name=[]
        //name【i】就是每个表格的列名字
        for(var i=0;i<length;i++){
          name[i] = sheet['data'][0][i]
        }
        */
       // ctx.body =name[length-1] + "这是多少列"
       //这是循环，看有多少行
        for (var rowId in sheet['data']) {
          console.log(rowId);
          var row = sheet['data'][rowId]; //第几行数据
          //rowid是第几行，row是这一行的所有数据
         // ctx.body=row+'--'+rowId
          if (rowId > 0 && row) { //第一行是表格标题，所有我们要从第2行开始读
            //3，把解析到的数据存到excelList数据表里
            const promise = db.collection('gps')
              .add({
                data: {
                  number:row[0]+"",//学号
                  location: row[1],//''  //方便后边他们可以update,不然没有这个字段，就不能更新
                  time: row[2],//''
                }
              })
            tasks.push(promise)
          }
        }
      });
      // 等待所有数据添加完成
      ctx.body=await Promise.all(tasks).then(res => {
        return res
      }).catch(function (err) {
        return err
      })
    }catch(e){

    }
  });
//下载表格数据

//可以归一化处理，传递参数进来，就可以下载不同的excel表了
  app.router('downexcel1', async (ctx) => {
    try {
      ctx.body=await db.collection(event.excelname).get()
     
    } catch (e) {
      console.error(e)
      ctx.body = '云调用失败'
    }
  });
  app.router('downexcel2', async (ctx) => {
    try {

      let { userdata } = event
      ctx.body = userdata
      //1,定义excel表格名
      let dataCVS ='excel/'+ Date.now()+'excel.xlsx'
      //2，定义存储数据的
      let alldata = [];
      let row = ['number', 'location', 'time']; //表属性
      alldata.push(row);
      for (let key in userdata) {
        let arr = [];
        arr.push(userdata[key].number);
        arr.push(userdata[key].location);
        arr.push(userdata[key].time);
        alldata.push(arr)
      }

      //3，把数据保存到excel里
      var buffer = await xlsx.build([{
        name: "excel信息",
        data: alldata
      }]);

      //4，把excel文件保存到云存储里
     ctx.body={
      fileID: await cloud.uploadFile({
        cloudPath: dataCVS,
        fileContent: buffer, //excel二进制文件
      })
     }
      
    } catch (e) {
      console.error(e)
      ctx.body = '云调用失败'
    }
  });

//朋友圈

  app.router('pengyouquan', async (ctx) => {
    try {
      var datalist = []
      const res=await db.collection('user').where({
        _openid:event.id
      }).get()
      //如果是res.data就会是undefined
   //  ctx.body=res.data[0].friends.length
//将我所有的好友找出来-friends
 //然后开始循环，找出该好友的信息来，追加到dataList尾部
       for (var i = 0; i < res.data[0].friends.length; i++) {
         const re =await db.collection('pengyouquan')
              .where({
                _openid: res.data[0].friends[i]._openid
              }).get()
          //  ctx.body = re
          for (var j = 0; j < re.data.length; j++) {
                   //追加到数据后边？
          datalist.push(re.data[j]);
           }
          }
 //以上是获取的朋友的动态，下边还有自己的，把自己的动态也要调出来
      const re = await db.collection('pengyouquan')
        .where({
          _openid: event.id
        }).get()
      for (var j = 0; j < re.data.length; j++) {
        //追加到数据后边？
        datalist.push(re.data[j]);
      }

//对动态的数组进行排序
//考虑懒加载的问题，如果动态数据很多怎么办

      var objectArraySort = function (keyName) {
        return function (objectN, objectM) {
          var valueN = objectN[keyName]
          var valueM = objectM[keyName]
          if (valueN < valueM) return 1
          else if (valueN > valueM) return -1
          else return 0
        }
      }
      datalist.sort(objectArraySort('createTime'))//对creatTime按照降序进行排列

     ctx.body = datalist
    } catch (e) {
      console.error(e)
      ctx.body = e+'错误'
    }
  });
////朋友圈的评论
  app.router('comment', async (ctx) => {
    try {
      await db.collection('pengyouquan').where({
        _id: event.id,
      }).update({
        data: {
          pinglun: db.command.push([{ _openid: event.openid, userInfo: event.userInfo, content: event.comment}])
        }
      })
    } catch (e) {
      console.error(e)
    }
  })
    //////朋友圈动态的点赞
    app.router('zan', async (ctx) => {
      try {
        await db.collection('pengyouquan').where({
          _id: event.id,
        }).update({
          data: {
            zan:event.zan
          }
        })
      } catch (e) {
        console.error(e)
      }
  });



  //将ctx中的数据返回小程序端
  return app.serve();
}
