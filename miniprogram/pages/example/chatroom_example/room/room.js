const app = getApp()
Page({
  data: {
    avatarUrl: './user-unlogin.png',
    userInfo: null,
    logged: false,
    takeSession: false,
    requestResult: '',
    chatRoomEnvId: 'code-test',//改成自己云开发的id
    chatRoomCollection: 'chatroom_example',//聊天记录存放的表格
    chatRoomGroupId: '',//唯一定义聊天组，可以建立群，或者好友聊天
    chatRoomGroupName: '',//聊天的群名，或者好友的昵称
    // functions for used in chatroom components
    onGetUserInfo: null,
    getOpenID: null,
  },

  onLoad: function (options) {
    // 获取用户信息
    console.log('聊天中的背景图片',options.backgroundimage)
    this.setData({
      chatRoomGroupId: options.id,
      chatRoomGroupName:options.name,
      backgroundimage:options.backgroundimage,//背景图片
    })
    wx.setNavigationBarTitle({
      title: options.name
    })
    wx.getSetting({
      success: res => {
        if (res.authSetting['scope.userInfo']) {
          // 已经授权，可以直接调用 getUserInfo 获取头像昵称，不会弹框
          wx.getUserInfo({
            success: res => {
              this.setData({
                avatarUrl: res.userInfo.avatarUrl,
                userInfo: res.userInfo
              })
            }
          })
        }
      }
    })

    this.setData({
      onGetUserInfo: this.onGetUserInfo,
      getOpenID: this.getOpenID,
    })

    wx.getSystemInfo({
      success: res => {
        console.log('system info', res)
        if (res.safeArea) {
          const { top, bottom } = res.safeArea
          this.setData({
            containerStyle: `padding-top: ${(/ios/i.test(res.system) ? 1 :2 ) }px; padding-bottom: ${40 + res.windowHeight - bottom}px`,
          })
        }
      },
    })
  },

  getOpenID: async function() {
    if (this.openid) {
      return this.openid
    }
    const { result } = await wx.cloud.callFunction({
      name: 'yunrouter',
      data:{
        $url: "openid"
      }
    })
    return result
  },

  onGetUserInfo: function(e) {
    if (!this.logged && e.detail.userInfo) {
      this.setData({
        logged: true,
        avatarUrl: e.detail.userInfo.avatarUrl,
        userInfo: e.detail.userInfo
      })
    }
  },

  onShareAppMessage() {
    return {
      title: '好友聊天',
      path: '/pages/example/chatroom_example/im',
    }
  },
})
