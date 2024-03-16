import { PageScriptAction } from '../shared/enums';
import getOptions from './options';
import notify from './notifics';
import { host } from '../fetch';
import Fetch from '../fetch';

type Message = { action: PageScriptAction; data: any };

chrome.runtime.onMessage.addListener(
  ({ action, data }: Message, _, sendRes: (worddata: any[]) => void) => {
    const { on, jp } = getOptions();
    if (!on) {
      return false;
    }
    switch (action) {
      case PageScriptAction.SEARCH_TEXT:
        Fetch.search(data).then(worddata => {
          if (!jp && data.lang === 'zh') {
            sendRes(
              worddata.map(({ word, data }) => ({
                word,
                data: Object.keys(data)
                  .filter(x => !x.startsWith('yue'))
                  .reduce((o, k) => ((o[k] = data[k]), o), {}),
              }))
            );
          } else {
            sendRes(worddata);
          }
        });
        return true;
      case PageScriptAction.DEFINE_WORD:
        Fetch.define(data).then(state => {
          if (state === -2) {
            notify('权限不足', '请注册登录');
            chrome.tabs.create({
              url: `${host}/`,
            });
          }
        });
        return false;
      case PageScriptAction.WORD_VIEWED:
        return false;
      default:
        return false;
    }
  }
);

chrome.offscreen.createDocument({
  justification: 'play audio', // details for using the API
  reasons: [chrome.offscreen.Reason.AUDIO_PLAYBACK],
  url: 'offscreen.html',
});
