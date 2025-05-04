/**
 *  获取n位的数字随机数
 */
const randomDigits = (n: number): number => {
  if (n > 21) {
    return 0;
  }
  return Math.round((Math.random() + 1) * 10 ** (n - 1));
};

/**
 *  获取n以内的随机整数
 */
const randomWithin = (n: number): number => Math.floor(Math.random() * n);

/**
 *  获取n位的随机数字或字母
 */
const randomChars = (n: number): string => {
  const arr: string[] = [];
  const chars =
    "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz".split("");

  for (let i = 0; i < n; i += 1) {
    arr.push(chars[randomWithin(chars.length)]);
  }

  return arr.join("");
};

/**
 *  延迟一定时间，单位毫秒。
 */
const sleep = async (time: number): Promise<void> =>
  new Promise((resolve) => {
    setTimeout(resolve, time);
  });

/**
 * 等待页面渲染
 */
const nextTick = async (): Promise<void> => {
  return new Promise((resolve) => {
    wx.nextTick(() => {
      resolve();
    });
  });
};

/**
 * 函数防抖
 */
// eslint-disable-next-line @typescript-eslint/ban-types
const debounce = (fn: Function, waitTime: number) => {
  let timer: Timer = null;

  return (...args: any[]) => {
    if (timer !== null) {
      clearTimeout(timer);
    }

    // 停止触发n秒后才执行
    timer = setTimeout(() => {
      fn.apply(this, args);
    }, waitTime);
  };
};

/*
 * 16进制的颜色转化为rgb
 */
const hexToRgb = (hex: string) => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : {
        r: 0,
        g: 0,
        b: 0,
      };
};

/**
 * 拼接url参数
 */
const obj2url = (params: Record<string, any>) => {
  if (params) {
    return Object.keys(params)
      .sort()
      .map(
        (key) => `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`
      )
      .join("&");
  }

  return "";
};

/**
 * 清理对象中的空值（null、undefined、空字符串）
 */
const cleanEmptyProps = (obj: Record<string, any>): Record<string, any> => {
  const result: Record<string, any> = {};
  
  Object.keys(obj).forEach(key => {
    const value = obj[key];
    if (value !== null && value !== undefined && value !== '') {
      result[key] = value;
    }
  });
  
  return result;
};

/**
 * 为url添加参数，如果参数已存在，则覆盖其值，返回修改后的url
 * @param {String} url - 要添加参数的url
 * @param {Object} params - 参数对象
 * @returns {String} - 修改后的url
 */
const urlAddParams = (url: string, params: Record<string, any>) => {
  const [basicUrl, originParamsStr = ''] = url.split('?');
  const originParamsArr = originParamsStr.split('&');
  const originParamsObj: Record<string, any> = {};

  originParamsArr.forEach((item) => {
    const [key, value = ''] = item.split('=');

    if (key) {
      originParamsObj[key] = value;
    }
  });

  Object.keys(params).forEach((key) => {
    originParamsObj[key] = params[key];
  });

  const newParamsStr = Object.keys(cleanEmptyProps(originParamsObj))
    .map((key) => {
      return `${key}=${originParamsObj[key]}`;
    })
    .join('&');

  return `${basicUrl}?${newParamsStr}`;
}

/**
 * 获取url中的参数
 *
 * @param {*} url
 * @returns {Object}
 */
const getUrlParams = (url: string) => {
  const [, query] = url.split('?');

  if (!query) {
    return {};
  }

  const params: Record<string, any> = {};

  query.split('&').forEach((item) => {
    const [key, value = ''] = item.split('=');

    params[key] = value;
  });

  return params;
}

/* 
 * 是否是对象
 */
const isObject = (o: any): o is Record<string, any> =>
  typeof o === 'object' && o !== null;

/**
 * 页面跳转
 *
 * @param {*} url
 * @param {*} params
 * @returns
 */
const navigateTo = (url: string, params: Record<string, any>) => {
  return wx.navigateTo({
    url: isObject(params) ? urlAddParams(url, params) : url,
  });
}
/**
 * 页面重定向
 *
 * @param {*} url
 * @param {*} params
 * @returns
 */
const redirectTo = (url: string, params: Record<string, any>) => {
  return wx.redirectTo({
    url: isObject(params) ? urlAddParams(url, params) : url,
  });
}

/**
 * 关闭其它页面，打开指定页面
 *
 * @param {*} url
 * @param {*} params
 * @returns
 */
const reLaunch = (url: string, params: Record<string, any>) => {
  return wx.reLaunch({
    url: isObject(params) ? urlAddParams(url, params) : url,
  });
}

export default {
  randomDigits,
  randomWithin,
  randomChars,
  sleep,
  nextTick,
  debounce,
  hexToRgb,
  obj2url,
  urlAddParams,
  getUrlParams,
  navigateTo,
  redirectTo,
  reLaunch,
};
