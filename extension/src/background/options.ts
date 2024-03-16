import { OptionProps } from '.';

let options: OptionProps = {
  on: true,
  zh: true,
  en: true,
  jp: false,
};

const dIcons = {
  '16': 'disabled/icon16.png',
  '32': 'disabled/icon32.png',
  '48': 'disabled/icon48.png',
  '128': 'disabled/icon128.png',
};

const { icons: eIcons } = chrome.runtime.getManifest();

function setIcon(enabled: boolean) {
  chrome.action.setIcon({
    path: enabled ? eIcons : dIcons,
  });
}

chrome.action.onClicked.addListener(() => {
  setOptions('on', !options.on);
});

export default function getOptions() {
  return options;
}

const setOptions = (key, val) => {
  if (key === 'on') {
    setIcon(val);
  }
  options = { ...options, [key]: val };
};
