//index.js
const app = getApp()
let touchDotX = 0;//X按下时坐标
let touchDotY = 0;//y按下时坐标
let interval;//计时器
let time = 0;//从按下到松开共多少时间*100

Page({
  data: {
    isHidden: {
      type: [Boolean, String],
      default: true
    },
    avatarUrl: '/images/user-unlogin.png',
    userInfo: {},
    logged: false,
    takeSession: false,
    requestResult: '',
    buttontimes:0,
    ifopen:0,
    ////////////////
    text: "Page add",

    accountIndex: 0,
    Role: '管理员',
    userInfo: {},
    ////////////////
  },

  prevent() {
    console.log("防止冒泡");
    var self = this;
    wx.setClipboardData({
      data: "https://github.com/aquanlerou"
    });

  },
  showMask() {
    // console.warn("showMask...")
    this.setData({
      isHidden: false,
    });
    var animation = wx.createAnimation({
      duration: 1000,
      timingFunction: 'ease',
      delay: 0
    });
    animation.opacity(1).translate(wx.getSystemInfoSync().windowWidth, 0).step()
    this.setData({
      ani: animation.export()
    })
  },
  closeMask() {
    // console.warn("closeMask...")
    var that = this;
    var animation = wx.createAnimation({
      duration: 1000,
      timingFunction: 'ease',
      delay: 0
    });
    animation.opacity(0).translate(-wx.getSystemInfoSync().windowWidth, 0).step()
    that.setData({
      ani: animation.export()
    });

    setTimeout(function () {
      that.setData({
        isHidden: true,
      });
    }, 600);
  },

  go(e){
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
      url: e.currentTarget.dataset.url,
    })
  },

  onGetUserInfo: function(e) {
    if (!this.data.logged && e.detail.userInfo) {
      this.setData({
        logged: true,
        avatarUrl: e.detail.userInfo.avatarUrl,
        userInfo: e.detail.userInfo
      })
    }
  },

  onGetOpenid: function() {
    wx.cloud.callFunction({
      name: 'yunrouter',
      data: {
        $url: "openid", //云函数路由参数
      },
      success: res => {
        console.log('[云函数] [login] user openid: ', res)
        app.globalData.openid = res.result
        console.log(app)
      },
      fail(e) {
        console.error('[云函数] [login] 调用失败', e)
      }
    });
  },
  onShareAppMessage() {
    return {
      title: '码上发财',
      path: '/pages/index/index'
    }
  },



//滚动得那种弹窗所需得js组件
  showModal(e) {
    console.log(e);
    this.setData({
      modalName: e.currentTarget.dataset.target
    })
  },
  hideModal(e) {
    this.setData({
      modalName: null
    })
  },
  onPageScroll: function (event) {
    this.setData({
      scrollTop: event.detail.scrollTop
    })
  },
 ///////////////////////////////////

  // 触摸开始事件
  touchStart: function (e) {
    touchDotX = e.touches[0].pageX; // 获取触摸时的原点
    touchDotY = e.touches[0].pageY;
    // 使用js计时器记录时间    
    interval = setInterval(function () {
      time++;
    }, 100);
  },
  // 触摸结束事件
  touchEnd: function (e) {
    let touchMoveX = e.changedTouches[0].pageX;
    let touchMoveY = e.changedTouches[0].pageY;
    let tmX = touchMoveX - touchDotX;
    let tmY = touchMoveY - touchDotY;
    if (time < 20) {
      let absX = Math.abs(tmX);
      let absY = Math.abs(tmY);
      if (absX > 2 * absY) {
        if (tmX < 0) {
          this.setData({
            modalName: null
          })
        } else {
          this.setData({
            modalName: "viewModal"
          })
        }
      }
      if (absY > absX * 2 && tmY < 0) {
        console.log("上滑动=====")
      }
    }
    clearInterval(interval); // 清除setInterval
    time = 0;
  },
  // 关闭抽屉
  shutDownDrawer: function (e) {
    this.setData({
      modalName: null
    })
  },

  showMask: function (e) {
    this.selectComponent("#authorCardId").showMask();
    this.shutDownDrawer();
  },
})
