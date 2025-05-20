import { AllImages } from "./images/AllImages.tsx";
import { ImageDetails } from "./images/ImageDetails.tsx";
import { UploadPage } from "./UploadPage.tsx";
import { LoginPage } from "./LoginPage.tsx";
import { Routes, Route } from "react-router";
import { MainLayout } from "./MainLayout.tsx";
import { useState } from "react";
import { fetchDataFromServer } from "./MockAppData.ts";
import { ValidRoutes } from "../../backend/src/shared/ValidRoutes.ts"

function App() {
    const [imageData] = useState(fetchDataFromServer)
    return (
        <Routes>
            <Route path={ValidRoutes.HOME} element={<MainLayout />}>
                <Route index element={<AllImages imageData={imageData}/>} />
                <Route path={ValidRoutes.UPLOAD} element={<UploadPage />} />
                <Route path={ValidRoutes.LOGIN} element={<LoginPage />} />
                <Route path={ValidRoutes.IMAGES} element={<ImageDetails imageData={imageData}/>} />
            </Route>
        </Routes>
    )
}

export default App;
