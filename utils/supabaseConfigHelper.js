import { Alert, Linking } from 'react-native';
import { supabase } from '../config/supabase';

/**
 * Shows steps to configure Supabase for the app
 */
export const showSupabaseConfigGuide = () => {
  Alert.alert(
    'Supabase Storage Setup',
    'The WhatsApp clone app requires a properly configured Supabase storage bucket. Would you like to view setup instructions?',
    [
      {
        text: 'Cancel',
        style: 'cancel'
      },
      {
        text: 'Show Instructions',
        onPress: () => {
          Alert.alert(
            'Supabase Setup Instructions',
            '1. Log in to Supabase dashboard\n\n' +
            '2. Go to Storage in the left sidebar\n\n' +
            '3. Create a bucket named "profile-pictures"\n\n' +
            '4. Add RLS policies to allow uploads\n\n' +
            'See README_SUPABASE_STORAGE.md for details.',
            [
              {
                text: 'OK'
              },
              {
                text: 'Open Supabase Dashboard',
                onPress: () => Linking.openURL('https://app.supabase.com')
              }
            ]
          );
        }
      }
    ]
  );
};

/**
 * Verifies if Supabase is properly configured for the app
 * @returns {Promise<{success: boolean, message: string}>}
 */
export const verifySupabaseConfig = async () => {
  try {
    // Step 1: Check if we can connect to Supabase
    console.log('Verifying Supabase configuration...');
    console.log('Supabase URL:', supabase.supabaseUrl);
    
    // Step 2: Try to access Storage API
    const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets();
    
    if (bucketsError) {
      console.error('Storage access error:', bucketsError);
      return {
        success: false,
        message: `Storage access error: ${bucketsError.message}`,
        error: bucketsError
      };
    }
    
    // Step 3: Check if the required bucket exists
    const profileBucket = buckets.find(bucket => bucket.name === 'profile-pictures');
    
    if (!profileBucket) {
      console.log('Required bucket not found. Available buckets:', buckets.map(b => b.name).join(', '));
      return {
        success: false,
        message: 'The "profile-pictures" bucket does not exist in your Supabase project.'
      };
    }
    
    // Step 4: Try to list files in the bucket to check permissions
    const { data: files, error: listError } = await supabase.storage
      .from('profile-pictures')
      .list('');
      
    if (listError) {
      console.error('Error listing files:', listError);
      return {
        success: false,
        message: `Cannot list files in bucket: ${listError.message}`,
        error: listError
      };
    }
    
    return {
      success: true,
      message: 'Supabase storage is properly configured.',
      buckets,
      files
    };
    
  } catch (error) {
    console.error('Error verifying Supabase config:', error);
    return {
      success: false,
      message: `Verification failed: ${error.message}`,
      error
    };
  }
};
