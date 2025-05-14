// Supabase debugging utility
import { Alert } from 'react-native';
import { supabase } from '../config/supabase';

/**
 * Test the Supabase connection and storage access
 * @returns {Promise<{success: boolean, message: string}>} - Result of the test
 */
export const testSupabaseConnection = async () => {  try {
    // Test 1: Basic connection
    console.log('Testing Supabase connection...');
    let connectionResult;
    try {
      // Using a try/catch block instead of .catch() method
      connectionResult = await supabase.from('_dummy_query').select('*').limit(1);
      console.log('Connection test response:', connectionResult);
    } catch (queryError) {
      console.log('Expected query error (dummy table):', queryError);
      // This is expected to fail, but the important part is that Supabase responded
    }
      // Connection errors are expected since the table doesn't exist
    // We're just checking that the service responds
    console.log('Connection test complete');
    
    // Print Supabase URL for debugging
    console.log('Supabase URL:', supabase.supabaseUrl);
    
    // Test 2: Auth status
    console.log('Testing auth status...');
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError) {
      console.error('Session error:', sessionError);
    } else {
      console.log('Session status:', session ? 'Authenticated' : 'Not authenticated');
    }
      // Test 3: Storage access
    console.log('Testing storage access...');
    let buckets = [];
    let bucketsError = null;
    
    try {
      const bucketsResult = await supabase.storage.listBuckets();
      buckets = bucketsResult.data || [];
      bucketsError = bucketsResult.error;
      
      if (bucketsError) {
        console.error('Storage access error:', bucketsError);
        return { success: false, message: `Storage access error: ${bucketsError.message || 'Unknown error'}` };
      }
      
      const bucketNames = buckets.map(b => b.name).join(', ');
      console.log('Available buckets:', bucketNames || 'None');
      
      // Test 4: Check profile-pictures bucket
      const profileBucket = buckets.find(bucket => bucket.name === 'profile-pictures');
      
      if (!profileBucket) {
        return { 
          success: false, 
          message: `Profile pictures bucket not found! Available buckets: ${bucketNames || 'None'}`
        };
      }
      
      // Test 5: Try to list files in the bucket
      const filesResult = await supabase.storage
        .from('profile-pictures')
        .list();
        
      if (filesResult.error) {
        return { 
          success: false, 
          message: `Error listing files in bucket: ${filesResult.error.message || 'Unknown error'}` 
        };
      }
      
      const files = filesResult.data || [];
    } catch (storageError) {
      console.error('Unexpected storage access error:', storageError);
      return { 
        success: false, 
        message: `Storage access failed: ${storageError.message || 'Unknown error'}` 
      };
    }
      const filesCount = (files && files.length) ? files.length : 0;
    return { 
      success: true, 
      message: `Supabase connection successful. Storage access confirmed. Found ${filesCount} files in profile-pictures bucket.` 
    };
    
  } catch (error) {
    console.error('Supabase test error:', error);
    return { 
      success: false, 
      message: `Test failed with error: ${error.toString()}` 
    };
  }
};

/**
 * Run and display Supabase connection test
 */
export const runSupabaseTest = async () => {
  try {
    const result = await testSupabaseConnection();
    Alert.alert(
      result.success ? 'Connection Success' : 'Connection Issue',
      result.message
    );
    return result;
  } catch (error) {
    Alert.alert('Test Error', `Failed to run test: ${error.message}`);
    return { success: false, message: error.message };
  }
};
