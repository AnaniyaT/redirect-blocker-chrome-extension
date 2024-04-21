
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
        console.log(tab.url)
        const mainUrl = new URL(url).hostname;
        addUrl(mainUrl);
    });
}

function addUrl(url) {
    if (url === "newtab") {
        return;
    }
    
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

function renderUrls() {
    urlListDiv.innerHTML = '';

    urls.forEach(function(url) {
        const urlElement = document.createElement('div');
        const deleteButton = document.createElement('button');
        deleteButton.innerText = 'Delete';
        deleteButton.addEventListener('click', function() {
            removeUrl(url);
        });

        urlElement.innerText = url;
        urlElement.appendChild(deleteButton);
        urlListDiv.appendChild(urlElement);
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