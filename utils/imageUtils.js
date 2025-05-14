// Image utility functions
import * as FileSystem from 'expo-file-system';
import * as ImageManipulator from 'expo-image-manipulator';

/**
 * Resizes an image to ensure it's not too large for uploading
 * @param {string} uri - The URI of the image to resize
 * @param {number} maxWidth - Maximum width of the image (default: 800)
 * @param {number} maxHeight - Maximum height of the image (default: 800)
 * @param {number} quality - JPEG quality from 0 to 1 (default: 0.7)
 * @returns {Promise<string>} - URI of the resized image
 */
export const resizeImageIfNeeded = async (uri, maxWidth = 800, maxHeight = 800, quality = 0.7) => {
  try {
    // Get the file info
    const fileInfo = await FileSystem.getInfoAsync(uri);
    
    if (!fileInfo.exists) {
      throw new Error('Image does not exist');
    }
    
    console.log('Original image size:', fileInfo.size, 'bytes');
    
    // If file is already small enough, return original
    if (fileInfo.size < 500 * 1024) { // Less than 500KB
      console.log('Image is already small enough, no resize needed');
      return uri;
    }
    
    // Resize the image
    const resizedImage = await ImageManipulator.manipulateAsync(
      uri,
      [{ resize: { width: maxWidth, height: maxHeight } }],
      { compress: quality, format: ImageManipulator.SaveFormat.JPEG }
    );
    
    console.log('Resized image size:', {
      width: resizedImage.width,
      height: resizedImage.height,
      uri: resizedImage.uri
    });
    
    return resizedImage.uri;
  } catch (error) {
    console.error('Error resizing image:', error);
    // Return original if resize fails
    return uri;
  }
};

/**
 * Gets the base64 representation of an image
 * @param {string} uri - The URI of the image
 * @returns {Promise<string>} - Base64 string of the image
 */
export const getBase64FromUri = async (uri) => {
  try {
    const base64 = await FileSystem.readAsStringAsync(uri, {
      encoding: FileSystem.EncodingType.Base64,
    });
    return base64;
  } catch (error) {
    console.error('Error getting base64 from URI:', error);
    throw error;
  }
};
