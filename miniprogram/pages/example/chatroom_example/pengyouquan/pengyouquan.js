const app = getApp()
Page({

  data: {
    playIndex: null,
    comment:[],
    commenttimes:[],
    zantimes:[]
  },
  onLoad: function (options) {
    this.setData({
      ifopen: app.globalData.ifopen
    })



  },
  onShow() {
    wx.cloud.callFunction({
      name: 'yunrouter',
      data: {
        $url: "pengyouquan", //云函数路由参数
        id: app.globalData.openid,  //看我当签有没有好友请求添加我
      },
      success: res => {
        console.log(res)
        this.setData({
            dataList: res.result//所有的动态
        })
        console.log(this.data.dataList)
      },
      fail() {
      }

    });
    /*
    let that = this;
    var datalist = []
    wx.cloud.database().collection('user').where({
      'friends._openid':app.globalData.openid
    }).get({
      success(res) {
        that.setData({
          haoyou: res.data//肯定全是我的好友(包括我自己)
        })
        console.log(res.data)

       
        //然后开始循环，找出该好友的信息来，追加到dataList尾部
        for (var i = 0; i<res.data.length;i++){
          wx.cloud.database().collection('pengyouquan')
          .where({
            _openid:res.data[i]._openid
          }).get({
              success(re) {
                for(var j=0;j<re.data.length;j++){
                  //追加到数据后边？
                  datalist.push(re.data[j]);
                  console.log(re.data[j])
                  console.log(datalist)
                }
                 // .orderBy('createTime', 'desc') //按发布视频排序
              },
              fail(re) {
                console.log("请求失败", re)
              }
            })
        }
        that.setData({
          dataList: datalist
        });
        console.log(that.data.dataList)
      }
    })
   // datalist.sort(function (a, b) { return b.user_id - a.user_id });
*/
  },
  input(e) {
    this.data.comment[e.currentTarget.dataset.sort] = e.detail.value;
  },
  comment(e) {
    console.log(this.data.comment[e.currentTarget.dataset.sort])
    wx.cloud.callFunction({
      name: 'yunrouter',
      data: {
        $url: "comment", //云函数路由参数
        id:e.currentTarget.dataset.id,//唯一定位动态
        comment: this.data.comment[e.currentTarget.dataset.sort],  //看我当签有没有好友请求添加我
        //参数看谁评论的
        userInfo:app.globalData.userInfo,
        openid:app.globalData.openid
      },
      success: res => {
        console.log(res)
        var datalist = 'dataList[' + e.currentTarget.dataset.sort+'].pinglun.length'
        this.setData({
          [datalist]: this.data.dataList[e.currentTarget.dataset.sort].pinglun.length + 1, 
        })
        console.log(this.data.dataList)
      },
      fail() {
      }

    });

  },
  zan(e){
    console.log(this.data.dataList[e.currentTarget.dataset.sort].zan)
 
    wx.cloud.callFunction({
      name: 'yunrouter',
      data: {
        $url: "zan", //云函数路由参数
        id: e.currentTarget.dataset.id,//唯一定位动态
        zan: this.data.dataList[e.currentTarget.dataset.sort].zan+1, 
      },
      success: res => {
        console.log(res)
        var datalist = 'dataList[' + e.currentTarget.dataset.sort + '].zan'

        this.setData({
          [datalist]: this.data.dataList[e.currentTarget.dataset.sort].zan + 1,
        })
        console.log(this.data.dataList)
      },
      fail() {
      }

    });
  },
  fabu() {
    wx.navigateTo({
      url: 'fabu/fabu',
    })
  },
  // 预览图片
  previewImg: function (e) {
    let imgData = e.currentTarget.dataset.img;
   // console.log("eeee", imgData[0])
   // console.log("图片s", imgData[1])
    wx.previewImage({
      //当前显示图片
      current: imgData[0],
      //所有图片
      urls: imgData[1]
    })
  },
  homepage() {
    wx.switchTab({
      url: '/pages/index/index',
    })
  },
  videoPlay: function (e) {
    var that = this
    var id = e.currentTarget.id
    var id2 = "" + that.data.playIndex
    var videoContext = wx.createVideoContext(id2)
    setTimeout(function () {
      videoContext.pause()
    }, 50)
    this.setData({
      playIndex: id
    })
  },
  videopause: function (e) {
    this.setData({
      playIndex: null
    })
  },


  onShareAppMessage: function () {

  }
})