
chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
    if (msg.type !== "GET_TWEET_CONTEXT") return;

    // Try multiple selectors
    const tweetEl = document.querySelector('article [data-testid="tweetText"]') ||
        document.querySelector('article div[lang]');
    const authorEl = tweetEl?.closest('article')?.querySelector('div[dir="ltr"] span');

    if (!tweetEl || !authorEl) return sendResponse(null);

    sendResponse({
        content: tweetEl.innerText,
        author: authorEl.innerText
    });
});
chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
    if (msg.type !== 'GET_CONVERSATION') return;

    const html = document.body.innerHTML;
    const conv = extractTimelineConversation(html);
    sendResponse(conv);
});
function extractTimelineConversation(html) {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    const tweets = doc.querySelectorAll('article[data-testid="tweet"]');
    const result = [];

    tweets.forEach(tweet => {
        const author = tweet.querySelector('a[href^="/"] span').textContent.trim();
        const time = tweet.querySelector('time').getAttribute('datetime');
        const text = tweet.querySelector('div[data-testid="tweetText"]').textContent.trim();
        const replyTo = tweet.querySelector('button[data-testid="tweetTextarea_0_label"] span')?.textContent.trim() || null;

        result.push({
            time,
            author,
            replyTo,
            text
        });
    });

    return result;
}
const widget = document.createElement('div');
widget.id = 'twitter-assistant-widget';
// widget.style.cssText = `
//   position: fixed;
//   top: 20px;
//   right: 20px;
//   z-index: 999999;
//   font-family: system-ui, sans-serif;
// `;
document.body.appendChild(widget);
