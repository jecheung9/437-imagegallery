import { AllImages } from "./images/AllImages.tsx";
import { ImageDetails } from "./images/ImageDetails.tsx";
import { UploadPage } from "./UploadPage.tsx";
import { LoginPage } from "./LoginPage.tsx";
import { Routes, Route } from "react-router";
import { MainLayout } from "./MainLayout.tsx";
import { useState, useEffect } from "react";
import { ValidRoutes } from "../../backend/src/shared/ValidRoutes.ts"
import type { IApiImageData } from "../../backend/src/shared/ApiImageData.ts";

function App() {
    const [imageData, setImageData] = useState<IApiImageData[]>([])
    const [isLoading, setIsLoading] = useState(true);
    const [hasError, setHasError] = useState(false);

    useEffect(() => {
        setIsLoading(true);
        setHasError(false);
        fetch("/api/images")
            .then((res) => {
                if (res.status >= 400) {
                    throw new Error("HTTP " + res.status);
                }
                return res.json();
            })
            .then((data) => {
                setImageData(data);
                setIsLoading(false);
            }).catch(() => {
                setHasError(true);
                setIsLoading(false);

            });
    }, []);

    function changeName(id: string, newName: string) {
        const updatedImages = imageData.map((image) => {
            if (image.id === id) {
                return { ...image, name: newName };
            }
            return image;
        });
        setImageData(updatedImages);
    }

    return (
        <Routes>
            <Route path={ValidRoutes.HOME} element={<MainLayout />}>
                <Route index element={<AllImages imageData={imageData} isLoading={isLoading} hasError={hasError} />} />
                <Route path={ValidRoutes.UPLOAD} element={<UploadPage />} />
                <Route path={ValidRoutes.LOGIN} element={<LoginPage />} />
                <Route path={ValidRoutes.IMAGES} element={<ImageDetails imageData={imageData} isLoading={isLoading} hasError={hasError} changeName={changeName} />} />
            </Route>
        </Routes>
    )
}

export default App;
