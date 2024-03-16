type Button = {
  title: string;
  onClick(): void;
};

const listeners = {};

export default (title: string, message: string, buttons: Button[] = []) => {
  const notificationId = `lanx-${Date.now()}`;
  if (buttons.length) {
    listeners[notificationId] = buttons.map(({ onClick }) => onClick);
  }
  chrome.notifications.create(notificationId, {
    iconUrl: chrome.runtime.getURL('enabled/icon32.png'),
    buttons: buttons.map(({ title }) => ({ title })),
    type: 'basic',
    silent: true,
    message,
    title,
  } as any);
};

chrome.notifications.onButtonClicked.addListener(
  (notificationId, buttonIndex) => {
    try {
      listeners[notificationId][buttonIndex]();
    } finally {
      delete listeners[notificationId];
    }
  }
);

chrome.notifications.onClosed.addListener((notificationId, _byUser) => {
  delete listeners[notificationId];
});
