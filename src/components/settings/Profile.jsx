import { useState, useEffect } from "react";
import {
  User,
  Mail,
  Phone,
  Building2,
  MapPin,
  Camera,
  Edit2,
  Save,
  X,
  Trash2,
  Loader2
} from "lucide-react";
import apiClient from "../../api/apiClient";
import { useToast } from "../Toast/ToastContext";

const ProfileSettings = () => {
  const [activeTab, setActiveTab] = useState("profile");
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [isExistingProfile, setIsExistingProfile] = useState(false);

  // Get user data from localStorage
  const loginUserName = localStorage.getItem("userName") || "";
  const email = localStorage.getItem("email") || "";
  const employeeName = localStorage.getItem("employeeName") || "";
  const userId = localStorage.getItem("usersId") || "";

  const { addToast } = useToast();

  // User profile data state
  const [userData, setUserData] = useState({
    profile: {
      id: null,
      fullName: "",
      email: "",
      phoneNumber: "",
      address: "",
      bioInformation: "",
      companyName: "",
      createdBy: "",
      userProfileImage: null
    }
  });

  // Fetch user profile on component mount
  useEffect(() => {
    fetchUserProfile();
  }, []);

  const fetchUserProfile = async () => {
    try {
      setLoading(true);

      const response = await apiClient.get(
        `/api/commonmaster/getProfileInformationByUserId?userId=${userId}`
      );

      console.log("API Response:", response.data); // For debugging

      if (response.status === true) {
        const profileData = response.paramObjectsMap.userProfileInformationVO;
        setIsExistingProfile(true);

        // Set all fields with data from API
        setUserData({
          profile: {
            id: profileData.id || userId,
            fullName: profileData.fullName || employeeName || "",
            email: profileData.email || email || "",
            phoneNumber: profileData.phoneNumber?.toString() || "",
            address: profileData.address || "",
            bioInformation: profileData.bioInformation || "",
            companyName: profileData.companyName || "",
            createdBy: profileData.createdBy || loginUserName || "",
            userProfileImage: profileData.userProfileImage
              ? `data:image/jpeg;base64,${profileData.userProfileImage}`
              : null,
          }
        });
      } else {
        // No existing profile - populate with localStorage data
        setIsExistingProfile(false);
        setUserData({
          profile: {
            id: null,
            fullName: employeeName || "",
            email: email || "",
            phoneNumber: "",
            address: "",
            bioInformation: "",
            companyName: "",
            createdBy: loginUserName || "",
            userProfileImage: null
          }
        });
      }
    } catch (err) {
      console.error("Error fetching profile:", err);
      addToast("Failed to load profile data. Please try again.");

      // On error, populate with localStorage data as fallback
      setUserData({
        profile: {
          id: null,
          fullName: employeeName || "",
          email: email || "",
          phoneNumber: "",
          address: "",
          bioInformation: "",
          companyName: "",
          createdBy: loginUserName || "",
          userProfileImage: null
        }
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProfile = async () => {
    try {
      setSaving(true);

      // Build payload
      const payload = {
        fullName: employeeName,
        email: email,
        userId: userId,
        phoneNumber: userData.profile.phoneNumber,
        address: userData.profile.address,
        bioInformation: userData.profile.bioInformation,
        companyName: userData.profile.companyName,
        createdBy: loginUserName
      };

      // Only add id if it's an existing profile
      if (isExistingProfile && userData.profile.id) {
        payload.id = parseInt(userData.profile.id);
      }

      const response = await apiClient.put(
        "/api/commonmaster/createUpdateUserProfileInformation",
        payload
      );

      if (response) {
        // Get the profile ID from response
        const profileId = response.paramObjectsMap?.userProfileInformationVO?.id ||
          response.paramObjectsMap?.id ||
          (isExistingProfile ? userData.profile.id : null);

        // If there's an avatar to upload, upload it
        if (userData.profile.userProfileImage && userData.profile.userProfileImage instanceof File && profileId) {
          await uploadProfileImage(profileId);
        }

        addToast(isExistingProfile ? "Profile updated successfully!" : "Profile created successfully!");
        setIsEditing(false);
        setIsExistingProfile(true);

        // Refresh profile data to show updated information
        await fetchUserProfile();
      } else {
        addToast(response.paramObjectsMap?.message || "Failed to save profile");
      }
    } catch (err) {
      console.error("Error saving profile:", err);
      addToast("Failed to save profile. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const uploadProfileImage = async (profileId) => {
    try {
      setUploading(true);

      const formData = new FormData();
      formData.append('file', userData.profile.userProfileImage);
      formData.append('id', profileId.toString());

      const response = await apiClient.post(
        "/api/commonmaster/uploadExpenseUserProfileInBloob",
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        }
      );

      if (response.data.status) {
        addToast("Profile image uploaded successfully!");
        // Refresh profile to get updated avatar URL
        await fetchUserProfile();
      } else {
        addToast(response.data.paramObjectsMap?.message || "Failed to upload profile image");
      }
    } catch (err) {
      console.error("Error uploading image:", err);
      addToast("Failed to upload profile image. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    // Reset to last saved data
    fetchUserProfile();
  };

  const handleAvatarUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        addToast("Please upload an image file");
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        addToast("Image size should be less than 5MB");
        return;
      }

      // Store the file object for upload later
      setUserData(prev => ({
        ...prev,
        profile: {
          ...prev.profile,
          userProfileImage: file
        }
      }));
      addToast("Image selected for upload.");
    }
  };

  const removeAvatar = () => {
    setUserData(prev => ({
      ...prev,
      profile: {
        ...prev.profile,
        userProfileImage: null
      }
    }));
  };

  const tabs = [
    { id: "profile", label: "Profile", icon: User },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <Loader2 className="h-8 w-8 text-blue-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Account Settings</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm">Manage your account settings and preferences</p>
        </div>

        <div className="flex flex-col lg:flex-row gap-6">
          {/* Sidebar Navigation */}
          <div className="lg:w-64 flex-shrink-0">
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
              <nav className="space-y-1">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`w-full flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg transition-colors ${activeTab === tab.id
                        ? "bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300"
                        : "text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-700"
                        }`}
                    >
                      <Icon className="h-4 w-4" />
                      {tab.label}
                    </button>
                  );
                })}
              </nav>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            {/* Profile Tab */}
            {activeTab === "profile" && (
              <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                    {isExistingProfile ? "Profile Information" : "Create Profile"}
                  </h2>
                  {!isEditing ? (
                    <button
                      onClick={() => setIsEditing(true)}
                      className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors"
                    >
                      <Edit2 className="h-4 w-4" />
                      {isExistingProfile ? "Edit Profile" : "Create Profile"}
                    </button>
                  ) : (
                    <div className="flex gap-2">
                      <button
                        onClick={handleCancelEdit}
                        disabled={saving || uploading}
                        className="flex items-center gap-2 px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
                      >
                        <X className="h-4 w-4" />
                        Cancel
                      </button>
                      <button
                        onClick={handleSaveProfile}
                        disabled={saving || uploading}
                        className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
                      >
                        {(saving || uploading) ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Save className="h-4 w-4" />
                        )}
                        {saving ? "Saving..." : uploading ? "Uploading Image..." : "Save Changes"}
                      </button>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Avatar Section */}
                  <div className="lg:col-span-1">
                    <div className="text-center">
                      <div className="relative inline-block">
                        <div className="h-32 w-32 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center overflow-hidden mx-auto">
                          {userData.profile.userProfileImage ? (
                            typeof userData.profile.userProfileImage === 'string' ? (
                              <img
                                src={userData.profile.userProfileImage}
                                alt="Profile"
                                className="h-full w-full object-cover"
                              />
                            ) : userData.profile.userProfileImage instanceof File ? (
                              <img
                                src={URL.createObjectURL(userData.profile.userProfileImage)}
                                alt="Profile"
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              <User className="h-16 w-16 text-gray-400" />
                            )
                          ) : (
                            <User className="h-16 w-16 text-gray-400" />
                          )}
                        </div>
                        {isEditing && (
                          <>
                            <label
                              htmlFor="avatar-upload"
                              className="absolute bottom-0 right-0 bg-blue-600 text-white p-2 rounded-full cursor-pointer hover:bg-blue-700 transition-colors"
                            >
                              <Camera className="h-4 w-4" />
                              <input
                                id="avatar-upload"
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={handleAvatarUpload}
                              />
                            </label>
                            {userData.profile.userProfileImage && (
                              <button
                                onClick={removeAvatar}
                                className="absolute top-0 right-0 bg-red-600 text-white p-1 rounded-full cursor-pointer hover:bg-red-700 transition-colors"
                              >
                                <Trash2 className="h-3 w-3" />
                              </button>
                            )}
                          </>
                        )}
                      </div>
                      <div className="mt-4">
                        <h3 className="font-semibold text-gray-900 dark:text-white">
                          {userData.profile.fullName || "User"}
                        </h3>
                      </div>
                    </div>
                  </div>

                  {/* Profile Form */}
                  <div className="lg:col-span-2 space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          User Name
                        </label>
                        <input
                          type="text"
                          value={loginUserName}
                          disabled
                          className="w-full pl-4 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-500 dark:text-gray-400 cursor-not-allowed"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Email
                        </label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                          <input
                            type="email"
                            value={userData.profile.email}
                            onChange={(e) => setUserData(prev => ({
                              ...prev,
                              profile: { ...prev.profile, email: e.target.value }
                            }))}
                            disabled
                            className="w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-500 dark:text-gray-400 cursor-not-allowed"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Full Name
                        </label>
                        <input
                          type="text"
                          value={employeeName}
                          onChange={(e) => setUserData(prev => ({
                            ...prev,
                            profile: { ...prev.profile, fullName: e.target.value }
                          }))}
                          disabled={!isEditing}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white disabled:bg-gray-50 dark:disabled:bg-gray-800"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Phone
                        </label>
                        <div className="relative">
                          <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                          <input
                            type="tel"
                            value={userData.profile.phoneNumber}
                            onChange={(e) => setUserData(prev => ({
                              ...prev,
                              profile: { ...prev.profile, phoneNumber: e.target.value }
                            }))}
                            disabled={!isEditing}
                            className="w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white disabled:bg-gray-50 dark:disabled:bg-gray-800"
                          />
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Address
                      </label>
                      <div className="relative">
                        <MapPin className="absolute left-3 top-3 text-gray-400 h-4 w-4" />
                        <input
                          type="text"
                          value={userData.profile.address}
                          onChange={(e) => setUserData(prev => ({
                            ...prev,
                            profile: { ...prev.profile, address: e.target.value }
                          }))}
                          disabled={!isEditing}
                          className="w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white disabled:bg-gray-50 dark:disabled:bg-gray-800"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Bio
                      </label>
                      <textarea
                        value={userData.profile.bioInformation}
                        onChange={(e) => setUserData(prev => ({
                          ...prev,
                          profile: { ...prev.profile, bioInformation: e.target.value }
                        }))}
                        disabled={!isEditing}
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white disabled:bg-gray-50 dark:disabled:bg-gray-800 resize-none"
                        placeholder="Tell us about yourself..."
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileSettings;