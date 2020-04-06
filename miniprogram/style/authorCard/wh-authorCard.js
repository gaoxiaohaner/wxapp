// components/authorCard/wh-authorCard.js
Component({
    /**
     * 组件的属性列表
     */
    properties: {
        isHidden: {
            type: [Boolean, String],
            default: true
        }
    },

    /**
     * 组件的初始数据
     */
    data: {

    },

    /**
     * 组件的方法列表
     */
    methods: {
        /**
         * 防止冒泡
         */
        prevent() {
            console.log("防止冒泡");
            var self = this;
            wx.setClipboardData({
                data: "一只拒绝穿格子衫的程序猿"
            });

        },
        preview(){
            wx.previewImage({
              urls: ['cloud://code-test.636f-code-test-1301231348/qqqun.jpg'],
            })
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
        }
    },
    /**
     * 通过组件的生命周期函数执行代码
     */
    lifetimes: {
        attached: function () {
            // 在组件实例进入页面节点树时执行
            this.setData({
                isHidden: true,
            });
        },
        detached: function () {
            // 在组件实例被从页面节点树移除时执行
        },
    },
})
