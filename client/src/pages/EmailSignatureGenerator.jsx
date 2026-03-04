import { FormPanel } from "../components/Email Signature Generator/src/components/FormPanel";
import { PreviewPanel } from "../components/Email Signature Generator/src/components/PreviewPanel";
import { useSignature } from "../components/Email Signature Generator/src/hooks/useSignature";

export default function EmailSignatureGenerator() {
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
    <div className="min-h-screen bg-gray-50 flex flex-col lg:flex-row font-sans">
      <div className="w-full lg:w-[480px] xl:w-[520px] 2xl:w-[580px] shrink-0 h-screen overflow-hidden border-r border-gray-200 bg-white">
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
      <div className="flex-1 min-h-screen overflow-y-auto bg-gray-50">
        <PreviewPanel data={signatureData} />
      </div>
    </div>
  );
}
