import { ImageGrid } from "./ImageGrid.tsx";
import type { IApiImageData } from "../../../backend/src/shared/ApiImageData.ts";

interface IAllImagesProps {
    imageData: IApiImageData[];
    isLoading: boolean;
    hasError: boolean;
    searchPanel: React.ReactNode;
}

export function AllImages(props: IAllImagesProps) {
    return (
        <>
            <h2>All Images</h2>
            {props.searchPanel}

            {props.isLoading && <p>Loading...</p>}
            {props.hasError && <p>There was an error...</p>}
            {!props.isLoading && !props.hasError && (
                <ImageGrid images={props.imageData} />
            )}
        </>
    );
}