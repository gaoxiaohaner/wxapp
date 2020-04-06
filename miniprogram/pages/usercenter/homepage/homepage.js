var app = getApp()
const config = require("../../../style/config.js");
const db = wx.cloud.database({});
Page({
  data: {
    buttontimes:0
  },
  orderdetail(e) {
    if (!app.globalData.openid) {
      wx.showModal({
        title: '温馨提示',
        content: '该功能需要注册方可使用，是否马上去注册',
        success(res) {
          if (res.confirm) {
            wx.navigateTo({
              url: '/pages/login/login',
            })
          }
        }
      })
      return false
    }

    wx.navigateTo({
      url: '/pages/example/secondhand/book/order/order'
    })

  },
  admin(){
    this.setData({
      buttontimes:this.data.buttontimes+1
    })
    if(this.data.buttontimes>5){
      wx.cloud.callFunction({
        name: 'yunrouter',
        data: {
          $url: "adminlogin", //云函数路由参数
        },
        success: res => {
          console.log(res)
           if(res.result.data[0].dba===1){
             wx.navigateTo({
               url: '/pages/usercenter/homepage/admin/admin'
             })
           }
        },
        fail(e) {
          console.log(e)
        }
      });

    }

  },

  CopyLink(e) {
    wx.setClipboardData({
      data: e.currentTarget.dataset.link,
      success: res => {
        wx.showToast({
          title: '已复制',
          duration: 1000,
        })
      }
    })
  },
  showQrcode() {
    wx.previewImage({
      urls: ['/pages/image/weapp.jpg'],
      // current: '/pages/image/weapp.png' // 当前显示图片的http链接   
      success: res => {
        console.log('调用成功')
      },
      fail: res => {
        console.log('调用失败')
      }
    })
  },


  go(e) {
    if (e.currentTarget.dataset.status == '1') {
      if (!app.globalData.openid) {
        wx.showModal({
          title: '温馨提示',
          content: '该功能需要注册方可使用，是否马上去注册',
          success(res) {
            if (res.confirm) {
              wx.navigateTo({
                url: '/pages/login/login',
              })
            }
          }
        })
        return false
      }
    }
    wx.navigateTo({
      url: e.currentTarget.dataset.go
    })
  },
  onLoad:function(){
    this.setData({
      ifopen: app.globalData.ifopen
    })
  },

  onShow: function () {
    if (!this.data.ifopen) {
      wx.navigateTo({
        url: 'note/index1'
      })
    }
    wx.cloud.callFunction({
      name: 'yunrouter', // 对应云函数名
      data: {
        $url: "huoquUserinfo", //云函数路由参数
        openid:app.globalData.openid
      },   
        success: res => {
          console.log(res)
          if (res.result!=null)
          {
            this.setData({
              userinfo: res.result.data[0]
            })
          }
        },
        fail:res=>{
          console.log(res)
        }
      })
  },

  money(e) {
    if (!app.globalData.openid) {
      wx.showModal({
        title: '温馨提示',
        content: '该功能需要注册方可使用，是否马上去注册',
        success(res) {
          if (res.confirm) {
            wx.navigateTo({
              url: '/pages/login/login',
            })
          }
        }
      })
      return false
    }
    wx.navigateTo({
      url: 'money/money'
    })
  },
  chaoliu() {
    wx.navigateTo({
      url: '/pages/usercenter/chaoliu/chaoliu'
    })
  },
  onShareAppMessage() {
    return {
      title: '码上发财',
      // imageUrl: JSON.parse(config.data).share_img,
      path: '/pages/index/index'
    }
  },


})