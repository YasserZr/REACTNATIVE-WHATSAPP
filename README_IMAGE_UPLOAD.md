# Profile Image Upload Guide

This document provides information about the profile image upload functionality in the WhatsApp clone app, including troubleshooting steps for common issues.

## How Image Upload Works

The app uses Supabase Storage for storing user profile images. Here's the flow:

1. User taps the profile image to select a new one
2. App checks network connectivity
3. App checks access to Supabase storage bucket
4. User selects an image from device gallery
5. Image is resized if necessary (to max 800x800px)
6. Image is converted to base64 format
7. Base64 data is converted to an array buffer
8. Image is uploaded to Supabase storage with retry mechanism
9. Public URL is generated for the uploaded image
10. URL is saved to Firebase user profile data

## Supported Image Formats

The following image formats are supported:
- JPEG/JPG (recommended)
- PNG
- GIF
- WebP

For optimal performance, JPEG format is recommended due to its smaller file size.

## Troubleshooting Image Upload Issues

### "Failed to upload image" Error

If you see this error, try these steps:

1. **Check Internet Connection**
   - Make sure you have a stable internet connection
   - Try switching from WiFi to mobile data or vice versa

2. **Image Too Large**
   - Try selecting a smaller image
   - The app attempts to resize large images, but some very large files might still fail

3. **Image Format Issues**
   - Try uploading a JPEG format image instead of PNG or other formats
   - Some image types might not be properly recognized

4. **Bucket Permissions**
   - Tap the "Test Storage Connection" button in Settings to check if the app can access Supabase storage
   - If the test fails, it might indicate an issue with your Supabase configuration

5. **Clear App Cache**
   - Go to phone settings > Apps > [App Name] > Storage > Clear Cache
   - Restart the app and try again

### Image Shows in Settings but Not in Chat

If your profile image appears in the Settings screen but not in chat messages:

1. Make sure you've completely exited and restarted the app
2. Check that the image URL was properly saved to Firebase by signing out and back in
3. Verify that other users can see your profile image

## Technical Details for Developers

The image upload process includes several optimizations:

1. **Image Resizing**: Large images are automatically resized to 800x800px max dimensions
2. **Quality Compression**: JPEG quality is set to 70% to reduce file size
3. **Retry Mechanism**: Failed uploads are automatically retried up to 3 times
4. **Network Checks**: App validates network connectivity before attempting uploads
5. **Bucket Validation**: App checks for bucket existence and access before upload

For more technical details, see:
- `utils/imageUtils.js` - Contains image processing functions
- `utils/networkUtils.js` - Network connectivity checking
- `utils/supabaseUtils.js` - Supabase connection testing
