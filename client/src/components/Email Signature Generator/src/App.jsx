import React from 'react';
import { useSignature } from './hooks/useSignature';
import { FormPanel } from './components/FormPanel';
import { PreviewPanel } from './components/PreviewPanel';

function App() {
  const {
    signatureData,
    isConvertingImage,
    imageError,
    handleChange,
    handleImageUpload,
    clearImage,
    loadSignature,
  } = useSignature();

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col lg:flex-row font-sans overflow-hidden">
      <div className="w-full lg:w-[450px] xl:w-[500px] shrink-0 h-screen lg:h-screen lg:sticky top-0 z-10 shadow-[4px_0_24px_rgba(0,0,0,0.02)]">
        <FormPanel
          data={signatureData}
          handleChange={handleChange}
          handleImageUpload={handleImageUpload}
          isConvertingImage={isConvertingImage}
          imageError={imageError}
          clearImage={clearImage}
          loadSignature={loadSignature}
        />
      </div>
      <div className="flex-1 h-auto lg:h-screen overflow-y-auto">
        <PreviewPanel data={signatureData} />
      </div>
    </div>
  );
}

export default App;
