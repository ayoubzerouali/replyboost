import { useEffect, useRef, useState } from "preact/hooks";
import { Post } from "./Post";
// import { Reply } from "./Reply";
import { getCurrentTweetContext } from "../utils/tweetRetrieval";
import { getConversationData } from "../utils/tweetRetrieval";


export function Timeline() {
    const [currentTweet, setCurrentTweet] = useState(null);
    const [conversation, setConversation] = useState([]);
    const [isVisible, setIsVisible] = useState(false);

    const containerRef = useRef(null);

    // const initializeTextTruncation = () => {
    //     if (!containerRef.current) return;
    //
    //     const textElements = containerRef.current.querySelectorAll('.text-content');
    //     textElements.forEach(function(element) {
    //         const text = element.textContent;
    //         if (text.length > 280) {
    //             element.classList.add('text-truncated');
    //             const button = element.nextElementSibling;
    //             if (button && button.classList.contains('show-more-btn')) {
    //                 button.style.display = 'inline';
    //             }
    //         } else {
    //             const button = element.nextElementSibling;
    //             if (button && button.classList.contains('show-more-btn')) {
    //                 button.style.display = 'none';
    //             }
    //         }
    //     });
    // };
    //
    // useEffect(() => {
    //     // Initialize after component mounts
    //     initializeTextTruncation();
    // }, []);

    // Auto-detect when user is viewing a tweet
    useEffect(() => {
        const detectTweetPage = () => {
            const isTweetPage = window.location.pathname.includes('/status/');
            if (isTweetPage) {
                loadTweetData();
                setIsVisible(true);
            } else {
                setIsVisible(false);
            }
        };

        // Initial check
        detectTweetPage();

        // Listen for navigation changes (Twitter is SPA)
        let lastUrl = window.location.href;
        const observer = new MutationObserver(() => {
            if (window.location.href !== lastUrl) {
                lastUrl = window.location.href;
                setTimeout(detectTweetPage, 800); // Wait for content to load
            }
        });

        observer.observe(document.body, { childList: true, subtree: true });

        return () => observer.disconnect();
    }, []);

    const loadTweetData = async () => {
        try {
            // Get current tweet context
            const tweetContext = getCurrentTweetContext();
            if (tweetContext) {
                setCurrentTweet(tweetContext);
            }

            // Get conversation
            const conv = getConversationData();
            setConversation(conv);
        } catch (error) {
            console.error('Error loading tweet data:', error);
        }
    };

    const refreshData = () => {
        loadTweetData();
    };

    if (!isVisible) {
        return null;
    }
    return (
        <div class="container">
            <div className="post-tree" ref={containerRef}>
                {/* {currentTweet && ( */}
                {/*     <Post */}
                {/*         avatar={currentTweet.avatar} */}
                {/*         username={currentTweet.username} */}
                {/*         handle={currentTweet.handle} */}
                {/*         timestamp={currentTweet.timestamp} */}
                {/*         text={currentTweet.content} */}
                {/*         isMainPost */}
                {/*     /> */}
                {/* )} */}
                {conversation.map((reply, index) => {
                    if (index === 0) {
                        return (
                            <Post
                                username={reply.author}
                                key={index}
                                text={reply.text}
                                // isMainPost
                                isReply={reply.isReply}
                            />
                        );
                    } else {
                        return (
                            <div key={index}>
                                <Post isReply={reply.isReply} text={reply.text} username={reply.author} />

                                {/* <span style={{ fontWeight: 'bold', color: '#1d9bf0' }}> */}
                                {/*     {reply.author} */}
                                {/* </span> */}
                                {reply.isReply && (
                                    <span style={{ fontSize: '12px', color: '#888' }}>
                                        → {reply.replyTo}
                                    </span>
                                )}
                            </div>
                        );
                    }
                })}
            </div>
        </div>
    );
}
