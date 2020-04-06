var util = require('../../../../../style/util.js');
let app = getApp();
Page({
  data: {
    userInfo:[],
    imgList: [],
    fileIDs: [],
    desc: '',
    count:0,
    videofile:'',
    videosuccess:'',
    choose:false,//false默认是图片，true是视频
  },
  switchChange(e){
    console.log('switch发生change事件，携带value值为：', e.detail.value)
    this.setData({
      choose: e.detail.value
    })
  },
  onLoad(){
    this.setData({
      ifopen: app.globalData.ifopen
    })
  },

  video(e) {
    let that = this
    wx.chooseVideo({
      sourceType: ['album', 'camera'],
      maxDuration: 60,
      camera: 'back',
      success(res) {
        const tempFilePaths = res.tempFilePaths
        console.log('选择视频成功'+res)
        that.setData({
          videofile: res.tempFilePath,
          count:1,
        })
        console.log("路径", res.tempFilePath)
      }
    })
  },



  //获取输入内容
  getInput(event) {
    console.log("输入的内容", event.detail.value)
    this.setData({
      desc: event.detail.value
    })
  },


  //选择图片
  ChooseImage() {
    wx.chooseImage({
      count: 8 - this.data.imgList.length, //默认9,我们这里最多选择8张
      sizeType: ['compressed'], //可以指定是原图还是压缩图，默认二者都有
      sourceType: ['album'], //从相册选择
      success: (res) => {
        console.log("选择图片成功", res)
        if (this.data.imgList.length != 0) {
          this.setData({
            imgList: this.data.imgList.concat(res.tempFilePaths)
          })
        } else {
          this.setData({
            imgList: res.tempFilePaths
          })
        }
        console.log("路径", this.data.imgList)
      }
    });
  },
  //删除图片
  DeleteImg(e) {
    wx.showModal({
      title: '要删除这张照片吗？',
      content: '',
      cancelText: '取消',
      confirmText: '确定',
      success: res => {
        if (res.confirm) {
          this.data.imgList.splice(e.currentTarget.dataset.index, 1);
          this.setData({
            imgList: this.data.imgList
          })
        }
      }
    })
  },

  //上传数据
  publish() {
    let that = this
    let desc = this.data.desc
    let imgList = this.data.imgList
    if (!desc || desc.length < 6) {
      wx.showToast({
        icon: "none",
        title: '内容大于6个字'
      })
      return
    }
    /*
    可以不用发图片的一定
    if (!imgList || imgList.length < 1||that.data.count==0) {
      wx.showToast({
        icon: "none",
        title: '请选择图片或者视频'
      })
      return
    }*/
    if (that.data.choose==1&&that.data.count == 0) {
      wx.showToast({
        icon: "none",
        title: '请选择视频'
      })
      return
    }
    wx.showLoading({
      title: '发布中...',
    })
  if (that.data.choose == false)
  {
    const promiseArr = []
    //只能一张张上传 遍历临时的图片数组
    for (let i = 0; i < this.data.imgList.length; i++) {
      let filePath = this.data.imgList[i]
      let suffix = /\.[^\.]+$/.exec(filePath)[0]; // 正则表达式，获取文件扩展名
      //在每次上传的时候，就往promiseArr里存一个promise，只有当所有的都返回结果时，才可以继续往下执行
  
      promiseArr.push(new Promise((reslove, reject) => {
        wx.cloud.uploadFile({
          cloudPath: `朋友圈/图片/` + app.globalData.openid +`/photo/${new Date().getTime()} ` + suffix,
          filePath: filePath, // 文件路径
        }).then(res => {
          // get resource ID
          console.log("上传结果", res.fileID)
          this.setData({
            fileIDs: this.data.fileIDs.concat(res.fileID)
          })
          reslove()
        }).catch(error => {
          console.log("上传失败", error)
        })
      }))
    }
    //保证所有图片都上传成功
    let db = wx.cloud.database()

    Promise.all(promiseArr).then(res => {
      db.collection('pengyouquan').add({
        data: {
          fileIDs: this.data.fileIDs,
          date: util.formatTime(new Date()),
          createTime: db.serverDate(),
          desc: this.data.desc,
          images: this.data.imgList,
          kind:0,
          userInfo: app.globalData.userInfo,
          pinglun:[],
          zan :0
        },
        success: res => {
          wx.hideLoading()
          wx.showToast({
            title: '发布成功',
          })
          console.log('发布成功', res)
          wx.navigateTo({
            url: '../pengyouquan',
          })
        },
        fail: err => {
          wx.hideLoading()
          wx.showToast({
            icon: 'none',
            title: '网络不给力....'
          })
          console.error('发布失败', err)
        }
      })
    })
  }
 
  //上边是图片的发布
  else{
  
    const cloudPath = `朋友圈/视频/` + app.globalData.openid + `/video/${new Date().getTime()}`  + that.data.videofile.match(/\.[^.]+?$/)
      wx.cloud.uploadFile({
      cloudPath: cloudPath,
        filePath: that.data.videofile, // 文件路径
      success: res => {
      
        that.setData({
          videosuccess: res.fileID
        })
        console.log(that.data.videosuccess)
        let db = wx.cloud.database()
        db.collection('pengyouquan').add({
          data: {
            fileIDs: that.data.videosuccess,
            date: util.formatTime(new Date()),
            createTime: db.serverDate(),
            desc: this.data.desc,
            images: that.data.videosuccess,
            kind: 1,
            userInfo: app.globalData.userInfo,
            pinglun: [],
            zan:0
          },
          success: res => {
            wx.hideLoading()
            wx.showToast({
              title: '发布成功',
            })
            console.log('发布成功', res)
            wx.navigateTo({
              url: '../pengyouquan',
            })
          },
          fail: err => {
            wx.hideLoading()
            wx.showToast({
              icon: 'none',
              title: '网络不给力....'
            })
            console.error('发布失败', err)
          }
        })
      },
      fail: err => {
        console.log(err)
      }
    })

  }//else的括号





  },
})