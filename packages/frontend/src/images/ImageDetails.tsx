import { useParams } from "react-router";
import type { IApiImageData } from "../../../backend/src/shared/ApiImageData.ts";
import { ImageNameEditor } from "../ImageNameEditor.tsx";

interface IImageDetails {
    imageData: IApiImageData[];
    isLoading: boolean;
    hasError: boolean;
    changeName: (id: string, newName: string) => void; 
}

export function ImageDetails(props: IImageDetails) {
    const { imageId } = useParams();

    if (props.isLoading) {
        return <p> Loading...</p>
    }
    
    if (props.hasError) {
        return <p> There was an error...</p>
    }

    const image = props.imageData.find(image => image.id === imageId);
    if (!image) {
        return <h2>Image not found</h2>;
    }

    return (
        <>
            <h2>{image.name}</h2>
            <p>By {image.author.username}</p>
            <ImageNameEditor initialValue={image.name} imageId={image.id} changeName={props.changeName} />
            <img className="ImageDetails-img" src={image.src} alt={image.name} />
        </>
    )
}
