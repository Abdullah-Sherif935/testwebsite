/**
 * Compresses an image file using Canvas.
 * @param file The original image file
 * @param maxWidth Max width for the compressed image
 * @param quality Quality from 0 to 1
 * @returns A promise that resolves to the compressed Blob
 */
export async function compressImage(file: File, maxWidth: number = 1920, quality: number = 0.8): Promise<Blob> {
    return new Promise((resolve, reject) => {
        const image = new Image();
        image.src = URL.createObjectURL(file);
        image.onload = () => {
            URL.revokeObjectURL(image.src);

            let width = image.width;
            let height = image.height;

            if (width > maxWidth) {
                height = (maxWidth / width) * height;
                width = maxWidth;
            }

            const canvas = document.createElement('canvas');
            canvas.width = width;
            canvas.height = height;

            const ctx = canvas.getContext('2d');
            if (!ctx) {
                reject(new Error('Canvas context not available'));
                return;
            }

            ctx.drawImage(image, 0, 0, width, height);

            canvas.toBlob(
                (blob) => {
                    if (blob) {
                        resolve(blob);
                    } else {
                        reject(new Error('Canvas toBlob failed'));
                    }
                },
                'image/jpeg',
                quality
            );
        };
        image.onerror = (err) => {
            reject(err);
        };
    });
}
