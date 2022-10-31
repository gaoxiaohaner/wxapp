## 部署步骤

1. 开通微信小程序云开发
   1. 云开发中创建以下集合-也即我们常见的数据库表[注意大小写]:
      1. user // 基本的小程序用户
      2. SubscribeMessage  // 监听私聊信息并向对方发送消息提醒
      3. addpeople // 添加好友
      4. chatroom_example // 聊天记录存储集合
2. 修改云开发环境
   1. cloudfunctions/yunrouter/index.js中
      1. 第一行的 const envid = 'your envid' // 请切换成自己的
   2. miniprogram/app.js
      1.  第13行 env:'your envid' // 请切换成自己的
   3. pages/example/chatroom_example/room/room 中
      1. 将第9行的 chatRoomEnvId:'your envid' // 请切换成自己的

3. 将云函数上传并部署
   1. 右击 yunrouter文件夹 选择 上传并部署: 云端安装依赖

4. 修改TmpID模版消息 - 私聊时使用，如果不需要消息提醒，删除即可
   1. 这里自己可以设置一个全局变量，需不需要消息提醒
   2. 待定ing

5. 以上四步设置完成后, 即可进入好友交流/聊天室测试中进行测试





