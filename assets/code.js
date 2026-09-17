/** Minimal syntax highlighter for C#, HLSL and ShaderLab snippets shown on the tapes. */
import { esc } from './vhs.js?v=202609162304';

const KEYWORDS = new Set(('abstract as base bool break case catch class const continue default delegate do else enum event '
  + 'false finally float for foreach get if in int interface internal is new null object out override private '
  + 'protected public readonly ref return sealed set static string struct switch this throw true try typeof uint '
  + 'using var virtual void while half half3 half4 float2 float3 float4 float4x4 return Shader Properties SubShader '
  + 'Pass Tags HLSLPROGRAM ENDHLSL CBUFFER_START CBUFFER_END TEXTURE2D SAMPLER #pragma #include #if #endif and or').split(' '));

const TOKEN = /(\/\/[^\n]*)|("(?:[^"\\\n]|\\.)*")|(#\w+)|([A-Za-z_][\w]*)|(\d+(?:\.\d+)?f?)|([\s\S])/g;

function wrap(cls, text) {
  return `<span class="${cls}">${esc(text)}</span>`;
}

function classify(word, next) {
  if (KEYWORDS.has(word)) return 'k';
  if (/^[A-Z]/.test(word)) return next === '(' ? 'f' : 't';
  return next === '(' ? 'f' : '';
}

/** Returns HTML for a snippet. Lines listed in `marked` (1-based) get the `.add` highlight. */
export function highlight(src, marked = []) {
  const markedSet = new Set(marked);
  return src.split('\n').map((line, index) => {
    let html = '';
    let match;
    TOKEN.lastIndex = 0;
    while ((match = TOKEN.exec(line))) {
      const [all, comment, str, directive, word, num] = match;
      if (comment) html += wrap('c', comment);
      else if (str) html += wrap('s', str);
      else if (directive) html += wrap('k', directive);
      else if (word) {
        const cls = classify(word, line[TOKEN.lastIndex]);
        html += cls ? wrap(cls, word) : esc(word);
      } else if (num) html += wrap('n', num);
      else html += esc(all);
    }
    const cls = markedSet.has(index + 1) ? 'ln add' : 'ln';
    return `<span class="${cls}">${html || ' '}</span>`;
  }).join('');
}

/** Renders a snippet into a <pre class="code">. */
export function renderCode(pre, src, marked = []) {
  if (!pre) return;
  pre.innerHTML = highlight(src, marked);
}
