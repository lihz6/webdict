import { PageScriptData } from '../shared/types';
import { BackgroundAction } from '../shared/enums';

import { Cache } from './cache';
import { host } from '../fetch';

const URLXD = {
  zh: [`${host}/static/pron/zh/`, `.ogg`],
  uk: [`${host}/static/pron/uk/`, `.mp3`],
  us: [`${host}/static/pron/us/`, `.mp3`],
  jp: [`${host}/static/pron/jp/`, `.wav`],
};

const cache = new Cache<HTMLAudioElement>(128);
/**
 * `code` formats:
 *
 * 1. `zh:pin1`
 * 2. `uk:C7IZLO-RJ`
 * 3. `us:F7I-NLO-KJ`
 * 3. `jp:sik6`
 *
 * `onerror` when playing failed.
 */
export default function play({ code }: PageScriptData.Playme) {
  return new Promise<BackgroundAction>(resolve => {
    const oldAudio = cache.get(code);
    if (oldAudio) {
      if (!oldAudio.getAttribute('disabled')) {
        oldAudio.play();
        resolve(BackgroundAction.PLAY_OKAY);
      } else {
        resolve(BackgroundAction.PLAY_ERROR);
      }
    } else {
      const [lang, file] = code.split(':');
      if (URLXD[lang]) {
        const newAudio = document.createElement('audio');
        cache.add(code, newAudio);
        newAudio.preload = 'auto';
        newAudio.autoplay = true;
        const [dir, ext] = URLXD[lang];
        newAudio.src = dir + file + ext;
        newAudio.onerror = (event: ErrorEvent) => {
          event.stopPropagation();
          newAudio.setAttribute('disabled', 'disabled');
          resolve(BackgroundAction.PLAY_ERROR);
        };
        newAudio.oncanplay = () => {
          resolve(BackgroundAction.PLAY_OKAY);
        };
      }
    }
  });
}
