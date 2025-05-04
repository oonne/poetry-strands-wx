import fs from 'fs';
import path from 'path';

// 读取源文件
const sourcePath = path.join(__dirname, '../poetry/poetry-list.ts');
const targetPath = path.join(__dirname, '../miniprogram/constant/poetry-list.ts');
const detailTargetPath = path.join(__dirname, '../miniprogram/pages/game/constant/poetry-detail-list.ts');

// 读取源文件内容
const sourceContent = fs.readFileSync(sourcePath, 'utf-8');

// 提取 poetryList 数组
const match = sourceContent.match(/const poetryList: IPoetry\[\] = (\[[\s\S]*?\]);/);
if (!match) {
  throw new Error('无法找到 poetryList 数组');
}

// 解析数组
const fullPoetryList: IPoetry[] = eval(match[1]);

// 提取所需字段生成简化列表
const simplifiedPoetryList = fullPoetryList.map((poetry, index) => ({
  sort: index + 1,
  poetryId: poetry.poetryId,
  name: poetry.name,
  author: poetry.author,
  dynasty: poetry.dynasty,
  tags: poetry.tags,
}));

// 提取所需字段生成详情列表
const detailPoetryList = fullPoetryList.map(poetry => ({
  poetryId: poetry.poetryId,
  name: poetry.name,
  author: poetry.author,
  dynasty: poetry.dynasty,
  content: poetry.content,
  pinyin: poetry.pinyin,
  appreciation: poetry.appreciation,
}));

// 生成简化列表文件内容
const simplifiedContent = `const poetryList: IPoetry[] = ${JSON.stringify(simplifiedPoetryList, null, 2)};

export default poetryList;
`;

// 生成详情列表文件内容
const detailContent = `const poetryList: IPoetry[] = ${JSON.stringify(detailPoetryList, null, 2)};

export default poetryList;
`;

// 写入目标文件
fs.writeFileSync(targetPath, simplifiedContent, 'utf-8');
fs.writeFileSync(detailTargetPath, detailContent, 'utf-8');

console.log('诗歌列表生成完成！');
