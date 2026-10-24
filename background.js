const TRANSLATE_ORIGIN = 'https://translate.google.com';
const MENU_ID = 'gts-translate-selection';

chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: MENU_ID,
    title: 'Dịch "%s" bằng Google Dịch',
    contexts: ['selection'],
  });
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === MENU_ID) openTranslate(info.selectionText, tab);
});

chrome.commands.onCommand.addListener(async (command, tab) => {
  if (command !== 'translate-selection') return;
  openTranslate(await readSelection(tab), tab);
});

async function readSelection(tab) {
  if (!tab?.id || !/^https?:|^file:/.test(tab.url || '')) return '';
  try {
    const [result] = await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: () => String(window.getSelection() || ''),
    });
    return (result?.result || '').trim();
  } catch {
    return ''; // Restricted pages (Chrome Web Store, chrome://...) cannot be scripted.
  }
}

async function openTranslate(text, fromTab) {
  const url = new URL(TRANSLATE_ORIGIN + '/');
  url.searchParams.set('sl', 'auto');
  url.searchParams.set('op', 'translate');
  if (text) url.searchParams.set('text', text.slice(0, 5000));

  const [existing] = await chrome.tabs.query({
    url: TRANSLATE_ORIGIN + '/*',
    windowId: fromTab?.windowId,
  });
  if (existing) {
    // Without text, just bring the existing tab forward and keep its state.
    if (text) await chrome.tabs.update(existing.id, { url: url.href, active: true });
    else await chrome.tabs.update(existing.id, { active: true });
  } else {
    await chrome.tabs.create({
      url: url.href,
      index: fromTab ? fromTab.index + 1 : undefined,
    });
  }
}
