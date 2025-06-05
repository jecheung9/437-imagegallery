import { useId, useState, useActionState } from "react";

interface IUploadPageProps {
    authToken: string;
    onUpload?: () => void;
}

function readAsDataURL(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
        const fr = new FileReader();
        fr.readAsDataURL(file);
        fr.onload = () => resolve(fr.result as string);
        fr.onerror = (err) => reject(err);
    });
}

export function UploadPage(props: IUploadPageProps) {
    const uploadId = useId();
    const [imageUrl, setImageUrl] = useState("");

    async function handleFileSelected(e: React.ChangeEvent<HTMLInputElement>) {
        const inputElement = e.target;
        const fileObj = inputElement.files?.[0];
        if (fileObj) {
            const dataUrl = await readAsDataURL(fileObj);
            setImageUrl(dataUrl);
        }
    }

    const [result, submitAction, isPending] = useActionState(
        async (_: any, formData: FormData) => {
            return fetch("/api/images", {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${props.authToken}`,
                },
                body: formData,
            })
            .then(res => {
                if (res.status >= 400) {
                    throw new Error("HTTP " + res.status);
                }
                if (props.onUpload) {
                    props.onUpload();
                }
                return { success: true, message: "Upload successful" };
            })
            .catch(() => {
                return { success: false, message: "Failed to upload, try again" };
            })
        },
        null
    );
    

    return (
        <>
            <h2>Upload</h2>
        <form onSubmit={async (e) => {
            e.preventDefault();
            const form = e.currentTarget;
            const formData = new FormData(form);
            submitAction(formData);
        }}>
            <div>
                <label htmlFor={uploadId}>Choose image to upload: </label>
                <input
                    id={uploadId}
                    name="image"
                    type="file"
                    accept=".png,.jpg,.jpeg"
                    required
                    onChange={handleFileSelected}
                    disabled={isPending}
                />
            </div>
            <div>
                <label>
                    <span>Image title: </span>
                    <input name="name" required />
                </label>
            </div>

            <div> 
                {imageUrl && (
                    <img style={{width: "20em", maxWidth: "100%"}} src={imageUrl} alt="Image Preview" />
                )}
            </div>

                <input type="submit" value={isPending ? "Uploading..." : "Confirm Upload"} disabled={isPending} />
                <div id="result-message" aria-live="polite">
                    {result?.message}
                </div>
        </form>
        </>
    );
}
