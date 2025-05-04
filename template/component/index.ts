/**
 * @ Description:
 */
Component({
  // 组件选项
  options: {
    multipleSlots: true, // 在组件定义时的选项中启用多slot支持
    styleIsolation: "isolated", // 表示启用样式隔离，在自定义组件内外，使用 class 指定的样式将不会相互影响
  },
  // 外部样式类
  externalClasses: [],
  // 组件间关系定义
  relations: {},
  // 类似于mixins和traits的组件间代码复用机制
  behaviors: [],
  // 定义过滤器
  definitionFilter() {},
  properties: {},
  data: {},
  // 数据监听器
  observers: {},
  // 组件方法
  methods: {},
  // 组件生命周期
  lifetimes: {
    created() {},
    attached() {},
    ready() {},
    moved() {},
    detached() {},
  },
  // 页面生命周期
  pageLifetimes: {
    // 页面被展示
    show() {},
    // 页面被隐藏
    hide() {},
    // 页面尺寸变化时
    resize() {},
  },
});
