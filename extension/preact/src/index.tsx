// import { render } from 'preact';
//
// // import preactLogo from './assets/preact.svg';
import './style.css';
//
// function Widget() {
//     return (
//
//         <div style={{
//             position: 'fixed',
//             background: 'white', height: '50px', width: '50px', color: 'black',
//             display: 'flex', justifyContent: 'center', alignItems: 'center',
//             border: '1px solid black',
//             borderRadius: '50%',
//             cursor: 'pointer',
//             transition: 'all 0.2s ease-in-out',
//             right: 0,
//             top: 0,
//         }} id="hamidachouri">
//         </div>
//     );
// }


import { render } from 'preact';
import Widget from './components/Widget';
import widgetCSS from './widget.css?inline'; // forces raw string import
import timelineCSS from './timeline.css?inline'; // forces raw string import

// Create host and shadow root
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
