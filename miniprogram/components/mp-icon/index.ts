/**
 * @ Description: 字体图标
 */
const componentOptions = {
  properties: {
    // 图标名称
    name: {
      type: String,
      value: "",
    },
    // 图标大小
    size: {
      type: String,
      value: "60rpx",
    },
    // 图标颜色
    color: {
      type: String,
      value: "gray",
    },
    // 是否粗体显示
    bold: {
      type: Boolean,
      value: false,
    },
    // 自定义样式
    iconStyle: {
      type: String,
      value: "",
    },
  },
  data: {},
  methods: {},
};

Component(componentOptions);
