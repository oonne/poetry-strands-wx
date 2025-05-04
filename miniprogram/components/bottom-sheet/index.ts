import { Utils } from '../../utils/index';

const { sleep, nextTick } = Utils;

Component({
  options: {
    multipleSlots: true,
    styleIsolation: "isolated",
  },
  
  properties: {
    maskClosable: {
      type: Boolean,
      value: true
    }
  },

  data: {
    visible: false,
    maskClass: '',
    contentClass: ''
  },

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

    onMaskTap() {
      if (!this.properties.maskClosable) {
        return;
      }
      this.hide();
    },

    preventBubble() {
      // 阻止事件冒泡
    }
  }
}); 