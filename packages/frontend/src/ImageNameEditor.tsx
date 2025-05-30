import { useState } from "react";

interface INameEditorProps {
    initialValue: string;
    imageId: string;
    changeName: (id: string, newName: string) => void; 
}

export function ImageNameEditor(props: INameEditorProps) {
    const [isEditingName, setIsEditingName] = useState(false);
    const [input, setInput] = useState(props.initialValue);

    const [requestInProgress, setRequestInProgress] = useState(false);
    const [hasError, setHasError] = useState(false);

    async function handleSubmitPressed() {
        setRequestInProgress(true);
        setHasError(false);
        fetch("/api/images")
            .then(res => {
                if (res.status >= 400) {
                    throw new Error("HTTP " + res.status);
                }
                return res.json();       
            }).then(() => {
                setIsEditingName(false);
                props.changeName(props.imageId, input);
                setRequestInProgress(false);
            }).catch(() => {
                setHasError(true);
                setRequestInProgress(false);
            });
    }

    if (isEditingName) {
        return (
            <div style={{ margin: "1em 0" }}>
                <label>
                    New Name <input value={input} onChange={e => setInput(e.target.value)} disabled={requestInProgress} />
                </label>
                <button disabled={input.length === 0 || requestInProgress} onClick={handleSubmitPressed}>Submit</button>
                <button onClick={() => setIsEditingName(false)}>Cancel</button>
                {requestInProgress && <p> Working...</p>}
                {hasError && <p> There was an error...</p>}
            </div>
        );
    } else {
        return (
            <div style={{ margin: "1em 0" }}>
                <button onClick={() => setIsEditingName(true)}>Edit name</button>
            </div>
        );
    }
}