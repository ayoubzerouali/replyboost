// Modern TypeScript Twitter reply scraper
interface Tweet {
  id: string;
  text: string;
  author: string;
  timestamp: string;
  isReply: boolean;
  parentId?: string;
  element: HTMLElement;
}

interface TweetNode {
  tweet: Tweet;
  replies: TweetNode[];
  depth: number;
}

interface ThreadContext {
  isReplyThread: boolean;
  currentTweetId: string;
  originalTweetId?: string;
  context: 'reply_thread' | 'single_tweet' | 'timeline';
}

interface AIContext {
  originalTweet: Tweet;
  conversation: (Tweet & { depth: number })[];
  threadContext: {
    totalReplies: number;
    maxDepth: number;
    timeline: Array<{
      author: string;
      text: string;
      timestamp: string;
      depth: number;
    }>;
  };
  participants: string[];
}

// Modern functional approach with async/await and proper error handling
const delay = (ms: number): Promise<void> => 
  new Promise(resolve => setTimeout(resolve, ms));

const waitForContentLoad = (timeout = 3000): Promise<void> => {
  return new Promise(resolve => {
    const observer = new MutationObserver((mutations) => {
      const hasNewTweets = mutations.some(mutation => 
        Array.from(mutation.addedNodes).some(node => 
          node.nodeType === Node.ELEMENT_NODE && 
          (node as Element).querySelector('[data-testid="tweet"]')
        )
      );
      
      if (hasNewTweets) {
        observer.disconnect();
        resolve();
      }
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true
    });

    setTimeout(() => {
      observer.disconnect();
      resolve();
    }, timeout);
  });
};

// Extract tweet data from DOM element
const extractTweetData = (element: HTMLElement, tweetId?: string): Tweet | null => {
  const textElement = element.querySelector('[data-testid="tweetText"]');
  const authorElement = element.querySelector('[data-testid="User-Name"]');
  const timeElement = element.querySelector('time');
  
  // Extract tweet ID if not provided
  const id = tweetId || (() => {
    const link = element.querySelector('a[href*="/status/"]') as HTMLAnchorElement;
    if (link) {
      const match = link.href.match(/\/status\/(\d+)/);
      return match?.[1];
    }
    return element.getAttribute('data-tweet-id') || 
           element.getAttribute('data-testid-tweet-id');
  })();

  if (!id) return null;

  return {
    id,
    text: textElement?.textContent?.trim() || '',
    author: authorElement?.textContent?.trim() || '',
    timestamp: timeElement?.getAttribute('datetime') || '',
    isReply: element.querySelector('[data-testid="reply"]') !== null ||
             element.querySelector('[aria-label*="Replying to"]') !== null,
    parentId: extractParentTweetId(element),
    element
  };
};

const extractParentTweetId = (element: HTMLElement): string | undefined => {
  const replyLinks = element.querySelectorAll('a[href*="/status/"]');
  for (const link of Array.from(replyLinks)) {
    if (link.textContent?.includes('Replying to')) {
      const match = (link as HTMLAnchorElement).href.match(/\/status\/(\d+)/);
      return match?.[1];
    }
  }
  return undefined;
};

// Click all "Show more replies" buttons
const expandAllReplies = async (): Promise<void> => {
  const buttonSelectors = [
    '[aria-label*="more replies"]',
    '[aria-label*="Show replies"]',
    'span:contains("Show more replies")',
    'span:contains("Show replies")',
    'span:contains("Show this thread")'
  ];

  // Find buttons by text content (more reliable)
  const allButtons = document.querySelectorAll('[role="button"]');
  const replyButtons = Array.from(allButtons).filter(btn => {
    const text = btn.textContent?.toLowerCase() || '';
    return text.includes('more replies') || 
           text.includes('show replies') || 
           text.includes('show this thread');
  });

  // Click each button with delay
  for (const button of replyButtons) {
    if (button && (button as HTMLElement).offsetParent !== null) {
      (button as HTMLElement).click();
      await delay(1000);
    }
  }

  // Trigger infinite scroll if no buttons found
  if (replyButtons.length === 0) {
    await triggerInfiniteScroll();
  }
};

const triggerInfiniteScroll = async (): Promise<void> => {
  const scrollContainer = document.querySelector('[data-testid="primaryColumn"]') || 
                         document.querySelector('main') || 
                         document.body;

  if (!scrollContainer) return;

  let previousHeight = scrollContainer.scrollHeight;
  let attempts = 0;
  const maxAttempts = 3;

  while (attempts < maxAttempts) {
    scrollContainer.scrollTo(0, scrollContainer.scrollHeight);
    await delay(2000);
    
    const newHeight = scrollContainer.scrollHeight;
    if (newHeight === previousHeight) break;
    
    previousHeight = newHeight;
    attempts++;
  }
};

// Get all tweets currently on page
const getAllTweets = (): Tweet[] => {
  const tweetElements = document.querySelectorAll('[data-testid="tweet"]');
  const tweets: Tweet[] = [];
  
  tweetElements.forEach(element => {
    const tweet = extractTweetData(element as HTMLElement);
    if (tweet) tweets.push(tweet);
  });
  
  return tweets;
};

// Detect current thread context
const detectThreadContext = (): ThreadContext | null => {
  const url = window.location.href;
  const urlPattern = /(?:twitter\.com|x\.com)\/\w+\/status\/(\d+)/;
  const match = url.match(urlPattern);
  
  if (!match) return null;

  const currentTweetId = match[1];
  const threadLink = document.querySelector('[href*="/status/"]');
  
  return {
    isReplyThread: !!threadLink,
    currentTweetId,
    originalTweetId: findOriginalTweetId(),
    context: determineContext()
  };
};

const findOriginalTweetId = (): string | undefined => {
  const threadIndicators = document.querySelectorAll('a[href*="/status/"]');
  
  for (const link of Array.from(threadIndicators)) {
    const href = (link as HTMLAnchorElement).href;
    const match = href.match(/\/status\/(\d+)/);
    if (match) return match[1];
  }
  
  const firstTweet = document.querySelector('[data-testid="tweet"]');
  return firstTweet ? extractTweetData(firstTweet as HTMLElement)?.id : undefined;
};

const determineContext = (): 'reply_thread' | 'single_tweet' | 'timeline' => {
  const url = window.location.href;
  const breadcrumbs = document.querySelectorAll('[data-testid="breadcrumb"]');
  
  if (url.includes('/status/')) {
    return breadcrumbs.length > 0 ? 'reply_thread' : 'single_tweet';
  }
  
  return 'timeline';
};

// Build conversation context for AI
const buildConversationContext = (tweets: Tweet[]): AIContext | null => {
  if (tweets.length === 0) return null;

  // Find the root tweet (either first chronologically or the one without parent)
  const rootTweet = tweets.find(t => !t.isReply) || tweets[0];
  
  // Sort tweets chronologically
  const sortedTweets = tweets.sort((a, b) => 
    new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
  );

  // Calculate depth for each tweet (simple version - just order)
  const conversation = sortedTweets.map((tweet, index) => ({
    ...tweet,
    depth: tweet === rootTweet ? 0 : 1 // Simplified depth calculation
  }));

  const participants = [...new Set(tweets.map(t => t.author))];

  return {
    originalTweet: rootTweet,
    conversation,
    threadContext: {
      totalReplies: tweets.length - 1,
      maxDepth: Math.max(...conversation.map(t => t.depth)),
      timeline: conversation.map(t => ({
        author: t.author,
        text: t.text,
        timestamp: t.timestamp,
        depth: t.depth
      }))
    },
    participants
  };
};

// Main function to get complete conversation context
const getCompleteConversationContext = async (): Promise<AIContext | null> => {
  try {
    // First expand all replies
    await expandAllReplies();
    
    // Wait for content to load
    await waitForContentLoad(2000);
    
    // Get all tweets
    const tweets = getAllTweets();
    
    // Build context
    return buildConversationContext(tweets);
  } catch (error) {
    console.error('Error getting conversation context:', error);
    return null;
  }
};

// Export the main functions
export {
  type Tweet,
  type TweetNode,
  type ThreadContext,
  type AIContext,
  extractTweetData,
  expandAllReplies,
  getAllTweets,
  detectThreadContext,
  buildConversationContext,
  getCompleteConversationContext
};
