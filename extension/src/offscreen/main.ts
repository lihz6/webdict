import { PageScriptAction } from '../shared/enums';
import play from './player';

type Message = { action: PageScriptAction; data: any };

chrome.runtime.onMessage.addListener(
  ({ action, data }: Message, _, sendRes) => {
    if (action === PageScriptAction.PLAY_SOUND) {
      play(data).then(action =>
        sendRes({
          action,
          data,
        })
      );
      return true;
    }
    return false;
  }
);
