// Fixlist extension: does nothing until the user clicks the toolbar button (or presses the shortcut).
// Then it injects the bundled axe-core and the Fixlist panel into that one tab. No network access,
// no content scripts, no host permissions: the "activeTab" permission covers the clicked tab only.

const FILES = ['axe.min.js', 'fixlist-check.js'];

async function run(tab) {
  const tabId = tab && tab.id;
  if (tabId === undefined) { return; }
  try {
    await chrome.action.setBadgeText({ tabId, text: '' });
    // Inject axe only once per page so a second click just reopens the panel.
    const [{ result: hasAxe } = {}] = await chrome.scripting.executeScript({
      target: { tabId }, func: () => !!(window.axe && window.axe.run),
    });
    await chrome.scripting.executeScript({ target: { tabId }, files: hasAxe ? FILES.slice(1) : FILES });
  } catch (err) {
    // Chrome does not allow extensions on some pages (chrome:// pages, the Web Store, the built-in PDF viewer).
    await chrome.action.setBadgeBackgroundColor({ tabId, color: '#B3261E' });
    await chrome.action.setBadgeText({ tabId, text: '!' });
    await chrome.action.setTitle({ tabId, title: 'Fixlist cannot run on this page. Chrome does not let extensions check this kind of page.' });
  }
}

chrome.action.onClicked.addListener(run);
// Exposed so the automated tests can call the same code path as a click.
globalThis.fixlistRun = run;
