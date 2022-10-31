const db = wx.cloud.database();
const app = getApp();
const config = require("../../style/config.js");
Page({

      /**
       * 页面的初始数据
       */
      data: {
            ids: -1,
            phone: '',
            wxnum: '',
            qqnum: '',
            email: '',
            campus: JSON.parse(config.data).campus,
      },
      choose(e) {
            let that = this;
            that.setData({
                  ids: e.detail.value
            })
            //下面这种办法无法修改页面数据
            /* this.data.ids = e.detail.value;*/
      },
      phoneInput(e){
        this.data.phone = e.detail.value;
      },
      wxInput(e) {
            this.data.wxnum = e.detail.value;
      },
      qqInput(e) {
            this.data.qqnum = e.detail.value;
      },
      emInput(e) {
            this.data.email = e.detail.value;
      },
      getUserInfo(e) {
            let that = this;
            console.log(e);
            let test = e.detail.errMsg.indexOf("ok");
            if (test == '-1') {
                  wx.showToast({
                        title: '请授权后方可使用',
                        icon: 'none',
                        duration: 2000
                  });
            } else {
                  that.setData({
                        userInfo: e.detail.userInfo
                  })
                  that.check();
            }
      },
      //校检
      check() {
            let that = this;
        let phone = that.data.phone;

        
        if (phone == '') {
          wx.showToast({
            title: '请先获取您的电话',
            icon: 'none',
            duration: 2000
          });
          return false
        }



        
            //校检校区
            let ids = that.data.ids;
            let campus = that.data.campus;
            if (ids == -1) {
                  wx.showToast({
                        title: '请先获取您的校区',
                        icon: 'none',
                        duration: 2000
                  });
            }
            //校检邮箱
            let email = that.data.email;
        if (email !==''){
            if (!(/^\w+((.\w+)|(-\w+))@[A-Za-z0-9]+((.|-)[A-Za-z0-9]+).[A-Za-z0-9]+$/.test(email))) {
                  wx.showToast({
                        title: '请输入常用邮箱',
                        icon: 'none',
                        duration: 2000
                  });
                  return false;
            }
        }
            //校检QQ号
            let qqnum = that.data.qqnum;
            if (qqnum !== '') {
                  if (!(/^\s*[.0-9]{5,11}\s*$/.test(qqnum))) {
                        wx.showToast({
                              title: '请输入正确QQ号',
                              icon: 'none',
                              duration: 2000
                        });
                        return false;
                  }
            }
            //校检微信号
            let wxnum = that.data.wxnum;
            if (wxnum !== '') {
                  if (!(/^[a-zA-Z]([-_a-zA-Z0-9]{5,19})+$/.test(wxnum))) {
                        wx.showToast({
                              title: '请输入正确微信号',
                              icon: 'none',
                              duration: 2000
                        });
                        return false;
                  }
            }

        /////检验这个号码是都有人注册了
        wx.cloud.callFunction({
          name: 'yunrouter',
          data: {
            $url: "checkphone", //云函数路由参数
            phone: that.data.phone,
          },
          success: res => {
            console.log(res.result.data.length)
            if (res.result.data.length!=0) {//如果有人注册
              wx.showToast({
                title: '电话号码重复',
                icon: 'none',
                duration: 2000
              });
              return false
            }
////如果没有重读的话
            wx.showLoading({
              title: '正在提交',
            })



            wx.cloud.callFunction({
              name: 'yunrouter',
              data: {
                $url: "login", //云函数路由参数
                phone: that.data.phone,
                campus: that.data.campus[that.data.ids],
                qqnum: that.data.qqnum,
                email: that.data.email,
                wxnum: that.data.wxnum,
                stamp: new Date(),
                userInfo: that.data.userInfo,
                money: 0,
                dba: 0,
              },
              success: res => {
                console.log(res)
                app.globalData.userInfo = that.data.userInfo;
                app.globalData.openid = res.result.data.OPENID
                wx.switchTab({
                  url: '/pages/index/index',
                })
              },
              fail() {
                wx.hideLoading();
                wx.showToast({
                  title: '注册失败，请重新提交',
                  icon: 'none',
                })
              }
            });


          },
          fail() {
            wx.hideLoading();
            wx.showToast({
              title: '注册失败，请重新提交',
              icon: 'none',
            })
          }
        });

      }
})