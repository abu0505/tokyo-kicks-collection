import imageCompression from 'browser-image-compression';

/**
 * Compresses an image file to a target size (default < 100KB) and converts to WebP.
 * @param file The original image file
 * @returns Promise resolving to the compressed File
 */
export async function compressImage(file: File): Promise<File> {
    const options = {
        maxSizeMB: 0.1, // Target 100KB
        maxWidthOrHeight: 1920, // Reasonable max dimension
        useWebWorker: true,
        fileType: 'image/webp',
        initialQuality: 0.8, // Good starting point
    };

    try {
        console.log(`Original size: ${(file.size / 1024 / 1024).toFixed(2)} MB`);
        const compressedFile = await imageCompression(file, options);
        console.log(`Compressed size: ${(compressedFile.size / 1024 / 1024).toFixed(2)} MB`);
        return compressedFile;
    } catch (error) {
        console.warn('Image compression failed, falling back to original file:', error);
        return file;
    }
}
