'use strict';

const Controller = require('egg').Controller;

const defaultAvatar =
  'http://s.yezgea02.com/1615973940679/WeChat77d6d2ac093e247c361f0b8a7aeb6c2a.png';
class UserController extends Controller {
  //注册
  async register() {
    const { ctx } = this;
    const { userName, password } = ctx.request.body;
    if (!userName || !password) {
      ctx.body = {
        code: 500,
        msg: '用户名或密码不能为空',
        data: null,
      };
      return;
    }
    const userInfo = await ctx.service.user.getUserByName(userName);

    if (userInfo && userInfo.id) {
      ctx.body = {
        code: 500,
        msg: '用户名已被注册，请重新输入',
        data: nul,
      };
      return;
    }

    const result = await ctx.service.user.register({
      userName,
      password,
      signature: '好好生活',
      avatar: defaultAvatar,
      ctime: Date.now(),
    });

    if (result) {
      ctx.body = {
        code: 200,
        msg: '注册成功，欢迎使用',
        data: null,
      };
    } else {
      ctx.body = {
        code: 500,
        msg: '注册失败，请再尝试一下',
        data: null,
      };
    }
  }

  //登录
  async login() {
    const { ctx, app } = this;
    const { userName, password } = ctx.request.body;

    const userInfo = await ctx.service.user.getUserByName(userName);
    console.log(userInfo);
    if (!userInfo || !userInfo.id) {
      ctx.body = {
        code: 500,
        msg: '用户不存在，请验证一下用户名',
        data: null,
      };
      return;
    }

    if (userInfo && password != userInfo.password) {
      ctx.body = {
        code: 500,
        msg: '账号或者密码错误',
        data: null,
      };
      return;
    }
    const token = app.jwt.sign(
      {
        id: userInfo.id,
        userName: userInfo.userName,
        exp: Math.floor(Date.now() / 1000) + 24 * 60 * 60,
      },
      app.config.jwt.secret,
    );
    ctx.body = {
      code: 200,
      msg: '登录成功',
      data: {
        token,
      },
    };
  }

  //验证token
  async verify() {
    const { ctx, app } = this;
    const token = ctx.request.header.authorization;

    const info = app.jwt.verify(token, app.config.jwt.secret);

    ctx.body = {
      code: 200,
      msg: '验证成功',
      data: {
        ...info,
      },
    };
  }

  //用户信息
  async getUserInfo() {
    const { ctx, app } = this;
    const token = ctx.request.header.authorization;

    const info = app.jwt.verify(token, app.config.jwt.secret);
    const userInfo = await ctx.service.user.getUserByName(info.userName);

    ctx.body = {
      code: 200,
      msg: '请求成功',
      data: {
        id: userInfo.id,
        userName: userInfo.userName,
        signature: userInfo.signature,
        avatar: userInfo.avatar || defaultAvatar,
      },
    };
  }

  //修改用户信息
  async editUserInfo() {
    const { ctx, app } = this;
    const { signature = '', avatar = '' } = ctx.request.body;

    try {
      let user_id;
      const token = ctx.header.authorization;

      const info = app.jwt.verify(token, app.config.jwt.secret);
      user_id = info.id;

      const userInfo = await ctx.service.user.getUserByName(info.userName);
      const result = await ctx.service.user.editUserInfo({
        ...userInfo,
        signature,
        avatar,
      });
      ctx.body = {
        code: 200,
        msg: '请求成功',
        data: {
          id: user_id,
          signature,
          username: userInfo.username,
          avatar,
        },
      };
    } catch (error) {
      console.log(error);
    }
  }
}

module.exports = UserController;
