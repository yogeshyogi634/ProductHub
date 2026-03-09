import { useState } from 'react';
import { imageToBase64 } from '../utils/imageToBase64';

export const useSignature = () => {
    const [signatureData, setSignatureData] = useState({
        fullName: '',
        designation: '',
        emailPrefix: '',
        phone: '+91 ',
        location: 'Indiqube South Island, Bengaluru',
        linkedinUrl: '',
        linkedinMessage: "Let's connect on LinkedIn",
        selectedBanner: 'default',
        showBanner: true,
        showPhone: true,
        showLinkedin: true,
        profilePhoto: '', // base64 string
    });

    const [isConvertingImage, setIsConvertingImage] = useState(false);
    const [imageError, setImageError] = useState('');

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setSignatureData((prev) => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value,
        }));
    };

    const handleImageUpload = async (e) => {
        const file = e.target.files?.[0];
        if (!file) {
            // Clear the image if the user cancels selection
            setSignatureData((prev) => ({ ...prev, profilePhoto: '' }));
            return;
        }

        if (!file.type.startsWith('image/')) {
            setImageError('Please upload a valid image file');
            return;
        }

        // Limit size to 2MB to avoid huge base64 strings in clipboard
        if (file.size > 2 * 1024 * 1024) {
            setImageError('Image must be less than 2MB');
            return;
        }

        setImageError('');
        setIsConvertingImage(true);

        try {
            const base64Str = await imageToBase64(file);
            setSignatureData((prev) => ({ ...prev, profilePhoto: base64Str }));
        } catch (error) {
            console.error('Error converting image:', error);
            setImageError('Failed to process image');
        } finally {
            setIsConvertingImage(false);
        }
    };

    const clearImage = () => {
        setSignatureData((prev) => ({ ...prev, profilePhoto: '' }));
        setImageError('');
    };

    const loadSignature = (data) => {
        setSignatureData(data);
    };

    return {
        signatureData,
        isConvertingImage,
        imageError,
        handleChange,
        handleImageUpload,
        clearImage,
        loadSignature,
    };
};
