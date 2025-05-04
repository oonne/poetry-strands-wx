/// <reference path="./types/index.d.ts" />

// 小程序配置
interface IAppOption {
  userInfoReadyCallback?: WechatMiniprogram.GetUserInfoSuccessCallback,
  [key: string]: any,
}

// 时间
type Timer = ReturnType<typeof setTimeout> | null;
type Interval = ReturnType<typeof setInterval> | null;