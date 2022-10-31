### 如果觉得可以，给个 🌟 star 🌟 吧

## 部署步骤

1. 开通微信小程序云开发
   1. 云开发中创建以下集合-也即我们常见的数据库表[注意大小写]:
      1. user // 基本的小程序用户
      2. SubscribeMessage  // 监听私聊信息并向对方发送消息提醒
      3. addpeople // 添加好友
      4. chatroom_example // 聊天记录存储集合
2. 修改云开发环境
   1. cloudfunctions/yunrouter/index.js中
      1. 第1行左右 ``const envid = 'your envid'`` // 请切换成自己的
   2. miniprogram/app.js
      1.  第13行左右 ``env:'your envid' `` // 请切换成自己的
   3. pages/example/chatroom_example/room/room 中
      1. 将第9行左右 ``chatRoomEnvId:'your envid'`` // 请切换成自己的

3. 将云函数上传并部署
   1. 右击 yunrouter文件夹 选择 上传并部署: 云端安装依赖

4. 修改TmpID模版消息 - 私聊和添加好友时使用，如果不需要消息提醒、可以忽略此项。
   1. 为方便大家快速部署，订阅消息默认是关闭的，如需开启
      1. 找到文件app.js 第43行左右, 修改为下述代码
         1. ``useTmp : treu ``

5. 以上四步设置完成后, 即可进入好友交流/聊天室测试中进行测试

## 实现效果
<img src="https://636f-code-test-1301231348.tcb.qcloud.la/result/1.PNG" width="250" height="500" align=left />
<img src="https://636f-code-test-1301231348.tcb.qcloud.la/result/2.PNG" width="250" height="500" align=left />
<img src="https://636f-code-test-1301231348.tcb.qcloud.la/result/12.PNG" width="250" height="500" align=left />
<img src="https://636f-code-test-1301231348.tcb.qcloud.la/result/13.PNG" width="250" height="500" align=left />
<img src="https://636f-code-test-1301231348.tcb.qcloud.la/result/4.PNG" width="250" height="500" align=left />
<img src="https://636f-code-test-1301231348.tcb.qcloud.la/result/10.PNG" width="250" height="500" align=left />
<img src="https://636f-code-test-1301231348.tcb.qcloud.la/result/11.PNG" width="250" height="500" align=left />





