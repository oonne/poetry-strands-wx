/* 
 * 字符单元格
 */
interface CharCell {
  id: string; // 唯一标识
  char: string; // 字符
  rowIndex: number; // 第几行
  colIndex: number; // 第几列
  lineIndex: number; // 诗词中的第几句
  isConnecting: boolean; // 是否连线中
  isCompleted: boolean; // 是否完成连线
}

/* 
 * 连线
 */
interface LineData {
  x1: number;      // 起点X坐标
  y1: number;      // 起点Y坐标
  length: number;  // 线长度
  angle: number;   // 旋转角度
}
