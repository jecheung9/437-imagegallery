import { AllImages } from "./images/AllImages.tsx";
import { ImageDetails } from "./images/ImageDetails.tsx";
import { UploadPage } from "./UploadPage.tsx";
import { LoginPage } from "./LoginPage.tsx";
import { Routes, Route } from "react-router";
import { MainLayout } from "./MainLayout.tsx";
import { useState, useRef } from "react";
import { ValidRoutes } from "../../backend/src/shared/ValidRoutes.ts"
import type { IApiImageData } from "../../backend/src/shared/ApiImageData.ts";
import { ImageSearchForm } from "./images/ImageSearchForm.tsx";
import { ProtectedRoute } from "./ProtectedRoute.tsx";

function App() {
    const [imageData, setImageData] = useState<IApiImageData[]>([])
    const [isLoading, setIsLoading] = useState(true);
    const [hasError, setHasError] = useState(false);
    const [searchContents, setSearchContents] = useState("");
    const recentRequestNumber = useRef(0);
    const [authToken, setAuthToken] = useState("");


    function fetchImages(search: string, authToken: string) {
        setIsLoading(true);
        setHasError(false);

        const requestNumber = ++recentRequestNumber.current
        
        const params = new URLSearchParams();
        if (search.trim() !== "") {
            params.append("name", search.trim())
        }

        const url = "api/images" + (params.toString() ? `/search?${params.toString()}` : "");
        fetch(url, {
            headers: {
                Authorization: `Bearer ${authToken}`,
            }
        })
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
        fetchImages(searchContents, authToken);
    }

    function handleLogin(token: string) {
        setAuthToken(token);
        fetchImages("", token)
    }

    function handleUpload() {
        fetchImages(searchContents, authToken)
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
                <Route index element={
                    <ProtectedRoute authToken={authToken}>
                        <AllImages
                            imageData={imageData}
                            isLoading={isLoading}
                            hasError={hasError}
                            searchPanel={searchForm} />
                    </ProtectedRoute>} />
                <Route path={ValidRoutes.UPLOAD} element={
                    <ProtectedRoute authToken={authToken}>
                        <UploadPage
                            authToken={authToken}
                            onUpload={handleUpload} />
                    </ProtectedRoute>} />
                <Route path={ValidRoutes.LOGIN} element={
                    <LoginPage
                        isRegistering={false}
                        onLogin={handleLogin} />} />
                <Route path={ValidRoutes.REGISTER} element={
                    <LoginPage
                        isRegistering={true}
                        onLogin={handleLogin} />} />
                <Route path={ValidRoutes.IMAGES} element={
                    <ProtectedRoute authToken={authToken}>
                    <ImageDetails
                        imageData={imageData}
                        isLoading={isLoading}
                        hasError={hasError}
                        changeName={changeName}
                        authToken={authToken} />
                    </ProtectedRoute>} />
            </Route>
        </Routes>
    )
}

export default App;
