/**
 * 生成字符矩阵
 * @param content 诗词内容数组
 * @returns 字符矩阵数据
 */
const generateCharMatrix = (content: string[]): {
  totalChars: number;
  totalCols: number;
  totalRows: number;
  charCellSize: number;
  charList: CharCell[];
} => {
  // 计算总行数和列数
  const totalChars = content.join("").length;
  const totalCols = 5;
  const totalRows = Math.ceil(totalChars / totalCols);
  const charCellSize = 600 / totalCols;

  // 初始化空字符矩阵
  let charList = initEmptyCharList(totalRows, totalCols, totalChars);
  
  // 填充字符矩阵
  charList = fillCharMatrix(charList, content, totalRows, totalCols, totalChars);

  return {
    totalChars,
    totalCols,
    totalRows,
    charCellSize,
    charList,
  };
}

/**
 * 初始化空字符矩阵
 */
const initEmptyCharList = (totalRows: number, totalCols: number, totalChars: number): CharCell[] => {
  const charList: CharCell[] = [];

  let charIndex = 0;
  for (let i = 0; i < totalRows; i++) {
    for (let j = 0; j < totalCols; j++) {
      if (charIndex < totalChars) {
        charList.push({
          id: `${i}-${j}`,
          char: "",
          rowIndex: i,
          colIndex: j,
          lineIndex: -1,
          isConnecting: false,
          isCompleted: false,
        });
        charIndex++;
      }
    }
  }

  return charList;
}

/**
 * 填充字符矩阵
 */
const fillCharMatrix = (
  charList: CharCell[],
  content: string[],
  totalRows: number,
  totalCols: number,
  totalChars: number
): CharCell[] => {
  // 使用原始顺序，而不是按长度排序
  const contentIndexes = content.map((_, index) => index);

  // 已填充的诗句索引
  const filledLines: number[] = [];

  // 设置总体尝试次数上限
  const maxTotalAttempts = totalChars * 5;
  let totalAttemptCount = 0;

  // 主循环
  while (
    filledLines.length < content.length &&
    totalAttemptCount < maxTotalAttempts
  ) {
    totalAttemptCount++;

    // 重置矩阵状态（仅在完全没有填充时重置）
    if (filledLines.length === 0) {
      charList = resetCharList(charList);
    }

    // 获取下一个要填充的行索引
    let nextLineIndex = -1;
    for (const lineIndex of contentIndexes) {
      if (!filledLines.includes(lineIndex)) {
        nextLineIndex = lineIndex;
        break;
      }
    }

    if (nextLineIndex === -1) break; // 所有诗句已填充

    const line = content[nextLineIndex];
    const lineChars = line.split("");

    // 计算该诗句第一个字允许的最大行数（行从0开始）
    // 查找当前第一个有空格的行
    let firstEmptyRow = 0;
    for (let i = 0; i < totalRows; i++) {
      const hasEmptyCell = charList.some(
        cell => cell.rowIndex === i && cell.char === ""
      );
      if (hasEmptyCell) {
        firstEmptyRow = i;
        break;
      }
    }
    
    // 设置最大允许行为第一个有空格的行+3，同时不超过总行数
    const maxAllowedRow = Math.min(
      totalRows - 1,
      firstEmptyRow + 3
    );

    // 为每行提供5次尝试机会
    let success = false;
    const maxLineAttempts = 5;
    
    for (let lineAttempt = 0; lineAttempt < maxLineAttempts && !success; lineAttempt++) {
      // 尝试填充当前行
      success = tryFillLineWithRowLimit(
        lineChars,
        nextLineIndex,
        maxAllowedRow,
        charList,
        totalRows,
        totalCols
      );
      
      // 如果尝试失败且不是最后一次尝试，清除当前行重试
      if (!success && lineAttempt < maxLineAttempts - 1) {
        charList = clearLine(charList, nextLineIndex);
      }
    }

    if (success) {
      // 成功填充，添加到已填充列表
      filledLines.push(nextLineIndex);
    } else {
      // 所有尝试都失败，清除当前行
      charList = clearLine(charList, nextLineIndex);
      
      // 回溯策略：如果连续失败次数过多，回溯清除前一行
      // 使用动态回溯：根据已填充行数决定回溯深度
      if (totalAttemptCount % 10 === 0 && filledLines.length > 0) {
        // 计算动态回溯深度，行数越多回溯越多
        const backtrackDepth = Math.min(
          Math.ceil(filledLines.length / 3) + 1, 
          filledLines.length
        );
        
        for (let i = 0; i < backtrackDepth; i++) {
          const lastLineIndex = filledLines.pop()!;
          charList = clearLine(charList, lastLineIndex);
        }
      }
    }

    // console.log(`当前行数: ${filledLines.length}/${content.length} 总尝试次数: ${totalAttemptCount}`);
  }


  // 如果尝试次数用完还没填满
  if (filledLines.length < content.length) {
    console.log("无法完全填充，已填充 " + filledLines.length + " 句诗");
    return fillCharMatrix(charList, content, totalRows, totalCols, totalChars);
  } else {
    // 输出尝试次数统计
    console.log("生成成功，总尝试次数: ", totalAttemptCount);
  }

  return charList;
}

/**
 * 重置字符矩阵
 */
const resetCharList = (charList: CharCell[]): CharCell[] => {
  const newCharList = [...charList];
  for (let i = 0; i < newCharList.length; i++) {
    newCharList[i].char = "";
    newCharList[i].lineIndex = -1;
  }
  return newCharList;
}

/**
 * 清除指定行的字符
 */
const clearLine = (charList: CharCell[], lineIndex: number): CharCell[] => {
  const newCharList = [...charList];
  for (let i = 0; i < newCharList.length; i++) {
    if (newCharList[i].lineIndex === lineIndex) {
      newCharList[i].char = "";
      newCharList[i].lineIndex = -1;
    }
  }
  return newCharList;
}

/**
 * 在指定行范围内尝试填充一行诗句
 */
const tryFillLineWithRowLimit = (
  lineChars: string[],
  lineIndex: number,
  maxAllowedRow: number,
  charList: CharCell[],
  totalRows: number,
  totalCols: number
): boolean => {
  const newCharList = [...charList];

  // 找到所有未填充的单元格，但仅限于指定行范围内
  const emptyCells = newCharList.filter(
    (cell) => cell.char === "" && cell.rowIndex <= maxAllowedRow
  );

  if (emptyCells.length === 0) return false;

  // 如果剩余空格数量小于诗句长度，无需尝试
  if (emptyCells.length < lineChars.length) return false;

  // 随机选择一个空单元格作为起点
  const startCellIndex = Math.floor(Math.random() * emptyCells.length);
  const startCell = emptyCells[startCellIndex];
  const startCellListIndex = newCharList.findIndex(
    (cell) =>
      cell.rowIndex === startCell.rowIndex &&
      cell.colIndex === startCell.colIndex
  );

  // 填充第一个字
  newCharList[startCellListIndex].char = lineChars[0];
  newCharList[startCellListIndex].lineIndex = lineIndex;

  // 当前单元格的索引(在charList中的索引)
  let currentCellIndex = startCellListIndex;

  // 填充剩余的字符
  for (let i = 1; i < lineChars.length; i++) {
    // 获取当前单元格
    const currentCell = newCharList[currentCellIndex];

    // 找到所有临近的未填充单元格
    const neighborCells = getEmptyNeighbors(currentCell, newCharList, totalRows, totalCols);

    // 如果没有可用的邻居单元格，填充失败
    if (neighborCells.length === 0) {
      return false;
    }

    // 智能选择：根据空邻居数量排序，优先选择空邻居少的格子
    // 这样可以避免创建死胡同
    neighborCells.sort((a, b) => {
      const aNeighbors = getEmptyNeighbors(a, newCharList, totalRows, totalCols).length;
      const bNeighbors = getEmptyNeighbors(b, newCharList, totalRows, totalCols).length;
      return aNeighbors - bNeighbors;
    });

    // 随机选择前一半邻居中的一个（平衡贪心和随机性）
    const selectRange = Math.max(1, Math.floor(neighborCells.length / 2));
    const nextCellIndex = Math.floor(Math.random() * selectRange);
    const nextCell = neighborCells[nextCellIndex];

    // 填充下一个字
    nextCell.char = lineChars[i];
    nextCell.lineIndex = lineIndex;

    // 更新当前单元格索引
    currentCellIndex = newCharList.findIndex(
      (cell) =>
        cell.rowIndex === nextCell.rowIndex &&
        cell.colIndex === nextCell.colIndex
    );
  }

  // 更新原数组
  for (let i = 0; i < charList.length; i++) {
    charList[i] = newCharList[i];
  }
  
  return true;
}

/**
 * 获取临近的空单元格
 */
const getEmptyNeighbors = (
  cell: CharCell, 
  charList: CharCell[],
  totalRows: number,
  totalCols: number
): CharCell[] => {
  const neighbors: CharCell[] = [];
  const directions = [
    { rowOffset: -1, colOffset: -1 }, // 左上
    { rowOffset: -1, colOffset: 0 }, // 上
    { rowOffset: -1, colOffset: 1 }, // 右上
    { rowOffset: 0, colOffset: -1 }, // 左
    { rowOffset: 0, colOffset: 1 }, // 右
    { rowOffset: 1, colOffset: -1 }, // 左下
    { rowOffset: 1, colOffset: 0 }, // 下
    { rowOffset: 1, colOffset: 1 }, // 右下
  ];

  for (const dir of directions) {
    const newRow = cell.rowIndex + dir.rowOffset;
    const newCol = cell.colIndex + dir.colOffset;

    // 检查是否在边界内
    if (
      newRow >= 0 &&
      newRow < totalRows &&
      newCol >= 0 &&
      newCol < totalCols
    ) {
      // 查找此位置的单元格
      const neighbor = charList.find(
        (c) => c.rowIndex === newRow && c.colIndex === newCol && c.char === ""
      );

      if (neighbor) {
        neighbors.push(neighbor);
      }
    }
  }

  return neighbors;
} 

export { generateCharMatrix };