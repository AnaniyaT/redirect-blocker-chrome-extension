

let urls = [];

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
    let flag = false;

    for (url of urls) {
        if (openerUrl.includes(url) && (tabUrl == null || (!tabUrl.includes(url) && !tabUrl.includes("chrome://")))) {
            flag = true;
            break;
        }
    }

    return flag;
}

chrome.tabs.onCreated.addListener(async function(tab)  {
 const openerTabId = tab.openerTabId
 const openerTab = await chrome.tabs.get(openerTabId);

 if (check(openerTab.url, tab.pendingUrl)) {
        await chrome.tabs.remove(tab.id)
     }
})
