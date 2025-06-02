import { AllImages } from "./images/AllImages.tsx";
import { ImageDetails } from "./images/ImageDetails.tsx";
import { UploadPage } from "./UploadPage.tsx";
import { LoginPage } from "./LoginPage.tsx";
import { Routes, Route } from "react-router";
import { MainLayout } from "./MainLayout.tsx";
import { useState, useEffect, useRef } from "react";
import { ValidRoutes } from "../../backend/src/shared/ValidRoutes.ts"
import type { IApiImageData } from "../../backend/src/shared/ApiImageData.ts";
import { ImageSearchForm } from "./images/ImageSearchForm.tsx";

function App() {
    const [imageData, setImageData] = useState<IApiImageData[]>([])
    const [isLoading, setIsLoading] = useState(true);
    const [hasError, setHasError] = useState(false);
    const [searchContents, setSearchContents] = useState("");
    const recentRequestNumber = useRef(0);


    function fetchImages(search: string) {
        setIsLoading(true);
        setHasError(false);

        const requestNumber = ++recentRequestNumber.current
        
        const params = new URLSearchParams();
        if (search.trim() !== "") {
            params.append("name", search.trim())
        }

        const url = "api/images" + (params.toString() ? `/search?${params.toString()}` : "");
        fetch(url)
            .then((res) => {
                if (res.status >= 400) {
                    throw new Error("HTTP " + res.status);
                }
                return res.json();
            })
            .then((data) => {
                if (recentRequestNumber.current === requestNumber) {
                    setImageData(data);
                    setIsLoading(false);
                }
            }).catch(() => {
                if (recentRequestNumber.current === requestNumber) {
                    setHasError(true);
                    setIsLoading(false)
                }
            });
    }

    useEffect(() => {
        fetchImages("");
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

    function handleImageSearch() {
        fetchImages(searchContents);
    }

    const searchForm = (
        <ImageSearchForm
            searchString={searchContents}
            onSearchStringChange={setSearchContents}
            onSearchRequested={handleImageSearch}
        />
    );

    return (
        <Routes>
            <Route path={ValidRoutes.HOME} element={<MainLayout />}>
                <Route index element={<AllImages imageData={imageData} isLoading={isLoading} hasError={hasError} searchPanel={searchForm} />} />
                <Route path={ValidRoutes.UPLOAD} element={<UploadPage />} />
                <Route path={ValidRoutes.LOGIN} element={<LoginPage />} />
                <Route path={ValidRoutes.IMAGES} element={<ImageDetails imageData={imageData} isLoading={isLoading} hasError={hasError} changeName={changeName} />} />
            </Route>
        </Routes>
    )
}

export default App;
