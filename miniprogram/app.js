//app.js
App({
  onLaunch: function () {
    let that = this
    if (!wx.cloud) {
      console.error('请使用 2.2.3 或以上的基础库以使用云能力')
    } else {
      wx.cloud.init({
        // env 参数说明：
        //   env 参数决定接下来小程序发起的云开发调用（wx.cloud.xxx）会默认请求到哪个云环境的资源
        //   此处请填入环境 ID, 环境 ID 可打开云控制台查看
        //   如不填则使用默认环境（第一个创建的环境）
        env: 'code-test',
        traceUser: true,
      })
    }



    //判断是否审核通过

    wx.cloud.callFunction({
      name: 'yunrouter',
      data: {
        $url: "shenhetongguo", //云函数路由参数
      },
      success: res => {
        console.log(res)
          that.globalData.ifopen = res.result.data[0].tongguo;
      },
      fail(e) {
        console.log(e)
      }
    });

 
    const db = wx.cloud.database();

    wx.cloud.callFunction({
      name: 'yunrouter', // 对应云函数名
      data: {
        $url: "openid", //云函数路由参数
      },
      success: re => {
        console.log(re)
        db.collection('user').where({
          _openid: re.result
        }).get({
          success: function (res) {
      
              that.globalData.openid= res.data[0]._openid;
              that.globalData.userInfo = res.data[0].userInfo;
              that.globalData.friends=res.data[0].friends;
              that.globalData.data=res.data[0]
              console.log(that.globalData)
      
          }
        })
      }
    })

    this.globalData = {}
  }
})
