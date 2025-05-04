const fontCarrier = require('font-carrier');
const fs = require('fs');
const path = require('path');
const { optimize } = require('svgo');
const SVGFixer = require('oslllo-svg-fixer');
const rd = require('rd');

const resolve = (p) => path.resolve(__dirname, p);

const src = resolve('./svgs'); // svg目录
const srcFix = resolve('./svgs-fix'); // 修复后的svg保存目录
const target = resolve('./fonts'); // 字体保存目录
const preview = resolve('./preview');
const iconfontWxss = resolve(
  '../../miniprogram/components/mp-icon/iconfont.wxss',
);

const unicodeStart = 'E000'; // 字体unicod私用区范围：E000-F8FF
const fontName = 'mp-iconfont';
let unicodeStartDec = parseInt(unicodeStart, 16);

/**
 * 将给定的 Promise 转换为一个包含错误和结果值的数组。
 *
 * @param {Promise} promise - 要转换的 Promise。
 * @return {Array} 包含错误和结果值的数组。
 */
function to(promise) {
  if (promise instanceof Promise) {
    return promise
      .then((res) => {
        return [null, res];
      })
      .catch((err) => {
        return [err, null];
      });
  }
  return [null, promise];
}

/**
 * 同步地删除一个目录及其所有内容。
 *
 * @param {string} dir - 要删除的目录的路径。
 * @return {void} 没有返回值。
 */
function rmdirSync(dir) {
  if (!fs.existsSync(dir)) {
    return;
  }

  const files = fs.readdirSync(dir);

  files.forEach((file) => {
    const filePath = path.join(dir, file);
    if (fs.statSync(filePath).isDirectory()) {
      rmdirSync(filePath);
    } else {
      fs.unlinkSync(filePath);
    }
  });

  fs.rmdirSync(dir);
}

/**
 * 从指定目录中读取符合指定模式的文件。
 *
 * @param {string} dir - 目录路径。
 * @param {string} pattern - 文件模式。
 * @return {Promise} 一个返回符合模式的文件（们）的 Promise，或者以错误拒绝。
 */
function readFile(dir, pattern) {
  return new Promise((resolve, reject) => {
    rd.readFileFilter(dir, pattern, (err, res) => {
      if (err) {
        reject(err);
        return;
      }

      resolve(res);
    });
  });
}

/**
 * 从源目录中优化SVG文件并保存到目标目录中。
 *
 * @param {string} source - 包含SVG文件的源目录的路径。
 * @param {string} destination - 优化后的SVG文件将保存到的目标目录的路径。
 * @return {Promise<void>} - 一个Promise，在所有SVG文件都被优化并保存后解析。
 */
async function svgOptimize(source, destination) {
  if (fs.existsSync(destination)) {
    rmdirSync(destination);
  }

  fs.mkdirSync(destination, { recursive: true });

  const [err, res] = await to(readFile(source, /\.svg$/i));

  if (err) {
    throw err;
  }

  for (let i = 0; i < res.length; i++) {
    const file = res[i];
    const { base, dir } = path.parse(file);
    const relativePath = path.relative(source, dir);
    const newDir = path.join(destination, relativePath);

    if (!fs.existsSync(newDir)) {
      fs.mkdirSync(newDir, true);
    }

    const svgString = fs.readFileSync(file, 'utf-8');
    const result = optimize(svgString, {
      plugins: [
        {
          name: 'setSize',
          type: 'visitor',
          active: true,
          description: "resize svg's width and height",
          params: {
            width: '48',
            height: '48',
          },
          fn: (root, params) => {
            const { width, height } = params;

            return {
              element: {
                enter: (node) => {
                  if (/svg/i.test(node.name)) {
                    node.attributes.width = width;
                    node.attributes.height = height;
                  }
                },
              },
            };
          },
        },
      ],
    });
    const newFile = path.join(newDir, base);

    fs.writeFileSync(newFile, result.data);
  }
}

/**
 * 异步修复 SVG 文件。
 *
 * @param {string} source - 包含 SVG 文件的源目录。
 * @param {string} destination - 保存修复后 SVG 文件的目标目录。
 * @return {Promise<void>} 解析所有 SVG 文件修复完成的 Promise。
 */
async function svgFix(source, destination) {
  if (fs.existsSync(destination)) {
    rmdirSync(destination);
  }

  fs.mkdirSync(destination, { recursive: true });

  const [err, res] = await to(readFile(source, /\.svg$/i));

  if (err) {
    throw err;
  }

  for (let i = 0; i < res.length; i++) {
    const file = res[i];

    await SVGFixer(file, destination).fix();
  }
}

/**
 * 根据给定的WOFF2文件和SVG生成图标字体的CSS代码。
 *
 * @param {string} woff2 - WOFF2文件的路径。
 * @param {Array} svgs - 包含className和unicode属性的SVG对象数组。
 * @return {string} 生成的图标字体的CSS代码。
 */
function getIconfontCss(woff2, svgs) {
  const data = fs.readFileSync(woff2).toString('base64');

  const base64 = `@font-face {
  font-family: ${fontName};
  src: url('data:application/x-font-woff2;charset=utf-8;base64,${data}') format('woff2');
}

.${fontName} {
  font-family: "${fontName}" !important;
  font-size: 16px;
  font-style: normal;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

${svgs.reduce((prev, next) => {
  return `${prev}
.icon-${next.className}:before {
  content: "${next.unicode.replace('&#x', '\\')}";
}
`;
}, '')}`;

  return base64;
}

/**
 * 根据给定的WOFF2文件和SVG生成图标字体的CSS代码。
 *
 * @param {string} woff2 - WOFF2文件的路径。
 * @param {Array} svgs - 包含className和unicode属性的SVG对象数组。
 * @return {string} 生成的图标字体的CSS代码。
 */
function arrSplitByKey(arr, key) {
  const obj = {};

  arr.forEach((item) => {
    if (!obj[item[key]]) {
      obj[item[key]] = [];
    }

    obj[item[key]].push({ name: item.name, className: item.className });
  });

  return Object.keys(obj).map((key) => {
    return { industryName: key, icons: obj[key] };
  });
}

/**
 * 根据提供的源目录、目标目录和图标名称生成图标字体。
 *
 * @param {string} src - 包含 SVG 文件的源目录。
 * @param {string} dest - 生成图标字体的目标目录。
 * @param {string} iconName - 要生成的图标字体的名称。
 * @return {Promise<void>} - 当图标字体成功生成时解析的 Promise。
 */
async function generateIconfont(src, dest, iconName) {
  if (fs.existsSync(dest)) {
    rmdirSync(dest);
  }

  fs.mkdirSync(dest, { recursive: true });

  const [err, res] = await to(readFile(src, /\.svg$/i));

  if (err) {
    throw err;
  }

  if (!res.length) {
    return;
  }

  console.log('正在生成iconfont，请稍候...');

  const font = fontCarrier.create();
  const svgs = [];

  for (let i = 0; i < res.length; i++) {
    const file = res[i];
    const { dir, name } = path.parse(file);
    const relativePath = path.relative(src, dir);

    unicodeStartDec += 1;
    const unicode = `&#x${unicodeStartDec.toString(16)}`.toLowerCase();

    font.setGlyph(unicode, {
      glyphName: unicode,
      horizAdvX: '1024',
      svg: fs.readFileSync(file, 'utf-8'),
    });

    const arr = name.split('_');
    const className = arr.pop();
    const iconName = arr.pop() || '';

    svgs.push({
      industryName: relativePath,
      name: iconName,
      className,
      unicode,
    });
  }

  font.output({
    path: path.join(dest, iconName),
  });

  const iconfontCss = getIconfontCss(
    path.join(dest, `${iconName}.woff2`),
    svgs,
  );

  fs.writeFileSync(path.join(preview, 'iconfont.css'), iconfontCss);

  // 更新图标组件
  fs.writeFileSync(iconfontWxss, iconfontCss);

  const data = {
    fontName,
    data: arrSplitByKey(svgs, 'industryName'),
  };

  fs.writeFileSync(
    path.join(preview, 'data.json'),
    JSON.stringify(data, null, 2),
  );

  let html = fs.readFileSync(
    path.join(preview, 'index_template.html'),
    'utf-8',
  );

  html = html.replace('$$$;', `const dataStr='${JSON.stringify(data)}'`);
  fs.writeFileSync(path.join(preview, 'index.html'), html);

  console.log('iconfont生成成功！');
  console.log('图标组件已更新!');
}

async function start() {
  await svgOptimize(src, srcFix);
  // await svgFix(src, srcFix);
  await generateIconfont(srcFix, target, 'iconfont');
  rmdirSync(src);
  fs.renameSync(srcFix, src);
}

start();
