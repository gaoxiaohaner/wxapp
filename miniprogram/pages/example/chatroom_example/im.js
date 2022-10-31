const app = getApp()


Page({
  data: { 
    open:false,
    inputShowed: false, // 输入框是否显示
    inputVal: '', // 搜索框输入的内容
    loadingMoreHidden: true,
    showActionSheet: false,
    phone: '',
    chachong: 0,//代表着没有添加这个好友
  },
  go(e) {
    wx.navigateTo({
      url: '/pages/example/chatroom_example/room/room?id=' + e.currentTarget.dataset.id + '&name=' + '聊天室',
    })
  },
  Input(e) {
    this.data.phone = e.detail.value;
  },
  searchpeople(e) {
    wx.cloud.callFunction({
      name: 'yunrouter',
      data: {
        $url: "searchpeople", //云函数路由参数
        phone: e,
      },
      success: res => {
        console.log(res)
        this.setData({
          addpeopledetail: res.result.data[0]
        })
      },
      fail() {
      }
    });
  },
  kindToggle: function(e) {
    this.setData({
      open:!this.data.open
    });
  },
  addpeople(e) {
    let that = this
    //先判断是否有该好友，本地判断也好，数据库判断都行
    var chatid1 = that.data.addpeopledetail._openid + app.globalData.openid
    var chatid2 = app.globalData.openid + that.data.addpeopledetail._openid
    for (var i = 0; i < app.globalData.friends.length; i++) {
      var fid = app.globalData.friends[i].id;
      if (fid === chatid1 || fid === chatid2) {
        that.setData({
          chachong: 1
        })
      }
    }
    if (that.data.chachong === 0) {//如果没有添加该好友
      wx.requestSubscribeMessage({
        tmplIds: [TmplId],
        success(res) {
          if (res.errMsg === 'requestSubscribeMessage:ok') {
            wx.cloud.callFunction({
              name: 'yunrouter',
              data: {
                $url: "addpeople", //云函数路由参数
                addpeopleid: that.data.addpeopledetail._openid,//应该应答请求的那个人
                askpeopleid: app.globalData.openid,//我自己，发出请求的人
                peopleask: app.globalData.userInfo,
                peopleadd: that.data.addpeopledetail.userInfo,
                chatid: that.data.addpeopledetail._openid + app.globalData.openid
              },
              success: res => {
                console.log('请求成功')
              },
              fail() {
              }
            });
          }
        },
        fail(re) {
          console.log(re)
        }
      })
    }
    else {
      wx.showModal({
        title: '温馨提示',
        content: '您已添加成功该好友，无须重复添加'
      })
    }
  },
  onLoad(){
    this.getheight()
  },
  onShow: function (options) {
    //重新更新好友列表
    wx.cloud.callFunction({
      name: 'yunrouter',
      data: {
        $url: "HuoquFriends", //云函数路由参数
        openid: app.globalData.openid
      },
      success: res2 => {
        console.log(res2)
        this.setData({
          peoplelist: res2.result.data[0].friends,
        })
        app.globalData.friends = res2.result.data[0].friends
      },
      fail() {
      }
    });
    
    if (app.globalData.openid) {
      this.setData({
        openid: app.globalData.openid,
        peoplelist: app.globalData.friends
      })
    }
    this.checkpeopleadd();
  },

  //检查是否有请求添加好友的
  checkpeopleadd() {
    wx.cloud.callFunction({
      name: 'yunrouter',
      data: {
        $url: "checkpeopleadd", //云函数路由参数
        id: app.globalData.openid,  //看我当签有没有好友请求添加我
        status: 0
      },
      success: res => {
        console.log(res)
        this.setData({
          //这里如果加data[0]，那么页面渲染的时候就是他的记录条数了
          peoplecheck: res.result.data//这个是在接收好友请求哪一方，将信息显示出来的要给消息
          //就是可以看到谁请求你
        })
      },
      fail() {
      }
    });

    /*
    先不管是否被拒绝，这个拒绝逻辑还没有想好
    //检查是否被拒绝的
        wx.cloud.callFunction({
          name: 'yunrouter',
          data: {
            $url: "checkpeopleadd", //云函数路由参数
            id: app.globalData.openid,
            status:2//拒绝的
          },
          success: res => {
            console.log(res)
            this.setData({
              askjujuelist: res.result.data
            })
          },
          fail() {
          }
        });
    */
  },
  peoplepage(e) {
    let haoyouinfo = JSON.stringify(e.currentTarget.dataset.info)
    wx.navigateTo({
      url: '/pages/example/chatroom_example/haoyoupage/haoyoupage?haoyouinfo=' + haoyouinfo,
    })

  },

  confirmpeopleadd(e) {
    let that = this;
    that.setData({
      peopleconfim: e.currentTarget.dataset.info,
    })
    console.log(that.data.peopleconfim)
    wx.cloud.callFunction({
      name: 'yunrouter',
      data: {
        $url: "confirmpeopleadd", //云函数路由参数
        peopleconfim: that.data.peopleconfim
      },
      success: res => {
        console.log(res)
        wx.cloud.callFunction({
          name: 'yunrouter',
          data: {
            $url: "HuoquFriends", //云函数路由参数
            openid: app.globalData.openid
          },
          success: res2 => {
            console.log(res2)
            that.setData({
              peoplelist: res2.result.data[0].friends,
            })
            app.globalData.friends = res2.result.data[0].friends
          },
          fail() {
          }
        });
        console.log('添加成功')
        //将刚才添加成功的取消掉
        that.checkpeopleadd();
      },
      fail() {
      }
    });

  },

  cancelpeopleadd(e) {
    let that = this;
    that.setData({
      peopleconfim: e.currentTarget.dataset.info,
    })
    wx.cloud.callFunction({
      name: 'yunrouter',
      data: {
        $url: "jujueask", //云函数路由参数
        peopleconfim: that.data.peopleconfim
      },
      success: res => {
        that.checkpeopleadd();
      },
      fail() {
      }
    });
  },

  //拒绝好友请求相关的云函数
  knowjujue(e) {
    let that = this;
    that.setData({
      jujuelist: e.currentTarget.dataset.info,
    })
    wx.cloud.callFunction({
      name: 'yunrouter',
      data: {
        $url: "knowjujue", //云函数路由参数
        jujuelist: that.data.jujuelist
      },
      success: res => {
        that.checkpeopleadd();
      },
      fail() {
      }
    });

  },
  onPullDownRefresh: function () {
    this.onShow()
  },
  openActionSheet: function(e) {
    let itemList = [{
      text: "确定",
      color: "#1a1a1a"
    }];
    let maskClosable = true;
    let tips = "选择合适的聊天室";
    let color = "#9a9a9a";
    let size = 26;
    let isCancel = true;

    itemList = [{
      text: "聊天室1",
      color: "#1a1a1a" 
    }, {
      text: "聊天室2",
      color: "#1a1a1a"
    }, {
      text: "聊天室3",
      color: "#1a1a1a"
    }]
    setTimeout(() => {
      this.setData({
        showActionSheet: true,
        itemList: itemList,
        maskClosable: maskClosable,
        tips: tips,
        color: color,
        size: size,
        isCancel: isCancel
      })
    }, 0)
  },
  closeActionSheet: function() {
    this.setData({
      showActionSheet: false
    })
  },
  itemClick: function(e) {
    console.log(e)
    let index = e.detail.index+1;
    this.closeActionSheet();
    wx.navigateTo({
      url: '/pages/example/chatroom_example/room/room?id=chat' + index + '&name=' + '聊天室',
    })
    /*
    switch(index){
      case 0:
        break;
      case 1:
         wx.showToast({
         title:'你点击的按钮索引为：2',
         icon: 'none',
         duration:  2000
        })
        break;
        default:
        break;
    }
    */

  },
  getheight(){
    const that = this;
    setTimeout(() => {
      wx.getSystemInfo({
        success: function (res) {
          let winHeight = res.windowHeight
          let barHeight = winHeight - res.windowWidth / 750 * 204
          that.setData({
            winHeight: winHeight,
            indexBarHeight: barHeight,
            indexBarItemHeight: barHeight / 25,
            titleHeight: res.windowWidth / 750 * 132,
          })
        }
      })
    }, 50)

  },
  showInput() {
    this.setData({
      inputShowed: true
    })
  },
  clearInput() {
    this.setData({
      inputVal: "",
      inputShowed: false,
      searchResult: []
    })
    wx.hideKeyboard() //强行隐藏键盘
  },
  inputTyping(e) {
    this.setData({
      inputVal: e.detail.value
    }, () => {
      this.searchpeople(this.data.inputVal)
    })
  },

})
