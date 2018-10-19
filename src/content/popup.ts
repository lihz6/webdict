import { Entry, Rect, Injector } from '../shared/typings';
import postitle from '../shared/postitle';
import { dePinv, dePron } from './coder';
import SECRET from '../shared/SECRET';
import Dict from './dict';

export default function (injector: Injector) {
  let _entries: Entry[] = [];
  let _rect: Rect = null!;
  let _enterCount = 3;
  let _index = 0;
  const [
    Main, View, Word, Hide,
    Mean, Form, Back, Done
  ] = [
    'main', 'view', 'word', 'hide',
    'mean', 'form', 'back', 'done'
  ].map(id => Dict.querySelector('.lanx-' + id) as HTMLElement);

  window.addEventListener('resize', () => {
    hideDict();
  });
  Dict.addEventListener('mouseenter', () => {
    Dict.classList.remove(`lanx-root-tada-${_enterCount}`);
    _enterCount *= 2;
  });
  Hide.addEventListener('mouseup', event => {
    event.stopPropagation();
    hideDict();
  }, true);

  Word.addEventListener('click', event => {
    event.stopPropagation();
    const len = _entries.length;
    if (len > 1) {
      showDict(_entries[_index = (_index + 1) % len], _rect);
    }
  });

  Mean.addEventListener('click'/*'dblclick'*/, event => {
    event.stopPropagation();
    View.classList.add('lanx-none');
    Form.classList.remove('lanx-none');
    if (!pinpoint(_rect)) hideDict();
  });


  Form.addEventListener('submit', event => {
    event.preventDefault();
    event.stopPropagation();
    const mean = Array.from(Form.querySelectorAll('.lanx-edit') as NodeListOf<HTMLInputElement>)
      .reduce((data, { value, name, defaultValue: deval }) => {
        value = value.trim();
        deval = deval.trim();
        if (value && value !== deval) {
          data[name] = value;
        }
        return data;
      }, {});
    injector.define({ word: _entries[_index].word, mean });
    hideDict();
  });

  Back.addEventListener('click', event => {
    Form.classList.add('lanx-none');
    View.classList.remove('lanx-none');
    event.stopPropagation();
    pinpoint(_rect);
  });
  function ensurePronItem(pron: HTMLElement, count: number) {
    let childCount = pron.childElementCount - 1;
    const divs = new Array<HTMLElement>();
    if (childCount >= count) {
      for (let i = 0; i < childCount; i++) {
        const el = pron.children[i] as HTMLElement;
        if (i < count) {
          el.classList.remove('lanx-none');
          divs.push(el);
        } else el.classList.add('lanx-none');
      }
    } else {
      for (let i = 0; i < childCount; i++) {
        const el = pron.children[i] as HTMLElement;
        el.classList.remove('lanx-none');
        divs.push(el);
      }
      while (count > childCount) {
        const div = document.createElement('div');
        div.classList.add('lanx-pron');
        div.classList.add('lanx-pron-' + childCount);
        pron.insertBefore(div, pron.lastChild);
        for (const clazz of ['puk', 'pos', 'pus']) {
          const span = document.createElement('div');
          span.classList.add('lanx-pron-' + clazz);
          div.appendChild(span);
        }
        divs.push(div);
        childCount++;
      }
    }
    return divs;
  }

  function updateContent(entry: Entry) {
    Dict.classList.remove('lanx-none');
    View.classList.remove('lanx-none');
    Form.classList.add('lanx-none');
    Word.innerText = entry.word;
    if (_enterCount < 10) {
      Dict.classList.add(`lanx-root-tada-${_enterCount}`);
    }
    if (_entries.length > 1) {
      Dict.classList.remove('lanx-root-less');
      Dict.classList.add('lanx-root-more');
      const last = _index + 1 === _entries.length;
      Word.setAttribute('title', `${last ? '第一词' : '下一词'} » [${_entries[last ? 0 : _index + 1].word}]`
      );
    } else {
      Dict.classList.remove('lanx-root-more');
      Dict.classList.add('lanx-root-less');
      Word.setAttribute('title', '词条');
    }
    // update prons
    const meand = new Map<string, number[]>();
    ensurePronItem(View, entry.data.length).forEach((div, idx) => {
      const { mean, lang, pron } = entry.data[idx];
      if (meand.has(mean)) {
        meand.get(mean)!.push(idx);
      } else if (mean) {
        meand.set(mean, [idx]);
      }
      for (let p = 0; p < 3; p++) {
        const span = div.children[p];
        if (lang.startsWith('zh-han') && p === 1) {
          span.innerHTML = dePinv(pron[1], 'zh:');
        } else if (lang === 'en') {
          if (p !== 1) {
            span.innerHTML = dePron(pron[p], p === 0 ? 'uk:' : 'us:');
          } else {
            const poses = pron[1].split(SECRET);
            const sep = poses.some(pos => pos.includes(' ')) ? ', ' : ' ';
            const pos = poses.map(pos => `<span title="${postitle(pos)}">${pos}</span>`).join(sep);
            span.innerHTML = pos;
            continue;
          }
        } else {
          span.innerHTML = pron[p];
          continue;
        }
        Array.from(span.querySelectorAll('span[data-code]') as NodeListOf<HTMLElement>)
          .forEach(button => {
            const mark = lang !== 'en' ? '拼音' : p === 0 ? '英式' : '美式';
            button.addEventListener('mouseup', event => {
              event.stopPropagation();
              const el = event.target as HTMLElement;
              injector.playme({ code: el.dataset.code! });
            });
            button.setAttribute('title', `播放${mark} » [${button.innerText}]`);
          });
      }
      if (div.offsetWidth > 320) {
        div.classList.remove('lanx-pron-row');
        div.classList.add('lanx-pron-col');
      } else {
        div.classList.remove('lanx-pron-col');
        div.classList.add('lanx-pron-row');
      }
    });
    // update mean
    Mean.innerHTML = Array.from(meand).map(([mean, nums], index) =>
      meand.size > 1
        ? `<span class="${nums.map(n => `lanx-mean-${n}`).join(' ')}">${mean}${
        index < meand.size - 1
          ? mean.slice(-1) > '\u0100' ? '；' : ';' : ''
        }</span>`
        : mean
    ).join('') || '[Not Defined]';
    // update form
    const data = entry.data.map(({ lang, pron, mean }) => {
      const [uk, os, us] = pron;
      return os.split(SECRET).map(os => ({
        lang, pron: [uk, os, us], mean
      }));
    }).reduce((a, b) => a.concat(b));

    Back.innerText = entry.word;
    Form.querySelectorAll('.lanx-edit').forEach(line => {
      Form.removeChild(line);
    });
    Done.insertAdjacentHTML('beforebegin', data.length < 2
      // TODO: support only mean
      ? `<textarea class="lanx-edit lanx-area" name="${data[0].lang}">${data[0].mean}</textarea>`
      : data.map(({ lang, pron, mean }) => {
        const text = postitle(lang === 'en' ? pron[1] : lang);
        return `<input class="lanx-edit lanx-line" name="${lang === 'en' ? 'en-' + pron[1] : lang}" value="${mean.replace(/"/g, '&quot;')}" placeholder="${text}" title="${text}" />`
      }).join('')
    );
  }

  function pinpoint(aRect: Rect): boolean {
    const x = window.pageXOffset, y = window.pageYOffset;
    const rRect = {
      left: aRect.left - x,
      right: aRect.right - x,
      top: aRect.top - y,
      bottom: aRect.bottom - y
    };
    if (Math.max(document.documentElement!.clientWidth, document.documentElement!.offsetWidth) < Main.offsetWidth) {
      hideDict();
      return false;
    }
    if (rRect.left < 0 || rRect.right > document.documentElement!.clientWidth) {
      hideDict();
      return false;
    }
    const margin = 14;
    let above = rRect.top >= Main.offsetHeight + margin;
    let below = above || document.documentElement!.clientHeight - rRect.bottom >= Main.offsetHeight + margin;
    above = above || !below && rRect.top + y >= Main.offsetHeight + margin;
    below = (above || below) || Math.max(document.documentElement!.offsetHeight, document.documentElement!.clientHeight) - rRect.bottom >= Main.offsetHeight + margin;
    if (!(above || below)) {
      hideDict();
      return false;
    }

    let middle = rRect.left + rRect.right;
    let total = document.documentElement!.clientWidth;
    if (total < Main.offsetWidth) {
      middle += x;
      total = Math.max(total, document.documentElement!.offsetWidth);
    }
    if (middle >= Main.offsetWidth) {
      const offset = Main.offsetWidth + middle - 2 * total;
      if (offset <= 0) {
        Main.style.left = -Main.offsetWidth / 2 + 'px';
      } else {
        Main.style.left = (-offset - Main.offsetWidth) / 2 + 'px';
      }
    } else {
      Main.style.left = (-middle) / 2 + 'px';
    }
    Dict.style.left = (rRect.right + rRect.left) / 2 + x + 'px';
    if (above) {
      Dict.style.top = rRect.top + y + 'px';
      Dict.classList.remove('lanx-root-below');
      Dict.classList.add('lanx-root-above');
    } else {
      Dict.style.top = rRect.bottom + y + 'px';
      Dict.classList.remove('lanx-root-above');
      Dict.classList.add('lanx-root-below');
    }
    return true;
  }

  function showDict(entry: Entry, rect: Rect) {
    updateContent(entry);
    return pinpoint(rect);
  }

  function hideDict() {
    if (_enterCount < 10 && _enterCount > 1 && Dict.classList.contains(`lanx-root-tada-${_enterCount}`)) {
      Dict.classList.remove(`lanx-root-tada-${_enterCount}`);
      _enterCount--;
    }
    Dict.classList.add('lanx-none');
    _entries = [];
    _rect = null!;
    _index = 0;
  }

  function tryToShowDict(text: string, rect: Rect) {
    if (_rect && ['left', 'right', 'top', 'bottom'].every(key => (_rect as any)[key] === (rect as any)[key])) {
      return;
    }
    if (!document.querySelector('.lanx-root')) {
      document.body.appendChild(Dict);
    }
    const qword = text.substr(2);
    const lang = text.substr(0, 2);

    injector.search({ text: qword, lang: lang as 'zh' | 'en' }, (entries: Entry[]) => {
      if (entries.length) {
        showDict((_entries = entries)[_index = 0], _rect = rect);
      }
    });
  }

  return {
    hideDict,
    tryToShowDict,
    onPlayError({ code }: { code: string }) {
      const target = View.querySelector(`[data-code="${code}"]`) as HTMLElement;
      if (target) {
        target.setAttribute('disabled', 'disabled');
        target.setAttribute('title', '播放失败');
      }
    }
  };
}