import React, { useState, useEffect, useRef } from 'react';
import { User, Camera, Lock, Globe, LogOut, Save, X, Upload } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { supabase } from '../lib/supabase';
import { CURRENCIES, getCurrencyIcon } from '../utils/currency';
import { updateFavicon, createInitialsFavicon } from '../utils/favicon';
import { cropImageToCircle, dataURLtoFile } from '../utils/imageProcessor';

interface ProfileProps {
  isOpen: boolean;
  onClose: () => void;
  onProfileUpdate?: () => void;
}

interface UserProfile {
  fullName: string;
  email: string;
  profilePicture?: string;
  currency: string;
  country: string;
}

export const Profile: React.FC<ProfileProps> = ({ isOpen, onClose, onProfileUpdate }) => {
  const { user, signOut, updateUserMetadata, getUserProfile, updateUserProfile } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [profileLoading, setProfileLoading] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [profile, setProfile] = useState<UserProfile>({
    fullName: '',
    email: '',
    profilePicture: '',
    currency: 'USD',
    country: 'United States',
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  // Load profile data when component opens
  useEffect(() => {
    if (isOpen && user) {
      loadProfileData();
    }
  }, [isOpen, user]);

  const loadProfileData = async () => {
    setProfileLoading(true);
    try {
      const { data, error } = await getUserProfile();
      if (data && !error) {
        const profileData = {
          fullName: data.full_name || user?.email?.split('@')[0] || 'User',
          email: data.email || user?.email || '',
          profilePicture: data.profile_picture_url || '',
          currency: data.currency || 'USD',
          country: data.country || 'United States',
        };
        setProfile(profileData);
        
        // Update favicon based on profile picture or initials
        if (data.profile_picture_url) {
          updateFavicon(data.profile_picture_url);
        } else {
          const initials = getUserInitials(profileData.fullName);
          createInitialsFavicon(initials);
        }
      } else {
        // Fallback to user metadata
        const profileData = {
          fullName: user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'User',
          email: user?.email || '',
          profilePicture: user?.user_metadata?.avatar_url || '',
          currency: user?.user_metadata?.currency || 'USD',
          country: user?.user_metadata?.country || 'United States',
        };
        setProfile(profileData);
        
        // Update favicon based on profile picture or initials
        if (user?.user_metadata?.avatar_url) {
          updateFavicon(user.user_metadata.avatar_url);
        } else {
          const initials = getUserInitials(profileData.fullName);
          createInitialsFavicon(initials);
        }
      }
    } catch (error) {
      console.error('Error loading profile:', error);
    } finally {
      setProfileLoading(false);
    }
  };

  const getUserInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type and size
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }

    if (file.size > 5 * 1024 * 1024) { // 5MB limit
      alert('Image size should be less than 5MB');
      return;
    }

    setLoading(true);
    try {
      // Crop image to circle
      const croppedImageDataUrl = await cropImageToCircle(file);
      const croppedFile = dataURLtoFile(croppedImageDataUrl, file.name);

      // Upload to Supabase Storage
      const fileExt = file.name.split('.').pop();
      const fileName = `profile-${user?.id}-${Date.now()}.${fileExt}`;
      
      const { data, error } = await supabase.storage
        .from('profile-pictures')
        .upload(fileName, croppedFile, {
          cacheControl: '3600',
          upsert: false
        });

      if (error) {
        console.error('Storage upload error:', error);
        throw error;
      }

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('profile-pictures')
        .getPublicUrl(fileName);

      // Update profile with new image URL
      setProfile(prev => ({ ...prev, profilePicture: publicUrl }));
      
      // Save to database - only update the profile picture URL
      const { error: profileError } = await supabase
        .from('user_profiles')
        .upsert({
          user_id: user?.id,
          profile_picture_url: publicUrl,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'user_id'
        });

      if (profileError) {
        console.error('Profile update error:', profileError);
        throw profileError;
      }

      // Update favicon with new profile picture
      updateFavicon(publicUrl);

      // Show success message
      alert('Profile picture updated successfully!');
      
      // Trigger header refresh
      if (onProfileUpdate) {
        onProfileUpdate();
      }

    } catch (error) {
      console.error('Error uploading image:', error);
      alert('Failed to upload image. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProfile = async () => {
    setLoading(true);
    try {
      const { error } = await updateUserProfile({
        full_name: profile.fullName,
        email: profile.email || user?.email,
        currency: profile.currency,
        country: profile.country,
      });
      
      if (error) {
        console.error('Error updating profile:', error);
        alert('Failed to update profile');
      } else {
        setIsEditing(false);
        alert('Profile updated successfully!');
        
        // Trigger header refresh
        if (onProfileUpdate) {
          onProfileUpdate();
        }
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      alert('New passwords do not match');
      return;
    }

    if (passwordData.newPassword.length < 6) {
      alert('Password must be at least 6 characters long');
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({
        password: passwordData.newPassword
      });
      
      if (error) {
        console.error('Error changing password:', error);
        alert('Failed to change password');
      } else {
        setIsChangingPassword(false);
        setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
        alert('Password changed successfully!');
      }
    } catch (error) {
      console.error('Error changing password:', error);
      alert('Failed to change password');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await signOut();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-3 sm:p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full max-h-[95vh] sm:max-h-[90vh] overflow-hidden flex flex-col">
        {/* Fixed Header */}
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-200 bg-white sticky top-0 z-10">
          <h2 className="text-lg sm:text-xl font-bold text-gray-900">Profile Settings</h2>
          <button
            onClick={onClose}
            className="p-1.5 sm:p-2 text-gray-400 hover:text-gray-600 transition-colors duration-200"
          >
            <X className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 sm:space-y-6">
          {profileLoading ? (
            <div className="flex items-center justify-center h-32">
              <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : (
            <>
              {/* Profile Picture Section */}
              <div className="text-center">
                <div className="relative inline-block">
                  <div className="w-20 h-20 sm:w-24 sm:h-24 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white text-xl sm:text-2xl font-bold overflow-hidden">
                    {profile.profilePicture ? (
                      <img
                        src={profile.profilePicture}
                        alt="Profile"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      getUserInitials(profile.fullName)
                    )}
                  </div>
                  <button 
                    onClick={() => fileInputRef.current?.click()}
                    disabled={loading}
                    className="absolute -bottom-1 -right-1 bg-white rounded-full p-1.5 sm:p-2 shadow-lg border border-gray-200 hover:shadow-xl transition-shadow duration-200 disabled:opacity-50"
                  >
                    {loading ? (
                      <div className="w-3 h-3 sm:w-4 sm:h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <Upload className="w-3 h-3 sm:w-4 sm:h-4 text-gray-600" />
                    )}
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                </div>
              </div>

              {/* Profile Information */}
              <div className="space-y-3 sm:space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={profile.fullName}
                    onChange={(e) => setProfile(prev => ({ ...prev, fullName: e.target.value }))}
                    disabled={!isEditing}
                    className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50 text-sm sm:text-base"
                    placeholder="Enter your full name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    value={profile.email}
                    disabled
                    className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-500 text-sm sm:text-base"
                  />
                  <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">
                    Currency
                  </label>
                  <select
                    value={profile.currency}
                    onChange={(e) => setProfile(prev => ({ ...prev, currency: e.target.value }))}
                    disabled={!isEditing}
                    className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50 text-sm sm:text-base"
                  >
                    {CURRENCIES.map(currency => (
                      <option key={currency.code} value={currency.code}>
                        {currency.icon} {currency.symbol} {currency.name} ({currency.country})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2 sm:space-y-3">
                {!isEditing ? (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="w-full bg-blue-500 text-white py-2.5 sm:py-3 px-4 rounded-lg font-medium hover:bg-blue-600 transition-colors duration-200 flex items-center justify-center space-x-2 text-sm sm:text-base"
                  >
                    <User className="w-4 h-4" />
                    <span>Edit Profile</span>
                  </button>
                ) : (
                  <div className="space-y-2">
                    <button
                      onClick={handleSaveProfile}
                      disabled={loading}
                      className="w-full bg-green-500 text-white py-2.5 sm:py-3 px-4 rounded-lg font-medium hover:bg-green-600 transition-colors duration-200 flex items-center justify-center space-x-2 disabled:opacity-50 text-sm sm:text-base"
                    >
                      <Save className="w-4 h-4" />
                      <span>{loading ? 'Saving...' : 'Save Changes'}</span>
                    </button>
                    <button
                      onClick={() => setIsEditing(false)}
                      className="w-full bg-gray-500 text-white py-2.5 sm:py-3 px-4 rounded-lg font-medium hover:bg-gray-600 transition-colors duration-200 text-sm sm:text-base"
                    >
                      Cancel
                    </button>
                  </div>
                )}

                <button
                  onClick={() => setIsChangingPassword(true)}
                  className="w-full bg-yellow-500 text-white py-2.5 sm:py-3 px-4 rounded-lg font-medium hover:bg-yellow-600 transition-colors duration-200 flex items-center justify-center space-x-2 text-sm sm:text-base"
                >
                  <Lock className="w-4 h-4" />
                  <span>Change Password</span>
                </button>

                <button
                  onClick={handleLogout}
                  className="w-full bg-red-500 text-white py-2.5 sm:py-3 px-4 rounded-lg font-medium hover:bg-red-600 transition-colors duration-200 flex items-center justify-center space-x-2 text-sm sm:text-base"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Sign Out</span>
                </button>
              </div>
            </>
          )}

          {/* Change Password Modal */}
          {isChangingPassword && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold text-gray-900">Change Password</h3>
                  <button
                    onClick={() => setIsChangingPassword(false)}
                    className="p-2 text-gray-400 hover:text-gray-600 transition-colors duration-200"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Current Password
                    </label>
                    <input
                      type="password"
                      value={passwordData.currentPassword}
                      onChange={(e) => setPasswordData(prev => ({ ...prev, currentPassword: e.target.value }))}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter current password"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      New Password
                    </label>
                    <input
                      type="password"
                      value={passwordData.newPassword}
                      onChange={(e) => setPasswordData(prev => ({ ...prev, newPassword: e.target.value }))}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter new password"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Confirm New Password
                    </label>
                    <input
                      type="password"
                      value={passwordData.confirmPassword}
                      onChange={(e) => setPasswordData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Confirm new password"
                    />
                  </div>

                  <div className="flex space-x-3">
                    <button
                      onClick={handleChangePassword}
                      disabled={loading}
                      className="flex-1 bg-blue-500 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-600 transition-colors duration-200 disabled:opacity-50"
                    >
                      {loading ? 'Changing...' : 'Change Password'}
                    </button>
                    <button
                      onClick={() => setIsChangingPassword(false)}
                      className="flex-1 bg-gray-500 text-white py-3 px-4 rounded-lg font-medium hover:bg-gray-600 transition-colors duration-200"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}; 