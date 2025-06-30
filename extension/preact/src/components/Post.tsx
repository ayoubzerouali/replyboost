import { useState } from "preact/hooks";

type PostProps = {
    isReply?: boolean;
    isLastReply?: boolean;
    avatar?: string;
    username?: string;
    handle?: string;
    timestamp?: string;
    text?: string;
    isMainPost?: boolean;
    className?: string;
}
export function Post({
    isReply = false,
    avatar = "JD",
    username = "John Doe",
    handle = "@johndoe",
    timestamp = "2h",
    text,
    isMainPost = false,
    isLastReply,
    className
}: PostProps) {
    const [isExpanded, setIsExpanded] = useState(false);
    const shouldTruncate = text?.length > 100;
    const displayText = shouldTruncate && !isExpanded
        ? text.slice(0, 100) + '...'
        : text;

    return (
        <div class={`post-item 
            ${isReply ? 'reply' : ''} 
            ${isLastReply ? 'last-reply' : ''} 
            ${isMainPost ? 'main-post' : ''} 
            ${className || ''}`}>
            <div class="post-content">
                <div class="avatar">{avatar}</div>
                <div class="post-body">
                    {isReply && <div class="reply-indicator">Reply</div>}
                    <div class="post-header">
                        <span class="username">{username}</span>
                        <span class="handle">{handle}</span>
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

