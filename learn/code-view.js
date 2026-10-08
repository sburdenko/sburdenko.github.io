/** Подсветка кода для карточек и стендов: C# — общим подсветчиком сайта, CIL и таблицы — простым своим. */
import { esc } from '../assets/vhs.js?v=202610081024';
import { highlight } from '../assets/code.js?v=202610081024';

export function codeHtml(src, lang) {
  if (!lang || lang === 'cs') return highlight(src);
  return src.split('\n').map(line => {
    const [, code, comment = ''] = /^(.*?)(\/\/.*)?$/.exec(line);
    let html;
    if (lang === 'il') {
      html = esc(code).replace(/^(\s*)([a-z][\w.]*)/, '$1<span class="k">$2</span>')
        .replace(/\b(\d+)\b/g, '<span class="n">$1</span>');
    } else {
      html = esc(code).replace(/^(\s*)(\w+)/, '$1<span class="t">$2</span>');
    }
    if (comment) html += `<span class="c">${esc(comment)}</span>`;
    return `<span class="ln">${html || ' '}</span>`;
  }).join('');
}

