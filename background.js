
let urls = [];
let fromPopup = null;

function updateUrls(newUrls) {
    urls = newUrls;
}

chrome.storage.sync.get('urls', function(data) {
    if (data.urls) {
        updateUrls(data.urls);
    }
});

chrome.storage.onChanged.addListener(function(changes, namespace) {
    if (changes.urls) {
        updateUrls(changes.urls.newValue);
    }
});

function check(openerUrl, tabUrl) {
    return urls.some(
        url => openerUrl.includes(url) && 
        (tabUrl === undefined || (!tabUrl.includes(url) && !tabUrl.includes("chrome://")))
    )
}

chrome.tabs.onCreated.addListener(async function(tab)  {
    const openerTabId = tab.openerTabId
    const openerTab = await chrome.tabs.get(openerTabId);

    if (fromPopup === null && check(openerTab.url, tab.pendingUrl)) {
        await chrome.tabs.remove(tab.id)
    }

    fromPopup = null;
})

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    if (request.type === 'pass') {
        fromPopup = request.url;
        sendResponse({ message: 'pass sent' });
    }
});
