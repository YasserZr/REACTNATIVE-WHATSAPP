# Supabase Setup Guide for WhatsApp Clone

This guide explains how to set up Supabase for the WhatsApp Clone application, specifically focusing on storage for profile pictures.

## Prerequisites

- A Supabase account
- Your Supabase project URL and anon key (already configured in the app)

## Setting Up Storage for Profile Pictures

The app expects a specific storage bucket to be available in your Supabase project. You must set this up manually in the Supabase dashboard.

### Steps to Create the Profile Pictures Bucket

1. Log in to your Supabase dashboard: https://app.supabase.com/
2. Select your project
3. Click on "Storage" in the left sidebar
4. Click "Create a new bucket"
5. Enter the bucket name: `profile-pictures` (use exactly this name)
6. Configure the bucket:
   - Public access: Enabled (this allows profile pictures to be viewed without authentication)
   - File size limit: 5MB (recommended)

### Setting Up Storage Security Rules

To allow anonymous users to upload profile pictures, you need to configure the Row-Level Security (RLS) policies for your storage bucket.

1. After creating the bucket, go to the "Policies" tab
2. Click "Add policies" 
3. Choose "Create policies from scratch"

#### Policy for Viewing Images (GET)
Create a policy with these settings:
- Policy name: `Public Read Access`
- Allowed operations: `SELECT`
- Policy definition: `true` (allows anyone to view images)

#### Policy for Uploading Images (INSERT)
Create another policy with these settings:
- Policy name: `Authenticated Insert Access`
- Allowed operations: `INSERT`
- Policy definition: `true` (allows anyone to upload images)

#### Policy for Updating/Deleting Images (optional)
If you want to allow users to update or delete their own images:
- Policy name: `User Update/Delete Access`
- Allowed operations: `UPDATE`, `DELETE`
- Policy definition: `true` (allows anyone to update/delete for simplicity - in a production app, you should restrict this to the image owner)

## Troubleshooting

### "Profile pictures bucket not found"
- Verify that you've created the bucket with the exact name: `profile-pictures`
- Check that the Supabase URL and anon key in your app match your Supabase project

### "Failed to upload image: new row violates row-level security policy"
- Ensure you've set up the correct RLS policies as described above
- Check that you've enabled the policies for the correct operations (INSERT)

### "Not authenticated" message
- For this app, anonymous uploads are enabled through the RLS policies
- If you want to require authentication, you'll need to implement user login first

## Additional Resources

- [Supabase Storage Documentation](https://supabase.com/docs/guides/storage)
- [Supabase RLS Documentation](https://supabase.com/docs/guides/auth/row-level-security)
