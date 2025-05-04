import request from "../request";

export default {
  // 获取登录的pow校验
  getLoginPow(data: object) {
    return request({
      url: "/auth/get-login-pow",
      data,
    });
  },

  // 登录
  login(data: object) {
    return request({
      url: "/auth/login",
      data,
    });
  },
};
