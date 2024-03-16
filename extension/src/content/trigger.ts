import { Rect, Fetcher } from '../shared/types';
import { shorten, staticText } from './utility';
import handler from './handler';

export default function(fetcher: Fetcher) {
  const { tryToShowDict, hideDict } = handler(fetcher);
  let mousedownTargetIsNotLanxEdit = true;
  let mouseupEnabled = true;
  let dictEnabled = true;

  function capture(): [string, Rect] {
    const sltn = window.getSelection();
    const text = shorten(sltn.toString().trim());
    const rect = sltn.getRangeAt(0).getBoundingClientRect();
    if (
      text &&
      rect.left >= 0 &&
      rect.right <= document.documentElement.clientWidth &&
      rect.right > rect.left &&
      staticText(sltn.anchorNode)
    ) {
      const x = window.pageXOffset;
      const y = window.pageYOffset;
      return [
        text,
        {
          left: rect.left + x,
          right: rect.right + x,
          bottom: rect.bottom + y,
          top: rect.top + y,
        },
      ];
    }
    throw new Error();
  }

  document.addEventListener(
    'mousedown',
    ({ target }) => {
      mouseupEnabled = dictEnabled && staticText(target);
      try {
        mousedownTargetIsNotLanxEdit = !(target as HTMLElement).classList.contains(
          'lanx-edit'
        );
      } catch (e) {
        mousedownTargetIsNotLanxEdit = true;
      }
    },
    true
  );

  document.addEventListener('mouseup', ({ target }) => {
    if (mouseupEnabled && staticText(target)) {
      if (target !== document) {
        try {
          const [text, rect] = capture();
          tryToShowDict(text, rect as Rect);
        } catch (e) {
          hideDict();
        }
      }
    } else if (mousedownTargetIsNotLanxEdit) {
      hideDict();
    }
  });

  return {
    toggleDictEnabled() {
      return (dictEnabled = !dictEnabled);
    },
  };
}
