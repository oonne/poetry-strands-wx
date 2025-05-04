/* 
 * 诗词
 */
interface IPoetry {
  poetryId: string; // ID固定不变
  sort?: number; // 排序，以此作为难度顺序
  name?: string; // 名称
  author?: string; // 作者
  dynasty?: string; // 朝代
  tags?: string[]; // 标签
  content?: string[]; // 内容
  pinyin?: string[]; // 拼音
  appreciation?: string; // 赏析
}

/* 
 * 游戏进度
 */
interface IGameProgress {
  poetryId: string; // 诗词ID
  isUnlocked: boolean; // 是否解锁
  isPassed: boolean; // 是否通关
  passedTime: number; // 最短通关记录
}

/* 
 * 游戏总分
 */
interface IGameScore {
  // 总通关诗词数
  totalPassedCount: number;
  // 平均通关时间
  averagePassedTime: number;
  // 诗词列表
  poetryList: IPoetry[];
}

