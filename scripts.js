
const inputElement = document.getElementById('url-input');
const submitButtonElement = document.getElementById('url-submit');
const urlListDiv = document.getElementById('url-list');

const urls = [];

chrome.storage.sync.get('urls', function(data) {
    if (data.urls) {
        urls.push(...data.urls);
        renderUrls();
    }
});

function addCurrentTabUrl() {
    chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
        const tab = tabs[0];
        const url = tab.url;

        // don't add it if it's a chrome tab
        if (url.includes("chrome://")) {
            return;
        }

        const mainUrl = new URL(url).hostname;
        addUrl(mainUrl);
    });
}

function addUrl(url) {
    for (let i = 0; i < urls.length; i++) {
        if (urls[i] === url) {
            return;
        }
    }

    urls.push(url);
    chrome.storage.sync.set({ urls: urls });
    renderUrls();
}

function removeUrl(url) {
    const urlIndex = urls.indexOf(url);
    urls.splice(urlIndex, 1);
    chrome.storage.sync.set({ urls: urls });
    renderUrls();
}

function giveOneTimePass(url) {
    chrome.runtime.sendMessage({ type: "pass", url: url }, function(response) {});
}

function renderUrls() {
    urlListDiv.innerHTML = '';

    urls.forEach(function(url) {
        const urlContainer = document.createElement('div');
        const urlLink = document.createElement('a');
        urlLink.onclick = function() {
            giveOneTimePass(url);
        }

        urlLink.href = `http://${url}`;
        urlLink.target = '_blank';
        urlLink.innerText = url;

        const deleteButton = document.createElement('button');
        deleteButton.innerText = 'Delete';
        deleteButton.addEventListener('click', function() {
            removeUrl(url);
        });

        urlContainer.appendChild(urlLink);
        urlContainer.appendChild(deleteButton);
        urlListDiv.appendChild(urlContainer);
    });
}

function resetInput() {
    inputElement.value = '';
}

submitButtonElement.addEventListener('click', function() {
    let url = inputElement.value;
    const urlPattern = /^([a-z0-9]+[.])+[a-z]{2,}$/i;

    if (url.trim() === '') {
        addCurrentTabUrl();
        return;
    }

    if (urlPattern.test(url)) {
        addUrl(url);
        resetInput();
    } else {
        alert(`Invalid URL: ${url}`);
    }
});

inputElement.addEventListener('keyup', function(event) {
    if (event.key === 'Enter') {
        submitButtonElement.click();
    }
});