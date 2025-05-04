import config from "./config/config";
import state from "./global/state";
import { Utils } from "./utils/index";

const { randomChars } = Utils;

App<IAppOption>({
  onLaunch() {
    console.log("--------------开始加载--------------");
    console.log(`环境: ${config.env} 版本: ${config.version}`);
    this.generateUUID();
    this.getSystemInfo();
  },

  /*
   * 生成UUID
   * 格式： 12位随机数字或字母（或广告ID末12位）+连词符+4位随机数字或字母
   */
  generateUUID() {
    const uuid = wx.getStorageSync("UUID");
    if (!uuid) {
      const uuid = `${randomChars(12)}-${randomChars(4)}`;
      wx.setStorageSync("uuid", uuid);
    }
    state.uuid = uuid;
  },

  /*
   * 获取系统信息
   */
  getSystemInfo() {
    const systemInfo = wx.getSystemInfoSync();
    const { platform, safeArea, screenHeight, statusBarHeight, windowWidth } = systemInfo;

    state.isDevTools = platform === "devtools";
    state.isPC = ["windows", "mac"].includes(platform);

    // 有安全区域时
    if (safeArea) {
      state.safeAreaTop = safeArea.top;
      state.safeAreaBottom = screenHeight - safeArea.bottom;
    }
    
    // 状态栏高度
    state.statusBarHeight = statusBarHeight;
    // 窗口宽度
    state.windowWidth = windowWidth;
    // 胶囊位置
    state.menuButtonObject = wx.getMenuButtonBoundingClientRect();
  },
});
