const copyToClipboard = (str) => {
  const el = document.createElement('textarea');
  el.value = str;
  el.setAttribute('readonly', '');
  el.style.position = 'absolute';
  el.style.left = '-9999px';
  document.body.appendChild(el);
  const selected =
    document.getSelection().rangeCount > 0
      ? document.getSelection().getRangeAt(0)
      : false;
  el.select();
  document.execCommand('copy');
  document.body.removeChild(el);
  if (selected) {
    document.getSelection().removeAllRanges();
    document.getSelection().addRange(selected);
  }
};

const content = document.querySelector('.content');

const init = () => {
  const { fontName, data } = JSON.parse(dataStr);

  content.innerHTML = data.reduce((prev, next) => {
    const { industryName, icons } = next;

    return `${prev}
<p class="industry-name">${industryName}</p>
<ul class="iconlist">${icons.reduce((prev, next) => {
      const { className, name } = next;

      return `${prev}
<div class="iconlist-item-wrapper">
  <div class="iconlist-item brief">
    <div class="iconlist-item-view">
      <div class="iconlist-item-view-left">
        <span class="${fontName} icon-${className} iconlist-item-view-left-icon"></span>
      </div>

      <div class="iconlist-item-view-right">
        <div title="${name}" class="iconlist-item-view-text title ellipsis">
          ${name}
        </div>

        <div class="iconlist-item-view-text name" title="点击复制名称">
          ${className}
        </div>
      </div>
    </div>
  </div>
</div>`;
    }, '')}</ul>`;
  }, '');

  [...document.querySelectorAll('.icon-base-view-text.name')].forEach(
    (item) => {
      item.addEventListener('click', function () {
        copyToClipboard(item.innerText);
        alert('图标名称已复制');
      });
    },
  );
};

init();
