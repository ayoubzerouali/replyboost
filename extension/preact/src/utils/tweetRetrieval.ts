export function setupTweetRetrieval() {
    console.log('Setting up tweet retrieval...');

    // Listen for tweet context requests
    chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
        if (msg.type === "GET_TWEET_CONTEXT") {
            const tweetData = getCurrentTweetContext();
            sendResponse(tweetData);
            return true; // Keep message channel open
        }

        if (msg.type === 'GET_CONVERSATION') {
            const conversation = getConversationData();
            sendResponse(conversation);
            return true;
        }
    });
}
export function getCurrentTweetContext() {
    try {
        // Try multiple selectors for tweet content
        const tweetEl = document.querySelector('article [data-testid="tweetText"]') ||
            document.querySelector('article div[lang]') ||
            document.querySelector('article [dir="auto"]');

        // Get author info
        const authorEl = tweetEl?.closest('article')?.querySelector('div[dir="ltr"] span') ||
            tweetEl?.closest('article')?.querySelector('a[href^="/"] span');

        // Get timestamp
        const timeEl = tweetEl?.closest('article')?.querySelector('time');

        if (!tweetEl || !authorEl) {
            console.log('Could not find tweet elements');
            return null;
        }

        return {
            content: tweetEl.innerText.trim(),
            author: authorEl.innerText.trim(),
            timestamp: timeEl?.getAttribute('datetime') || new Date().toISOString(),
            url: window.location.href
        };
    } catch (error) {
        console.error('Error getting tweet context:', error);
        return null;
    }
}

export function getConversationData() {
    try {
        // 1. grab all tweets in document order
        const allTweets = Array.from(
            document.querySelectorAll<HTMLElement>('article[data-testid="tweet"]')
        );

        // 2. find the “current” tweet index
        const currentIndex = allTweets.findIndex(
            t => t.getAttribute('tabindex') === '-1'
        );

        // fallback: if none found, treat them all as descendants
        const hasCurrent = currentIndex > -1;

        // 3. build result by slicing
        const ancestors = hasCurrent
            ? allTweets.slice(0, currentIndex)
            : [];
        const current = hasCurrent
            ? [allTweets[currentIndex]]
            : [];
        const descendants = hasCurrent
            ? allTweets.slice(currentIndex + 1)
            : allTweets;

        const result: Array<{
            id: number;
            author: string;
            text: string;
            timestamp: string;
            role: 'ancestor' | 'current' | 'descendant';
            replyTo: string | null;
        }> = [];

        const process = (
            tweets: HTMLElement[],
            role: 'ancestor' | 'current' | 'descendant'
        ) => {
            tweets.forEach((tweetEl, idx) => {
                const authorEl =
                    tweetEl.querySelector('a[href^="/"] span') ||
                    tweetEl.querySelector('div[dir="ltr"] span');
                const textEl =
                    tweetEl.querySelector('div[data-testid="tweetText"]') ||
                    tweetEl.querySelector('div[lang]');
                const timeEl = tweetEl.querySelector('time');
                if (!authorEl || !textEl) return;

                result.push({
                    id: result.length,
                    author: authorEl.textContent!.trim(),
                    text: textEl.textContent!.trim(),
                    timestamp: timeEl?.getAttribute('datetime') || new Date().toISOString(),
                    role,
                    replyTo: role === 'ancestor'
                        ? null
                        : extractReplyTo(tweetEl)
                });
            });
        };

        process(ancestors, 'ancestor');
        process(current, 'current');
        process(descendants, 'descendant');

        return result;
    } catch (error) {
        console.error('Error getting conversation:', error);
        return [];
    }
}

function extractReplyTo(tweetElement) {
    try {
        const replyText = tweetElement.querySelector('div[dir="ltr"]')?.textContent;
        if (replyText?.includes('Replying to')) {
            const match = replyText.match(/Replying to @(\w+)/);
            return match ? `@${match[1]}` : null;
        }
        return null;
    } catch (error) {
        return null;
    }
}
