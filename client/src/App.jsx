"use client";

import { Navbar } from "./components/layout/Navbar";
import { ProductUpdates } from "./components/layout/ProductUpdates";
import { FeedbackWall } from "./components/layout/FeedbackWall";
import { NewUpdateModal } from "./components/features/NewUpdateModal";
import { StoreProvider, useStore } from "./lib/store";

function HomeContent() {
    const { activeProduct } = useStore();
    const isCompany = activeProduct === "Neokred";

    return (
        <div className="flex flex-col h-screen w-full overflow-hidden bg-background-app font-sans">
            <Navbar />
            <div className="flex flex-1 w-full overflow-hidden">
                {!isCompany && <ProductUpdates />}
                <FeedbackWall />
            </div>
            {!isCompany && <NewUpdateModal />}
        </div>
    );
}

function App() {
    return (
        <div className="antialiased font-sans bg-background-app text-text-default-primary">
            <StoreProvider>
                <HomeContent />
            </StoreProvider>
        </div>
    );
}

export default App;