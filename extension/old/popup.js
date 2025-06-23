(async () => {
    try {
        // const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
        // const response = await new Promise(resolve => {
        //     chrome.tabs.sendMessage(tab.id, { type: "GET_TWEET_CONTEXT" }, resolve);
        // });
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            const tabId = tabs[0].id;
            chrome.tabs.sendMessage(tabId, { type: 'GET_CONVERSATION' }, (response) => {
                if (chrome.runtime.lastError) {
                    console.error('No content script loaded yet.');
                    document.getElementById('conversation').innerText = 'Unable to load tweet data.';
                    return;
                }
                if (!response) {
                    document.getElementById('conversation').innerText = 'No tweets found.';
                    return;
                }

                const list = response.map(t => `@${t.author}: ${t.text}`).join('\n\n');
                document.getElementById('conversation').innerText = list;
            });
        });
        if (chrome.runtime.lastError) throw new Error(chrome.runtime.lastError.message);
        if (!response) {
            document.getElementById("tweet").innerText = "No tweet context found.";
            return;
        }

        document.getElementById("tweet").innerText = `@${response.author}: ${response.content}`;
    } catch (err) {
        console.error("Error fetching tweet:", err);
        document.getElementById("tweet").innerText = `Error: ${err.message}`;
    }
})();


