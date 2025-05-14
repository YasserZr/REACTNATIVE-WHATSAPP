import React, { useState, useEffect } from "react";
import {
  Button,
  Image,
  StyleSheet,
  Text,
  TextInput,
  View,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  ScrollView
} from "react-native";
import { MaterialCommunityIcons } from 'react-native-vector-icons';
import firebase from "../../config/index";
import { supabase } from "../../config/supabase";
import * as ImagePicker from 'expo-image-picker';
import { decode } from 'base64-arraybuffer';
import { v4 as uuidv4 } from 'uuid';
import * as FileSystem from 'expo-file-system';
import { resizeImageIfNeeded, getBase64FromUri } from "../../utils/imageUtils";
import { runSupabaseTest } from "../../utils/supabaseUtils";
import { ensureNetworkConnection } from "../../utils/networkUtils";
import { showSupabaseConfigGuide } from "../../utils/supabaseConfigHelper";
import { refreshUserData, useUserData } from "../../utils/userDataListener";

const auth = firebase.auth();
const database = firebase.database();
const ref_database = database.ref();
const ref_listcomptes=ref_database.child("ListComptes");

export default function Setting(props) {
  const currentUserId = props.route.params.currentUserId; // Get the current user ID from route params
  const [pseudo, setPseudo] = useState("");
  const [numero, setNumero] = useState();
  const [uploading, setUploading] = useState(false);
  const [profileImage, setProfileImage] = useState(null);
  
  // Fetch user data on component mount
  useEffect(() => {
    if (currentUserId) {
      fetchUserData();
    }
  }, [currentUserId]);
  
  // Function to fetch user data from Firebase
  const fetchUserData = async () => {
    try {
      const userSnapshot = await ref_listcomptes.child(currentUserId).once('value');
      const userData = userSnapshot.val();
      
      if (userData) {
        setPseudo(userData.pseudo || "");
        setNumero(userData.numero || "");
        if (userData.profileImageUrl) {
          setProfileImage(userData.profileImageUrl);
        }
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
      Alert.alert('Error', 'Failed to load your profile data.');
    }
  };

  // Check if bucket exists and is accessible
  const checkBucketAccess = async () => {
    try {
      console.log('Checking Supabase bucket access...');
      
      // Skip bucket listing and creation since we don't have permissions
      // Instead, assume the bucket exists and try to access it directly
      console.log('Trying direct access to profile-pictures bucket...');
      
      try {
        // Try to list objects in the bucket to check access permissions
        const { data: files, error: filesError } = await supabase.storage
          .from('profile-pictures')
          .list('', { limit: 1 }); // Just try to list one file to check access
            
        if (!filesError) {
          console.log('Successfully accessed profile-pictures bucket');
          return true;
        } else {
          console.error('Error accessing profile-pictures bucket:', filesError);
          
          // If the error is about the bucket not existing, we need to inform the user
          if (filesError.message && (
              filesError.message.includes('does not exist') || 
              filesError.message.includes('not found')
            )) {
            Alert.alert(
              'Storage Setup Required',
              'The storage bucket for profile pictures has not been set up in Supabase. Please contact the administrator to set up a "profile-pictures" bucket.',
              [{ text: 'OK' }]
            );
          }
          return false;
        }
      } catch (accessError) {
        console.error('Direct bucket access failed:', accessError);
        return false;
      }
    } catch (error) {
      console.error('Error checking bucket access:', error);
      return false;
    }
  };// Function to pick an image from the device
  const pickImage = async () => {
    try {
      // First check network connectivity
      const isConnected = await ensureNetworkConnection();
      if (!isConnected) {
        return; // ensureNetworkConnection already shows an alert
      }
      
      // Check bucket access next
      const hasBucketAccess = await checkBucketAccess();
      
      if (!hasBucketAccess) {
        Alert.alert('Storage Error', 'Unable to access storage for profile pictures. Please check your network connection and try again.');
        return;
      }
      
      // Request permission
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (permissionResult.granted === false) {
        Alert.alert('Permission required', 'You need to allow access to your photos to upload an image.');
        return;
      }
      
      // Launch image picker
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.7, // Slightly reduced quality to ensure smaller file size
        base64: true,
        exif: false, // Don't include EXIF data to reduce file size
      });
      
      if (!result.canceled && result.assets && result.assets[0]) {
        const selectedImage = result.assets[0];
        console.log('Selected image info:', {
          uri: selectedImage.uri,
          fileSize: selectedImage.fileSize,
          type: selectedImage.type,
          width: selectedImage.width,
          height: selectedImage.height,
        });
        
        // Upload the image
        await uploadImage(selectedImage);
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'Failed to pick image.');
    }
  };
    // Function to upload an image to Supabase storage
  const uploadImage = async (imageData) => {
    try {
      setUploading(true);
      
      if (!imageData.uri) {
        throw new Error('No image URI available');
      }
      
      // First resize the image if needed
      console.log('Resizing image if needed...');
      const resizedImageUri = await resizeImageIfNeeded(imageData.uri);
      
      // Get base64 data from the resized image
      console.log('Getting base64 from resized image...');
      const base64Data = await getBase64FromUri(resizedImageUri);
      
      if (!base64Data) {
        throw new Error('Failed to get base64 data from image');
      }
        // Determine file extension from original URI or default to jpg
      let fileExt = imageData.uri.split('.').pop().toLowerCase();
      
      // Check if it's a valid image extension
      const validExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp'];
      if (!validExtensions.includes(fileExt)) {
        console.log(`Invalid or unusual extension: ${fileExt}, defaulting to jpg`);
        fileExt = 'jpeg';
      }
      
      // Create unique file name
      const fileName = `${uuidv4()}.${fileExt}`;
      const filePath = `${currentUserId}/${fileName}`;
      
      // Determine MIME type
      let contentType = 'image/jpeg'; // Default
      if (fileExt === 'png') contentType = 'image/png';
      else if (fileExt === 'gif') contentType = 'image/gif';
      else if (fileExt === 'webp') contentType = 'image/webp';
      
      console.log('Preparing to upload image:', {
        filePath,
        contentType,
        base64Length: base64Data.length,
        originalExtension: imageData.uri.split('.').pop()
      });
      
      // Convert base64 to array buffer for upload
      const arrayBuffer = decode(base64Data);
      
      console.log('Array buffer created with size:', arrayBuffer.byteLength);
      
      // Extra check to ensure proper data format
      if (arrayBuffer.byteLength === 0) {
        throw new Error('Empty array buffer - image conversion failed');
      }
        // Upload to Supabase storage with retry mechanism
      let uploadAttempt = 0;
      let uploadResult = null;
      
      while (uploadAttempt < 3 && !uploadResult) {
        uploadAttempt++;
        console.log(`Upload attempt ${uploadAttempt}...`);
        
        const { data, error } = await supabase.storage
          .from('profile-pictures')
          .upload(filePath, arrayBuffer, {
            contentType,
            upsert: true,
          });
            if (error) {
        const errorDetails = {
          message: error.message,
          statusCode: error.statusCode,
          details: error.details,
          attempt: uploadAttempt
        };
        console.error(`Attempt ${uploadAttempt} failed:`, errorDetails);
          // Additional debugging for specific error types
        if (error.statusCode === 413) {
          console.error('File too large for upload');
        } else if (error.statusCode === 403) {
          console.error('Permission denied - check bucket permissions');
        } else if (error.message && error.message.includes('network')) {
          console.error('Network error detected');
        } else if (error.message && error.message.includes('security policy')) {
          console.error('Row-level security policy violation');
          
          // This is a more serious issue that requires admin intervention
          Alert.alert(
            'Storage Permission Error',
            'Your Supabase project requires proper storage policies. Please see README_SUPABASE_STORAGE.md for setup instructions.',
            [{ text: 'OK' }]
          );
          
          // No point retrying this - it will fail again
          return; // Exit the upload function
        }
        
        if (uploadAttempt >= 3) {
          throw new Error(`Upload failed after ${uploadAttempt} attempts: ${error.message || 'Unknown error'}`);
        }
        
        // Wait longer between retries (increasing backoff)
        await new Promise(resolve => setTimeout(resolve, 1000 * uploadAttempt));
      } else {
        uploadResult = data;
        break;
      }
      }
      
      if (!uploadResult) {
        throw new Error('Upload failed after multiple attempts');
      }
      
      console.log('Upload successful, data:', uploadResult);
      
      // Get public URL
      const { data: urlData } = supabase.storage
        .from('profile-pictures')
        .getPublicUrl(filePath);
      
      const publicUrl = urlData.publicUrl;
      console.log('Public URL generated:', publicUrl);
      
      // Update state with the new image URL
      setProfileImage(publicUrl);
      
      // Also update in Firebase
      await updateProfileImageInFirebase(publicUrl);
        Alert.alert('Success', 'Profile picture updated successfully!');
    } catch (error) {
      console.error('Error uploading image:', error);
      
      // Create more user-friendly error messages based on error type
      let userMessage = 'Failed to upload image. Please try again.';
      const errorMsg = error.message ? error.message.toLowerCase() : '';
      
      if (errorMsg.includes('network') || errorMsg.includes('connection')) {
        userMessage = 'Network connection issue. Please check your internet and try again.';
      } else if (errorMsg.includes('permission') || errorMsg.includes('denied') || errorMsg.includes('403')) {
        userMessage = 'Permission error. Please contact support or try again later.';
      } else if (errorMsg.includes('large') || errorMsg.includes('size') || errorMsg.includes('413')) {
        userMessage = 'Image file is too large. Please select a smaller image.';
      } else if (errorMsg.includes('format') || errorMsg.includes('conversion')) {
        userMessage = 'Image format not supported. Please try a JPEG or PNG image.';
      }
      
      Alert.alert(
        'Upload Failed', 
        userMessage,
        [
          { text: 'OK' },
          { 
            text: 'View Help', 
            onPress: () => Alert.alert(
              'Troubleshooting Tips',
              '1. Use a JPEG image\n2. Make sure you have a stable internet connection\n3. Try a smaller image\n4. Restart the app and try again'
            )
          }
        ]
      );
    } finally {
      setUploading(false);
    }
  };
  
  // Function to update the profile image URL in Firebase
  const updateProfileImageInFirebase = async (imageUrl) => {
    try {
      const ref_uncompte = ref_listcomptes.child(currentUserId);
      await ref_uncompte.update({
        profileImageUrl: imageUrl,
        lastUpdated: firebase.database.ServerValue.TIMESTAMP
      });
      
      // Trigger refresh for real-time listeners in other components
      await refreshUserData(currentUserId);
      console.log('Profile image updated and refresh triggered');
    } catch (error) {
      console.error('Error updating profile in Firebase:', error);
      throw error;
    }
  };
  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text
          style={{
            fontSize: 36,
            color: "#2E3A59",
            fontWeight: "bold",
          }}
        >
          Settings
        </Text>
          {/* Debug buttons for Supabase setup */}
        <View style={styles.debugButtonsContainer}>
          <TouchableOpacity
            style={styles.debugButton}
            onPress={runSupabaseTest}
          >
            <Text style={styles.debugButtonText}>Test Storage Connection</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.debugButton, styles.configButton]}
            onPress={showSupabaseConfigGuide}
          >
            <Text style={styles.debugButtonText}>Storage Setup Guide</Text>
          </TouchableOpacity>
        </View>
        
        <TouchableOpacity
          style={styles.imagePickerContainer}
          onPress={pickImage}
          disabled={uploading}
        >
          <Image
            source={profileImage ? { uri: profileImage } : require("../../assets/profile.jpg")}
            style={styles.profileImage}
          />
          {uploading ? (
            <View style={styles.uploadingOverlay}>
              <ActivityIndicator size="large" color="#FFFFFF" />
            </View>          ) : (
            <View style={styles.cameraIconContainer}>
              <MaterialCommunityIcons name="camera" size={20} color="#FFFFFF" />
            </View>
          )}
        </TouchableOpacity>
        <TextInput
          onChangeText={(ch) => {
            setPseudo(ch);
          }}
          style={styles.input}
          placeholderTextColor={"#8E97A9"}
          placeholder="Pseudo"
          value={pseudo}
        />
        <TextInput
          onChangeText={(ch) => {
            setNumero(ch);
          }}
          style={styles.input}
          placeholderTextColor={"#8E97A9"}
          placeholder="Number"
          value={numero}
        />          <TouchableOpacity 
          style={[styles.button, styles.saveButton, uploading && styles.disabledButton]}
          onPress={async () => {
            setUploading(true);
            try {
              const ref_uncompte = ref_listcomptes.child(currentUserId);
              await ref_uncompte.set({
                id: currentUserId,
                pseudo,
                numero,
                profileImageUrl: profileImage
              });
              Alert.alert('Success', 'Profile updated successfully!');
            } catch (error) {
              console.error('Error saving profile:', error);
              Alert.alert('Error', 'Failed to save profile information.');
            } finally {
              setUploading(false);
            }
          }}
          disabled={uploading}
        >
          {uploading ? (
            <ActivityIndicator color="#FFFFFF" size="small" />
          ) : (
            <Text style={styles.buttonText}>Save Profile</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.button, styles.disconnectButton]} 
          onPress={() => {
            auth.signOut().then(() => {
              props.navigation.navigate("Auth");
            });
          }}
        >
          <Text style={styles.buttonText}>Disconnect</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FB',
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 0,
  },
  input: {
    color: '#2E3A59',
    borderWidth: 1.5,
    borderColor: '#F0F2F5',
    height: 55,
    width: '92%',
    backgroundColor: '#F8F9FB',
    marginBottom: 20,
    borderRadius: 18,
    textAlign: 'center',
    fontSize: 18,
    fontWeight: '500',
    shadowColor: '#7B9CFF',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 5,
    elevation: 1,
  },
  button: {
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 24,
    marginVertical: 10,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#7B9CFF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
    width: '90%',
  },
  saveButton: {
    backgroundColor: '#7B9CFF',
    marginTop: 20,
  },
  disconnectButton: {
    backgroundColor: '#FF7E87',
    marginTop: 8,
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 17,
    letterSpacing: 0.5,
  },  imagePickerContainer: {
    position: 'relative',
    marginBottom: 20,
  },
  profileImage: {
    width: 150,
    height: 150,
    borderRadius: 75,
    borderWidth: 5,
    borderColor: '#7B9CFF',
    shadowColor: '#7B9CFF',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
    backgroundColor: '#F0F2F5',
  },
  cameraIconContainer: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#7B9CFF',
    borderRadius: 20,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#FFFFFF',
    shadowColor: '#7B9CFF',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 5,
  },
  cameraIcon: {
    fontSize: 20,
  },
  uploadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(123, 156, 255, 0.7)',
    borderRadius: 75,
    justifyContent: 'center',
    alignItems: 'center',
  },
  disabledButton: {
    opacity: 0.6,
  },  card: {
    backgroundColor: '#fff',
    borderRadius: 28,
    padding: 36,
    shadowColor: '#7B9CFF',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 28,
    elevation: 10,
    alignItems: 'center',
    width: '92%',
    marginBottom: 30,
    borderWidth: 0,
  },  debugButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginVertical: 8,
    width: '100%',
  },
  debugButton: {
    backgroundColor: '#4ca8af', // Different color to distinguish from normal buttons
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 12,
    marginVertical: 5,
    marginHorizontal: 5,
  },
  configButton: {
    backgroundColor: '#7a67a0', // Different color for config button
  },
  debugButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 12,
  },
});
