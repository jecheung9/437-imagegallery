import { ImageGrid } from "./ImageGrid.tsx";
import type { IApiImageData } from "../../../backend/src/shared/ApiImageData.ts";

interface IAllImagesProps {
    imageData: IApiImageData[];
    isLoading: boolean;
    hasError: boolean;
}

export function AllImages(props: IAllImagesProps) {
    if (props.isLoading) {
        return <p> Loading...</p>
    }
    
    if (props.hasError) {
        return <p> There was an error...</p>
    }
    return (
        <>
            <h2>All Images</h2>
            <ImageGrid images={props.imageData} />
        </>
    );
}
