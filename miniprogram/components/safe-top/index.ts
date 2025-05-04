import state from '../../global/state';

/**
 * 顶部安全区
 */
Component({
  options: {
    styleIsolation: "isolated",
  },
  data: {
    top: 0,
  },
  // 组件生命周期
  lifetimes: {
    created() {
      this.init();
    },
  },
  // 组件方法
  methods: {
    /* 初始化 */
    init() {
      // 高度为状态栏高度 和 安全区高度 中的最大值
      this.setData({
        top: Math.max(state.safeAreaTop, state.statusBarHeight),
      });
    },
  },
});
