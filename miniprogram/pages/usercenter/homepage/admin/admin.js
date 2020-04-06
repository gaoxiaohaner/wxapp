const app = getApp()
Page({


  data: {
    url:'',
    flag:0,
    times:'',
    path:'',
    imgData:[]
  },
  onLoad: function () {
    this.setData({
      ifopen: app.globalData.ifopen
    })
  },

  Input(e) {
    this.data.url = e.detail.value;
  },
  Input1(e) {
    this.data.path = e.detail.value;
   // console.log(this.data.path)
  },
  up(){
    let that=this
    wx.cloud.callFunction({
      name: "yunrouter",
      data: {
        $url: 'upcodeurl', //云函数路由参数
        url:that.data.url
      },
      success(res) {
        console.log("上传成功", res)
      },
      fail(res) {
        console.log("上传失败", res)
      }
    })

  },
  check(){
    let that = this
    wx.cloud.callFunction({
      name: "yunrouter",
      data: {
        $url: 'huoqucodedowntimes', //云函数路由参数
      },
      success(res) {
        that.setData({
          flag:1,
          times:res.result.data[0].times
        })

        console.log("上传成功", res)
      },
      fail(res) {
        console.log("上传失败", res)
      }
    })
  },
  huoqu(){
    let that=this
    console.log(that.data.path)
    wx.cloud.callFunction({
      name:'xiaochengxuma',
      data:{
        path:that.data.path,
      }
    }).then(res=>{
      console.log(res)
      that.setData({
        fileid: res.result.fileID
      })
    }).catch(res=>{
      console.log('失败'+res)
    })
   /*
   let that=this
    wx.cloud.callFunction({
      name: "yunrouter",
      data: {
        $url: 'huoquQrcode', //云函数路由参数
        path:that.data.path
      },
      success(res) {
        console.log(res)
    
      },
      fail(res) {
        console.log("获取失败", res)
      }
    })
    */
  },

  // 预览图片
  previewImg: function (e) {
    let img= e.currentTarget.dataset.img;
    var imglist = []

    imglist.push(img);

    wx.previewImage({
      //当前显示图片sss
      current: img,
      //所有图片
      urls: imglist
    })
  },

  


})