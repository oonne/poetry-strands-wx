import { Utils } from '../../utils/index';

const { sleep, nextTick } = Utils;

/**
 * 模态框组件
 */
Component({
  // 组件选项
  options: {
    multipleSlots: true,
    styleIsolation: "isolated",
  },
  properties: {
    maskClosable: {
      type: Boolean,
      value: false
    }
  },
  data: {
    visible: false,
    maskClass: '',
    contentClass: ''
  },
  // 组件方法
  methods: {
    async show() {
      this.setData({ visible: true });
      await nextTick();
      this.setData({ 
        maskClass: 'show',
        contentClass: 'show'
      });
    },
    async hide() {
      this.setData({ 
        maskClass: '',
        contentClass: ''
      });
      await sleep(300);
      this.setData({ visible: false });
    },
    // 点击遮罩层时关闭弹框
    onMaskTap() {
      if (!this.properties.maskClosable) {
        return;
      }
      this.hide();
    }
  },
});
