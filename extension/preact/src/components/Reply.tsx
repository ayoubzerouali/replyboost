import { useState } from "preact/hooks";

export function Reply({
    avatar = "SA",
    username = "User",
    // handle = "@user",
    timestamp = "1h",
    text,
    replyingTo = "@johndoe",
    isLastReply = false
}) {
    const [isExpanded, setIsExpanded] = useState(false);
    const shouldTruncate = text.length > 100;
    const displayText = shouldTruncate && !isExpanded
        ? text.slice(0, 100) + '...'
        : text;

    return (
        <div class={`post-item reply ${isLastReply ? 'last-reply' : ''}`}>
            <div class="post-content">
                <div class="avatar">{avatar}</div>
                <div class="post-body">

                    <div class="reply-indicator">Replying to {replyingTo}</div>
                
                    <div class="post-header">
                        <span class="username">{username}</span>
                        {/* <span class="handle">{handle}</span> */}
                        <span class="timestamp">· {timestamp}</span>
                    </div>
                    <div class="post-text">
                        <span class="text-content">{displayText}</span>
                        {shouldTruncate && (
                            <button
                                class="show-more-btn"
                                onClick={() => setIsExpanded(!isExpanded)}
                            >
                                {isExpanded ? 'Show less' : 'Show more'}
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
