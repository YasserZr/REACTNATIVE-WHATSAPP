# WhatsApp Clone with Supabase Storage

This React Native application uses Supabase for storing and managing user profile pictures.

## Setting Up Supabase

To set up Supabase for this project, follow these steps:

1. Create a Supabase account at [https://supabase.com/](https://supabase.com/)

2. Create a new Supabase project

3. After your project is created, navigate to the Storage section in the Supabase dashboard

4. Create a new bucket named `profile-pictures`

5. Set up bucket permissions:
   - For anonymous users: Allow read access (so profile pictures can be seen by all users)
   - For authenticated users: Allow read/write access to their own folder

6. Go to your project settings and copy the following:
   - Project URL
   - Project API key (anon/public)

7. Update the `config/supabase.js` file in this project with your credentials:
   ```javascript
   const supabaseUrl = 'https://YOUR_SUPABASE_URL.supabase.co';
   const supabaseAnonKey = 'YOUR_SUPABASE_ANON_KEY';
   ```

## Image Storage Structure

Images are stored in Supabase using the following structure:
- Bucket: `profile-pictures`
- File path: `{userId}/{uuid}.{extension}`

This ensures each user's images are stored in their own folder and have unique filenames.

## Configuration Options

You can modify the following settings in the code:

- Image quality: Currently set to 0.8 (in `pickImage` function in `Settings.js`)
- Image aspect ratio: Currently set to [1, 1] for square images
- Image editing: Users can crop/edit the image before upload (enabled through `allowsEditing: true`)

## Using in Production

For a production environment:
- Store your Supabase credentials in environment variables
- Implement more robust error handling
- Add image caching for better performance
- Consider adding image compression before upload
