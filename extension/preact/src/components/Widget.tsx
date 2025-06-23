// import { h } from 'preact';
import { useState } from 'preact/hooks';
import { TimelineExample } from './TimeLine';
// import '../widget.css'; // this will be in your Shadow DOM context
// 💬
export default function Widget() {
    const [open, setOpen] = useState(false);

    return (
        <>
            <button className="rb-fab" onClick={() => setOpen(true)}>
                <img src={"/sunflower.png"} width={50} height={50} />
            </button>

            {open && (
                <>
                    <div className="rb-backdrop" onClick={() => setOpen(false)} />
                    <div className="rb-sheet">
                        <div className="rb-header">
                            <h2 className="rb-title">Reply Assistant</h2>
                            <button className="rb-close" onClick={() => setOpen(false)}>✕</button>
                        </div>
                        <div className="rb-container rb-my-2">
                            <textarea className="rb-textarea" placeholder="Type your reply..." />
                            <button className="rb-send">Enhance Reply</button>
                        </div>
                        <div className="rb-container">
                            <TimelineExample />
                        </div>
                    </div>

                </>
            )}
        </>
        // <div classNameName={"rb-fab"} id="hamidachouri">
        // </div>
    );
}
