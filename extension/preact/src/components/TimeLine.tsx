import { useEffect, useRef } from "preact/hooks";
export function TimeLine({ children }) {
    const containerRef = useRef(null);

    const initializeTextTruncation = () => {
        if (!containerRef.current) return;

        const textElements = containerRef.current.querySelectorAll('.text-content');
        textElements.forEach(function(element) {
            const text = element.textContent;
            if (text.length > 280) {
                element.classList.add('text-truncated');
                const button = element.nextElementSibling;
                if (button && button.classList.contains('show-more-btn')) {
                    button.style.display = 'inline';
                }
            } else {
                const button = element.nextElementSibling;
                if (button && button.classList.contains('show-more-btn')) {
                    button.style.display = 'none';
                }
            }
        });
    };

    useEffect(() => {
        // Initialize after component mounts
        initializeTextTruncation();
    }, []);

    // Re-initialize when children change
    useEffect(() => {
        initializeTextTruncation();
    }, [children]);

    return (
        <div class="container">
            <div class="post-tree" ref={containerRef}>
                {children}
            </div>
        </div>
    );
}

export function Post({
    avatar = "JD",
    username = "John Doe",
    handle = "@johndoe",
    timestamp = "2h",
    text,
    isMainPost = false
}) {
    const toggleText = (e) => {
        const button = e.target;
        const textContent = button.previousElementSibling;
        const isExpanded = button.textContent === 'Show less';

        if (isExpanded) {
            textContent.classList.add('text-truncated');
            button.textContent = 'Show more';
        } else {
            textContent.classList.remove('text-truncated');
            button.textContent = 'Show less';
        }
    };

    return (
        <div class={`post-item ${isMainPost ? 'main-post' : ''}`}>
            <div class="post-content">
                <div class="avatar">{avatar}</div>
                <div class="post-body">
                    <div class="post-header">
                        <span class="username">{username}</span>
                        <span class="handle">{handle}</span>
                        <span class="timestamp">· {timestamp}</span>
                    </div>
                    <div class="post-text">
                        <span class="text-content">{text}</span>
                        <button class="show-more-btn" onClick={toggleText}>
                            Show more
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export function Reply({
    avatar = "SA",
    username = "User",
    handle = "@user",
    timestamp = "1h",
    text,
    replyingTo = "@johndoe",
    isLastReply = false
}) {
    const toggleText = (e) => {
        const button = e.target;
        const textContent = button.previousElementSibling;
        const isExpanded = button.textContent === 'Show less';

        if (isExpanded) {
            textContent.classList.add('text-truncated');
            button.textContent = 'Show more';
        } else {
            textContent.classList.remove('text-truncated');
            button.textContent = 'Show less';
        }
    };

    return (
        <div class={`post-item reply ${isLastReply ? 'last-reply' : ''}`}>
            <div class="post-content">
                <div class="avatar">{avatar}</div>
                <div class="post-body">
                    <div class="reply-indicator">Replying to {replyingTo}</div>
                    <div class="post-header">
                        <span class="username">{username}</span>
                        <span class="handle">{handle}</span>
                        <span class="timestamp">· {timestamp}</span>
                    </div>
                    <div class="post-text">
                        <span class="text-content">{text}</span>
                        <button class="show-more-btn" onClick={toggleText}>
                            Show more
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

// Usage example:
export function TimelineExample() {
    return (
        <TimeLine>


            <Reply
                avatar="SA"
                username="Sarah Anderson"
                handle="@sarahdev"
                timestamp="1h"
                replyingTo="@johndoe"
                text="Congratulations! Can't wait to try it out. What was the biggest technical challenge you faced?"
            />

            <Reply
                avatar="JD"
                username="John Doe"
                handle="@johndoe"
                timestamp="1h"
                replyingTo="@sarahdev"
                text="Thanks Sarah! The biggest challenge was definitely optimizing the database queries. We had to completely rethink our indexing strategy and implement some custom caching mechanisms. It was worth it though - the performance improvements are incredible. Load times are now 60% faster than before and the user experience is so much smoother."
            />

            <Reply
                avatar="MR"
                username="Mike Roberts"
                handle="@mikecodes"
                timestamp="45m"
                replyingTo="@johndoe"
                text="60% faster? That's amazing! Would love to hear more about the caching strategy you implemented."
            />

            <Reply
                avatar="EL"
                username="Emily Chen"
                handle="@emilychen"
                timestamp="30m"
                replyingTo="@johndoe"
                text="This looks fantastic! The attention to detail is incredible. I've been following your progress on this project and it's been amazing to see how it evolved. Your team's dedication really shows in the final product. The user interface is clean and intuitive, and the performance improvements you mentioned are exactly what the platform needed."
            />

            <Reply
                avatar="JD"
                username="John Doe"
                handle="@johndoe"
                timestamp="15m"
                replyingTo="@emilychen"
                text="Thank you so much Emily! Your feedback throughout the development process was invaluable. Next up: mobile optimization! 📱"
                isLastReply={true}
            />
            <Post
                isMainPost={true}
                avatar="JD"
                username="John Doe"
                handle="@johndoe"
                timestamp="2h"
                text="Just shipped a new feature! Really excited about how this turned out. The team worked incredibly hard on this and I think our users are going to love it. It's been months in the making and we've overcome so many technical challenges along the way. Special thanks to everyone who contributed to making this possible!"
            />
        </TimeLine>
    );
}
