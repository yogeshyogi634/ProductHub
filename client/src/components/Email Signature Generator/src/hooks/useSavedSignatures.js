import { useState, useEffect } from 'react';

export const useSavedSignatures = () => {
    const [savedSignatures, setSavedSignatures] = useState([]);

    // Load from localStorage on mount
    useEffect(() => {
        const stored = localStorage.getItem('neokred_signatures');
        if (stored) {
            try {
                setSavedSignatures(JSON.parse(stored));
            } catch (e) {
                console.error("Failed to parse saved signatures", e);
            }
        }
    }, []);

    // Save to localStorage whenever it changes
    const saveToLocalStorage = (signatures) => {
        setSavedSignatures(signatures);
        localStorage.setItem('neokred_signatures', JSON.stringify(signatures));
    };

    const saveSignature = (name, signatureData) => {
        const newSignature = {
            id: Date.now().toString(),
            name,
            data: signatureData,
            createdAt: new Date().toISOString()
        };
        const updated = [...savedSignatures, newSignature];
        saveToLocalStorage(updated);
        return newSignature;
    };

    const updateSignature = (id, name, signatureData) => {
        const updated = savedSignatures.map(sig =>
            sig.id === id ? { ...sig, name, data: signatureData } : sig
        );
        saveToLocalStorage(updated);
    };

    const deleteSignature = (id) => {
        const updated = savedSignatures.filter(sig => sig.id !== id);
        saveToLocalStorage(updated);
    };

    const duplicateSignature = (id) => {
        const signatureToDuplicate = savedSignatures.find(sig => sig.id === id);
        if (signatureToDuplicate) {
            const newSignature = {
                ...signatureToDuplicate,
                id: Date.now().toString(),
                name: `${signatureToDuplicate.name} (Copy)`,
                createdAt: new Date().toISOString()
            };
            const updated = [...savedSignatures, newSignature];
            saveToLocalStorage(updated);
            return newSignature;
        }
    };

    return {
        savedSignatures,
        saveSignature,
        updateSignature,
        deleteSignature,
        duplicateSignature
    };
};
