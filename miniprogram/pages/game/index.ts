import state from "../../global/state";
import { generateCharMatrix } from "../../utils/game";
import { Utils } from "../../utils/index";

const { sleep, nextTick } = Utils;

/**
 * 游戏页面
 */
Page({
  data: {
    menuButtonLeft: 0,

    poetryId: "1",
    name: "静夜思",
    author: "李白",
    dynasty: "唐",
    content: ["床前明月光", "疑是地上霜", "举头望明月", "低头思故乡"],
    // content: [
    //   "朝辞白帝彩云间",
    //   "千里江陵一日还",
    //   "两岸猿声啼不住",
    //   "轻舟已过万重山",
    // ],
    // content: [
    //   "独立寒秋",
    //   "湘江北去",
    //   "橘子洲头",
    //   "看万山红遍",
    //   "层林尽染",
    //   "漫江碧透",
    //   "百舸争流",
    //   "鹰击长空",
    //   "万类霜天竞自由",
    //   "怅寥廓",
    //   "问苍茫大地",
    //   "谁主沉浮",
    //   "携来百侣曾游",
    //   "忆往昔峥嵘岁月稠",
    //   "恰同学少年",
    //   "风华正茂",
    //   "书生意气",
    //   "挥斥方遒",
    //   "指点江山",
    //   "激扬文字",
    //   "粪土当年万户侯",
    //   "曾记否",
    //   "到中流击水",
    //   "浪遏飞舟",
    // ],
    pinyin: [
      "chuáng qián míng yuè guāng",
      "yí shì dì shàng shuāng",
      "jǔ tóu wàng míng yuè",
      "dī tóu sī gù xiāng",
    ],
    appreciation:
      "《静夜思》是一首五言诗，此诗描写了旅居在外的诗人于秋日夜晚在屋内抬头望月而思念家乡的感受。前两句写诗人在作客他乡的特定环境中一刹那间所产生的错觉；后两句通过动作神态的刻画，深化主人公的思乡之情。全诗没有奇特新颖的想象，没有精工华美的辞藻，只是用叙述的语气，采取比喻、衬托等手法，表达客居思乡之情，语言清新朴素而韵味含蓄无穷，历来广为传诵。",

    charList: [] as CharCell[], //  数据
    totalChars: 0, // 总字数
    totalCols: 5, // 总列数
    totalRows: 4, // 总行数
    charCellSize: 0, // 单元格尺寸(rpx)

    // 是否正在连线中
    isTouching: false,
    // 是否已完成
    isAllCompleted: false,
    // 当前诗句
    currentLineIndex: 0,
    // 当前连线
    currentLineChars: [] as CharCell[],
    // 抖动动画
    shakeAnimation: false,

    // 连线数据
    lines: [] as LineData[],
    // 已完成的连线数据
    completedLines: [] as LineData[],
    // 当前光标连线
    cursorLine: {
      show: false,
      x1: 0,
      y1: 0,
      length: 0,
      angle: 0,
    },
    // 当前触摸位置
    touchPosition: {
      x: 0,
      y: 0,
    },

    // 计时器相关
    gameStartTime: 0, // 游戏开始时间
    gameTime: "00:00", // 当前游戏时间
    isTimerRunning: false, // 计时器是否运行中
  },

  // 计时器ID
  timer: null as any,

  /* 进入页面 */
  onLoad(e) {
    this.initSystem();
    this.initPoetry(e);
  },

  /* 离开页面 */
  onUnload() {
    // 清理计时器
    this.stopTimer();
  },

  /*
   * 初始化
   */
  // 初始化系统设置
  initSystem() {
    this.setData({
      menuButtonLeft: state.menuButtonObject.left,
    });
  },

  /*
   * 初始化诗词
   */
  async initPoetry(e: any) {
    console.log(e);

    // 生成字符矩阵
    const result = generateCharMatrix(this.data.content);
    this.setData({
      totalChars: result.totalChars,
      totalCols: result.totalCols,
      totalRows: result.totalRows,
      charCellSize: result.charCellSize,
      charList: result.charList,
    });

    // 开始计时
    this.startTimer();
  },

  /*
   * 计时器相关方法
   */
  // 开始计时
  startTimer() {
    if (this.data.isTimerRunning) return;

    // 记录开始时间
    const now = Date.now();
    this.setData({
      gameStartTime: now,
      isTimerRunning: true,
    });

    // 启动计时器
    this.timer = setInterval(() => {
      // 计算已经过去的时间（毫秒）
      const elapsed = Date.now() - this.data.gameStartTime;
      
      // 转换为分钟和秒
      let minutes = Math.floor(elapsed / 60000);
      let seconds = Math.floor((elapsed % 60000) / 1000);

      if (minutes >= 60) {
        minutes = 60;
        seconds = 0;
        this.stopTimer();
      }
      
      // 格式化时间字符串 (MM:SS)
      const timeString = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
      
      this.setData({
        gameTime: timeString
      });
    }, 1000);
  },

  // 停止计时
  stopTimer() {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
      this.setData({
        isTimerRunning: false
      });
    }
  },

  /*
   * 计算连线数据
   */
  calculateLineData(x1: number, y1: number, x2: number, y2: number): LineData {
    // 计算两点之间的距离
    const length = Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));

    // 计算旋转角度 (角度 = arctan((y2-y1)/(x2-x1)) * 180/π)
    let angle = (Math.atan2(y2 - y1, x2 - x1) * 180) / Math.PI;

    return {
      x1,
      y1,
      length,
      angle,
    };
  },

  /*
   * 更新连线
   */
  updateLines() {
    const { currentLineChars, charCellSize, touchPosition } = this.data;
    const lines: LineData[] = [];

    // 计算已连接字符之间的线
    for (let i = 0; i < currentLineChars.length - 1; i++) {
      const startCell = currentLineChars[i];
      const endCell = currentLineChars[i + 1];

      // 计算字符中心点坐标
      const x1 = startCell.colIndex * charCellSize + charCellSize / 2;
      const y1 = startCell.rowIndex * charCellSize + charCellSize / 2;
      const x2 = endCell.colIndex * charCellSize + charCellSize / 2;
      const y2 = endCell.rowIndex * charCellSize + charCellSize / 2;

      // 添加连线数据
      lines.push(this.calculateLineData(x1, y1, x2, y2));
    }

    this.setData({ lines });

    // 如果当前有连接的字符且正在触摸，则更新光标连线
    if (currentLineChars.length > 0 && this.data.isTouching) {
      const lastCell = currentLineChars[currentLineChars.length - 1];
      const x1 = lastCell.colIndex * charCellSize + charCellSize / 2;
      const y1 = lastCell.rowIndex * charCellSize + charCellSize / 2;

      // 更新光标连线
      this.setData({
        cursorLine: {
          show: true,
          ...this.calculateLineData(x1, y1, touchPosition.x, touchPosition.y),
        },
      });
    } else {
      // 隐藏光标连线
      this.setData({
        cursorLine: {
          show: false,
          x1: 0,
          y1: 0,
          length: 0,
          angle: 0,
        },
      });
    }
  },

  /*
   * 处理触摸开始事件
   */
  handleTouchStart(e: any) {
    if (
      this.data.isTouching ||
      this.data.isAllCompleted ||
      this.data.shakeAnimation
    ) {
      return;
    }

    const { id } = e.currentTarget.dataset;
    const charCell = this.data.charList.find((item) => item.id === id);
    // 如果已经连线，则不进行操作
    if (!charCell || charCell.isCompleted || charCell.isConnecting) {
      return;
    }

    // 获取触摸点坐标
    const touch = e.touches[0];
    const { pageX, pageY } = touch;

    // 获取游戏容器的位置信息
    const query = wx.createSelectorQuery();
    query.select(".game-container").boundingClientRect();
    query.exec((res) => {
      if (!res || !res[0]) return;

      const container = res[0];

      // 计算触摸点在游戏容器中的相对位置
      const x = pageX - container.left;
      const y = pageY - container.top;

      // 设置当前触摸位置（转换为rpx）
      const touchPosition = {
        x: (x / state.windowWidth) * 750,
        y: (y / state.windowWidth) * 750,
      };

      // 设置连线状态
      charCell.isConnecting = true;
      this.setData(
        {
          isTouching: true,
          charList: this.data.charList,
          currentLineChars: [charCell], // 初始化当前连线数组，包含第一个字符
          touchPosition,
          lines: [], // 清空连线
        },
        () => {
          // 更新连线
          this.updateLines();
        }
      );
    });
  },

  /*
   * 处理触摸移动事件
   */
  async handleTouchMove(e: any) {
    await nextTick();
    if (!this.data.isTouching || this.data.isAllCompleted) {
      return;
    }

    // 获取触摸点坐标
    const touch = e.touches[0];
    const { pageX, pageY } = touch;

    // 获取游戏容器的位置信息
    const query = wx.createSelectorQuery();
    query.select(".game-container").boundingClientRect();
    query.exec((res) => {
      if (!res || !res[0]) return;

      const container = res[0];

      // 计算触摸点在游戏容器中的相对位置
      const x = pageX - container.left;
      const y = pageY - container.top;

      // 设置当前触摸位置（转换为rpx）
      const touchPosition = {
        x: (x / state.windowWidth) * 750,
        y: (y / state.windowWidth) * 750,
      };

      // 更新触摸位置
      this.setData({ touchPosition }, () => {
        // 更新连线
        this.updateLines();
      });

      // 计算单元格的实际像素大小
      const cellSizeInPx = (this.data.charCellSize * state.windowWidth) / 750;
      // 计算间隙大小（像素）
      const gapSizeInPx = (40 * state.windowWidth) / 750;

      // 计算触摸点所在的格子坐标
      const colIndex = Math.floor(x / cellSizeInPx);
      const rowIndex = Math.floor(y / cellSizeInPx);

      // 计算触摸点在单元格内的相对位置
      const relativeX = x - colIndex * cellSizeInPx;
      const relativeY = y - rowIndex * cellSizeInPx;

      // 判断触摸点是否位于单元格的有效区域内（中心区域，排除间隙）
      const isInEffectiveArea =
        relativeX >= gapSizeInPx / 2 &&
        relativeX <= cellSizeInPx - gapSizeInPx / 2 &&
        relativeY >= gapSizeInPx / 2 &&
        relativeY <= cellSizeInPx - gapSizeInPx / 2;

      // 如果不在有效区域内，则不处理连线
      if (!isInEffectiveArea) {
        return;
      }

      // 根据坐标找到对应的字符单元格
      const charCell = this.data.charList.find(
        (item) => item.colIndex === colIndex && item.rowIndex === rowIndex
      );

      // 如果找到了字符单元格，且未被连线
      if (charCell && !charCell.isCompleted && !charCell.isConnecting) {
        // 获取当前连线中的最后一个字符
        const lastChar = this.data.currentLineChars[this.data.currentLineChars.length - 1];
        
        // 检查新字符是否与最后一个字符相邻
        const isAdjacent = Math.abs(charCell.rowIndex - lastChar.rowIndex) <= 1 && 
                          Math.abs(charCell.colIndex - lastChar.colIndex) <= 1 &&
                          (charCell.rowIndex !== lastChar.rowIndex || charCell.colIndex !== lastChar.colIndex);
        
        // 只有相邻的字符才能被添加到连线中
        if (!isAdjacent) {
          return;
        }
        
        // 设置连线状态
        charCell.isConnecting = true;

        // 将字符添加到当前连线中
        const currentLineChars = [...this.data.currentLineChars, charCell];

        this.setData(
          {
            charList: this.data.charList,
            currentLineChars,
          },
          () => {
            // 更新连线
            this.updateLines();
          }
        );
      }
    });
  },

  /*
   * 处理触摸结束事件
   */
  async handleTouchEnd() {
    this.data.isTouching = false;
    if (this.data.isAllCompleted) {
      return;
    }

    let { content, currentLineIndex, currentLineChars, charList } = this.data;
    charList = JSON.parse(JSON.stringify(charList));

    // 当前正确的诗句
    const correctLine = content?.[currentLineIndex] || "";
    // 当前连线诗句
    const currentLine = currentLineChars.map((item) => item.char).join("");
    if (!currentLine) {
      return;
    }

    if (currentLine === correctLine) {
      // 如果连线诗句与正确诗句相同，则连线成功
      currentLineIndex++;
      charList = charList.map((item) => {
        if (item.isConnecting) {
          item.isCompleted = true;
          item.isConnecting = false;
        }
        return item;
      });

      // 保存当前连线到已完成连线数组中
      const completedLines = [...this.data.completedLines, ...this.data.lines];
      // 是否通关
      const isAllCompleted = charList.every((item) => item.isCompleted);
      if (isAllCompleted) {
        this.gamePass();
      }

      this.setData({
        isTouching: false,
        currentLineChars: [],
        currentLineIndex,
        charList,
        completedLines,
        // 清空当前连线
        lines: [],
        cursorLine: {
          show: false,
          x1: 0,
          y1: 0,
          length: 0,
          angle: 0,
        },
      });
    } else {
      // 否则连线失败
      charList = charList.map((item) => {
        item.isConnecting = false;
        return item;
      });

      this.setData({
        isTouching: false,
        currentLineChars: [],
        currentLineIndex,
        charList,
        // 清空连线
        lines: [],
        cursorLine: {
          show: false,
          x1: 0,
          y1: 0,
          length: 0,
          angle: 0,
        },
        shakeAnimation: true,
      });

      // 抖动动画
      await sleep(500);
      this.setData({ shakeAnimation: false, charList });
    }
  },

  /* 
   * 游戏通关
   */
  gamePass() {
    // 游戏通关时停止计时器
    this.stopTimer();
    
    this.setData({
      isAllCompleted: true,
    });
  },
});
