import { useAuth } from '../hooks/useAuth';
import { useState } from 'react';

export default function Profile() {
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">My Profile</h1>
      
      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Profile Information</h2>
            <button
              onClick={() => setIsEditing(!isEditing)}
              className="text-blue-600 hover:text-blue-700"
            >
              {isEditing ? 'Cancel' : 'Edit'}
            </button>
          </div>
        </div>
        
        <div className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
            <p className="text-lg">{user?.username}</p>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <p className="text-lg">{user?.email}</p>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
            <p className="text-lg capitalize">{user?.role}</p>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Member Since</label>
            <p className="text-lg">
              {user?.created_at ? new Date(user.created_at).toLocaleDateString() : 'N/A'}
            </p>
          </div>
        </div>
      </div>

      <div className="mt-8 bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">Account Settings</h2>
        <div className="space-y-3">
          <button className="w-full text-left px-4 py-3 rounded-lg hover:bg-gray-50 transition-colors">
            Change Password
          </button>
          <button className="w-full text-left px-4 py-3 rounded-lg hover:bg-gray-50 transition-colors">
            Email Preferences
          </button>
          <button className="w-full text-left px-4 py-3 rounded-lg text-red-600 hover:bg-red-50 transition-colors">
            Delete Account
          </button>
        </div>
      </div>
    </div>
  );
}