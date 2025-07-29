import React, { useState, useEffect } from 'react';
import { LogOut, User, Settings } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { Profile } from './Profile';
import { supabase } from '../lib/supabase';

export const Header: React.FC = () => {
  const { user } = useAuth();
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const getUserInitials = (email: string) => {
    return email
      .split('@')[0]
      .split('.')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getUserDisplayName = (email: string) => {
    const name = email.split('@')[0];
    return name.charAt(0).toUpperCase() + name.slice(1);
  };

  const [userProfile, setUserProfile] = useState<any>(null);

  useEffect(() => {
    if (user) {
      loadUserProfile();
    }
  }, [user]);

  const loadUserProfile = async () => {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('full_name, profile_picture_url')
        .eq('user_id', user?.id)
        .single();
      
      if (data && !error) {
        setUserProfile(data);
      }
    } catch (error) {
      console.error('Error loading user profile:', error);
    }
  };

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6">
        <div className="flex items-center justify-between h-14 sm:h-16">
          {/* Logo Section */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            <div className="w-7 h-7 sm:w-8 sm:h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm sm:text-lg">💰</span>
            </div>
            <div className="hidden sm:block">
              <h1 className="text-lg sm:text-xl font-bold text-gray-900">PeExtrAp</h1>
              <p className="text-xs text-gray-500">Personal Finance Tracker</p>
            </div>
            <div className="sm:hidden">
              <h1 className="text-lg font-bold text-gray-900">PeExtrAp</h1>
            </div>
          </div>
          
          {/* Right Section */}
          <div className="flex items-center space-x-2 sm:space-x-4">
            {/* Date - Hidden on very small screens */}
            <div className="hidden xs:flex items-center space-x-1 sm:space-x-2 text-xs sm:text-sm text-gray-600">
              <span>📅</span>
              <span className="hidden sm:inline">{new Date().toLocaleDateString('en-US', { 
                weekday: 'short', 
                year: 'numeric', 
                month: 'short', 
                day: 'numeric' 
              })}</span>
              <span className="sm:hidden">{new Date().toLocaleDateString('en-US', { 
                month: 'short', 
                day: 'numeric' 
              })}</span>
            </div>

            {/* User Profile */}
            <div className="flex items-center">
              <button
                onClick={() => setIsProfileOpen(true)}
                className="flex items-center space-x-1 sm:space-x-2 text-xs sm:text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-all duration-200 px-2 sm:px-3 py-1.5 sm:py-2"
                title="Profile Settings"
              >
                <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full overflow-hidden flex items-center justify-center">
                  {userProfile?.profile_picture_url ? (
                    <img
                      src={userProfile.profile_picture_url}
                      alt="Profile"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-bold text-xs sm:text-sm">
                      {getUserInitials(user?.email || '')}
                    </div>
                  )}
                </div>
                <span className="hidden sm:inline">
                  Hi, {userProfile?.full_name || getUserDisplayName(user?.email || '')}
                </span>
                <span className="sm:hidden text-xs">
                  {userProfile?.full_name?.split(' ')[0] || getUserDisplayName(user?.email || '').split(' ')[0]}
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>
      
      <Profile 
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
        onProfileUpdate={loadUserProfile}
      />
    </header>
  );
};