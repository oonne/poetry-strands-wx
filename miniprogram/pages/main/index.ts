import { Utils } from '../../utils/index';

const { navigateTo } = Utils;

/**
 * 首页
 */
Page({
  data: {
  },
  onLoad() {
    this.init();
  },

  /* 
   * 初始化
   */
  init() {
  },

  /* 
   * 快速开始游戏
   */
  startGame() {
    navigateTo('/pages/game/index', {
      poetryId: '1',
    });
  },

  /* 
   * 跳转到指定页面
   */
  toPage(e: any) {
    const page = e.currentTarget.dataset.page;
    if (!page) {
      return;
    }
    wx.navigateTo({
      url: page,
    });
  },
});
