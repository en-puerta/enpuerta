import { Injectable } from '@angular/core';
import { Storage, ref, uploadBytesResumable, getDownloadURL, deleteObject } from '@angular/fire/storage';
import imageCompression from 'browser-image-compression';

@Injectable({
    providedIn: 'root'
})
export class ImageService {

    constructor(private storage: Storage) { }

    /**
     * Compress an image file
     * @param file Original image file
     * @returns Compressed image file
     */
    async compressImage(file: File): Promise<File> {
        const options = {
            maxSizeMB: 0.5,           // Target 500KB
            maxWidthOrHeight: 1200,   // Max dimension
            useWebWorker: true,       // Use web worker for better performance
            fileType: 'image/jpeg',   // Convert to JPEG
            initialQuality: 0.8       // 80% quality
        };

        try {
            console.log('Original file size:', (file.size / 1024 / 1024).toFixed(2), 'MB');
            const compressedFile = await imageCompression(file, options);
            console.log('Compressed file size:', (compressedFile.size / 1024 / 1024).toFixed(2), 'MB');
            return compressedFile;
        } catch (error) {
            console.error('Error compressing image:', error);
            throw new Error('Error al comprimir la imagen');
        }
    }

    /**
     * Upload event image to Firebase Storage
     * @param file Image file (will be compressed)
     * @param eventId Event ID
     * @param onProgress Optional progress callback
     * @returns Download URL of uploaded image
     */
    async uploadEventImage(
        file: File,
        eventId: string,
        onProgress?: (progress: number) => void
    ): Promise<string> {
        try {
            // Compress image first
            const compressedFile = await this.compressImage(file);

            // Generate unique filename
            const timestamp = Date.now();
            const filename = `image_${timestamp}.jpg`;
            const filePath = `events/${eventId}/${filename}`;

            // Create storage reference
            const storageRef = ref(this.storage, filePath);

            // Upload file with progress tracking
            const uploadTask = uploadBytesResumable(storageRef, compressedFile);

            return new Promise((resolve, reject) => {
                uploadTask.on(
                    'state_changed',
                    (snapshot) => {
                        // Progress callback
                        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                        if (onProgress) {
                            onProgress(progress);
                        }
                    },
                    (error) => {
                        // Error callback
                        console.error('Upload error:', error);
                        reject(new Error('Error al subir la imagen'));
                    },
                    async () => {
                        // Success callback
                        try {
                            const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
                            console.log('Image uploaded successfully:', downloadURL);
                            resolve(downloadURL);
                        } catch (error) {
                            reject(new Error('Error al obtener URL de la imagen'));
                        }
                    }
                );
            });
        } catch (error) {
            console.error('Error in uploadEventImage:', error);
            throw error;
        }
    }

    /**
     * Delete an image from Firebase Storage
     * @param imageUrl Full download URL of the image
     */
    async deleteEventImage(imageUrl: string): Promise<void> {
        try {
            // Extract path from URL
            // URL format: https://firebasestorage.googleapis.com/v0/b/{bucket}/o/{path}?alt=media&token={token}
            const pathMatch = imageUrl.match(/\/o\/(.+?)\?/);
            if (!pathMatch) {
                console.warn('Could not extract path from URL:', imageUrl);
                return;
            }

            const encodedPath = pathMatch[1];
            const path = decodeURIComponent(encodedPath);

            const storageRef = ref(this.storage, path);
            await deleteObject(storageRef);
            console.log('Image deleted successfully:', path);
        } catch (error) {
            console.error('Error deleting image:', error);
            // Don't throw error - deletion failure shouldn't block other operations
        }
    }

    /**
     * Validate image file
     * @param file File to validate
     * @returns true if valid, error message if invalid
     */
    validateImage(file: File): { valid: boolean; error?: string } {
        // Check file type
        const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
        if (!validTypes.includes(file.type)) {
            return {
                valid: false,
                error: 'Formato no válido. Solo se permiten JPG, PNG o WebP.'
            };
        }

        // Check file size (max 5MB before compression)
        const maxSize = 5 * 1024 * 1024; // 5MB
        if (file.size > maxSize) {
            return {
                valid: false,
                error: 'La imagen es muy grande. Máximo 5MB.'
            };
        }

        return { valid: true };
    }
}
