import { render } from 'preact';
import Widget from './components/Widget';
import widgetCSS from './widget.css?inline'; // forces raw string import
import timelineCSS from './timeline.css?inline'; // forces raw string import
import { setupTweetRetrieval } from './utils/tweetRetrieval';

setupTweetRetrieval();

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initWidget);
} else {
    initWidget();
}

function initWidget() {

    const host = document.createElement('div');
    host.id = 'replyboost-host';
    document.body.appendChild(host);

    const shadow = host.attachShadow({ mode: 'open' });
    // Inject CSS manually into shadow
    const style = document.createElement('style');
    style.textContent = widgetCSS + '\n' + timelineCSS;
    shadow.appendChild(style);

    // Create root mount point
    const mount = document.createElement('div');
    shadow.appendChild(mount);

    // Render your component inside the shadow root
    render(<Widget />, mount);
}
