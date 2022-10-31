const app = getApp()
// pages/about/about.js
Page({

  data: {
    imgList:[],
    backgroundimage:'',
    des: '欢迎关注公众号【一只拒绝穿格子衫的程序猿】'
  },
  onLoad: function (options) {

    let haoyouinfo1 = JSON.parse(options.haoyouinfo);
    this.setData({
      haoyouinfo:haoyouinfo1
    })
    
    console.log(this.data.haoyouinfo)

  },
  preview(){
    wx.previewImage({
      current:'https://636f-code-test-1301231348.tcb.qcloud.la/qrode.png',
      urls:['https://636f-code-test-1301231348.tcb.qcloud.la/qrode.png']
    })
  },
  //复制
  copy(e) {
    wx.setClipboardData({
      data: e.currentTarget.dataset.copy,
      success: res => {
        wx.showToast({
          title: '复制' + e.currentTarget.dataset.name + '成功',
          icon: 'success',
          duration: 1000,
        })
      }
    })
  },
  chat(){
      let that = this;
      if(!this.data.backgroundimage1){
        //就证明没有更换图片
        that.setData({
          //这个id就唯一标识这个好友
          chatid: that.data.haoyouinfo.id,
          chatname: that.data.haoyouinfo.userInfo.nickName,
          backgroundimage:that.data.haoyouinfo.backgroundimage
        })
      }
      else{
        that.setData({
          //这个id就唯一标识这个好友
          chatid: that.data.haoyouinfo.id,
          chatname: that.data.haoyouinfo.userInfo.nickName,
          backgroundimage:that.data.backgroundimage1
        })
      }

      // wx.navigateTo({
      //   url: '/pages/example/chatroom_example/room/room?id=' + that.data.chatid + '&name=' + that.data.chatname+'&backgroundimage='+that.data.backgroundimage+'&haoyou_openid='+that.data.haoyouinfo._openid,
      // })
      let  lessonSubId='wP0DrgBo_CKL51uA2QYFRJS-_IMnLUMWataPkALuw6s'
      //调用订阅消息提醒
      wx.requestSubscribeMessage({
        tmplIds: [lessonSubId],//这个是微信平台申请的 id
        success:res => {
         console.log(res)
         console.log(res[lessonSubId])
         if(res[lessonSubId]=="accept"){
             console.log("接受订阅申请")
             wx.navigateTo({
              url: '/pages/example/chatroom_example/room/room?id=' + that.data.chatid + '&name=' + that.data.chatname+'&backgroundimage='+that.data.backgroundimage+'&haoyou_openid='+that.data.haoyouinfo._openid,
            })
         }else if(res[lessonSubId]=="reject"){
             console.log("拒绝接受订阅申请")
         }
        },
        fail(res){
            console.log(res)
        }
      })


  },
  chooseimgae(){
    this.setData({
      imgList: [],
    })
      wx.chooseImage({
        count: 1, //默认9
        sizeType: ['original', 'compressed'], //可以指定是原图还是压缩图，默认二者都有
        sourceType: ['album'], //从相册选择
        success: (res) => {
  
          wx.showLoading({
            title: '上传中',
          })
          console.log(res)
          for (var i = 0; i < res.tempFilePaths.length; i++) {
            const filePath = res.tempFilePaths[i]
            const cloudPath = `好友聊天背景` + `/${new Date().getTime()} ` + filePath.match(/\.[^.]+?$/)[0]
            wx.cloud.uploadFile({
              cloudPath,
              filePath,
              success: res => {
                console.log('[上传文件] 成功：', res)
                console.log(res)
                this.setData({
                  imgList: this.data.imgList.concat(res.fileID)
                })
                wx.cloud.callFunction({
                  name: 'yunrouter',
                  data: {
                    $url: 'upadatebackground', //云函数路由参数
                    pic: this.data.imgList[0],
                    haoyouopenid:this.data.haoyouinfo._openid
                  },
                  success: res => {
                    console.log(res)
                    //至空
                    this.setData({
                      backgroundimage1:this.data.imgList[0],
                    })
                  },
                  fail(e) {
                    console.log(e)
                  }
                });
              },
              fail: e => {
                console.error('[上传文件] 失败：', e)
                wx.showToast({
                  icon: 'none',
                  title: '上传失败',
                })
              },
              complete: () => {
                wx.hideToast()
                wx.hideLoading()
              }
            })
  
          }
  
        },
        fail: e => {
          console.error(e)
        }
      })
    
  },
})