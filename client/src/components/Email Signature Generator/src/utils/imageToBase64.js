/**
 * Reads a File object and converts it to a base64 encoded data URI.
 * @param {File} file - The image file to convert
 * @returns {Promise<string>} - Resolves with the base64 string
 */
export const imageToBase64 = (file) => {
    return new Promise((resolve, reject) => {
        if (!file) {
            reject(new Error("No file provided"));
            return;
        }

        const reader = new FileReader();

        reader.onload = (e) => {
            const img = new Image();
            img.onload = () => {
                const canvas = document.createElement("canvas");
                const size = Math.min(img.width, img.height);
                canvas.width = size;
                canvas.height = size;

                const ctx = canvas.getContext("2d");

                // Draw circular mask
                ctx.beginPath();
                ctx.arc(size / 2, size / 2, size / 2, 0, Math.PI * 2);
                ctx.closePath();
                ctx.clip();

                // Center crop
                const xOffset = (img.width - size) / 2;
                const yOffset = (img.height - size) / 2;
                ctx.drawImage(img, xOffset, yOffset, size, size, 0, 0, size, size);

                resolve(canvas.toDataURL("image/png"));
            };

            img.onerror = (err) => reject(err);
            img.src = e.target.result;
        };

        reader.onerror = (error) => {
            reject(error);
        };

        reader.readAsDataURL(file);
    });
};
