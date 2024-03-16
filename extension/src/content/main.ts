import { PageScriptAction, BackgroundAction } from '../shared/enums';
import trigger from './trigger';

type Message = { action: BackgroundAction; data: any };

trigger({
  playme(data) {
    const action = PageScriptAction.PLAY_SOUND;
    return chrome.runtime
      .sendMessage({ action, data })
      .then(({ action, data }: Message) => {
        if (action === BackgroundAction.PLAY_ERROR) {
          throw new Error();
        }
      });
  },
  search(data) {
    const action = PageScriptAction.SEARCH_TEXT;
    return chrome.runtime.sendMessage({ action, data });
  },
  define(data) {
    const action = PageScriptAction.DEFINE_WORD;
    chrome.runtime.sendMessage({ action, data });
  },
  viewed(data) {
    const action = PageScriptAction.WORD_VIEWED;
    chrome.runtime.sendMessage({ action, data });
  },
});
