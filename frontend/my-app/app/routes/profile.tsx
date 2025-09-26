import { useState, useEffect } from "react";
import { useSearchParams, Link } from "react-router"; 
import { AuthenticatedRoute } from "../components/ProtectedRoute";
import { Navbar } from "../components/Navbar";
import { Calendar, ExternalLink, Github, Linkedin, Twitter, Globe, Edit3, Camera, Loader2, Save, X, Plus, Trash2, MessageCircle } from "lucide-react";
import { useProfile, useProfileByUserId, useUpdateProfile, type Profile, type UpdateProfileDto } from "../api/profile";
import { getCurrentUserId } from "../lib/auth";
import { toast } from "sonner";

export function meta() {
  return [
    { title: "Profile - DevConnect" },
    { name: "description", content: "Your DevConnect profile" },
  ];
}

export default function Profile() {
  const [searchParams] = useSearchParams();
  const [isEditing, setIsEditing] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [editData, setEditData] = useState<UpdateProfileDto>({});
  
  // New state to safely manage which profile to fetch
  const [profileToFetch, setProfileToFetch] = useState<{ type: 'id' | 'userId', value: string | null }>({ type: 'userId', value: null });

  // This hook runs ONLY on the client, after the component has mounted.
  useEffect(() => {
    const userId = getCurrentUserId();
    console.log('Profile - getCurrentUserId returned:', userId);
    setCurrentUserId(userId);

    const idFromUrl = searchParams.get('id');
    console.log('Profile - idFromUrl:', idFromUrl);
    
    // Decide which profile to fetch based on URL params
    if (idFromUrl) {
      setProfileToFetch({ type: 'id', value: idFromUrl });
    } else {
      setProfileToFetch({ type: 'userId', value: userId });
    }
  }, [searchParams]); // Rerun if the URL search params change

  const isCurrentUser = profileToFetch.type === 'userId';

  // Use the state to conditionally call the correct hook
  // This is now safe from the server-side rendering error
  const { data: profileData, isLoading, error } = 
    profileToFetch.type === 'id' && profileToFetch.value
      ? useProfile(profileToFetch.value)
      : useProfileByUserId(profileToFetch.value || '');
  
  const updateProfileMutation = useUpdateProfile(
    (data) => {
      toast.success("Profile updated successfully!");
      setIsEditing(false);
      setEditData({});
    },
    (error) => {
      toast.error("Failed to update profile. Please try again.");
      console.error("Update error:", error);
    }
  );

  // Initialize edit data when entering edit mode
  useEffect(() => {
    if (isEditing && profileData) {
      setEditData({
        name: profileData.name || "",
        title: profileData.title || "",
        location: profileData.location || "",
        experience: profileData.experience || "",
        availability: profileData.availability || "",
        about: profileData.about || "",
        skills: [...(profileData.skills || [])],
        education: [...(profileData.education || [])],
        projects: [...(profileData.projects || [])],
        socialLinks: { ...profileData.socialLinks }
      });
    }
  }, [isEditing, profileData]);

  const handleSave = () => {
    if (!profileData?.id) return;
    updateProfileMutation.mutate({
      profileId: profileData.id,
      data: editData
    });
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditData({});
  };

  // Unified loading state: active while fetching OR before client-side logic has run
  if (isLoading || !profileToFetch.value) {
    return (
      <AuthenticatedRoute>
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
          <div className="flex items-center gap-3 text-white">
            <Loader2 className="w-6 h-6 animate-spin" />
            <span>Loading profile...</span>
          </div>
        </div>
      </AuthenticatedRoute>
    );
  }

  // Handle case where user ID is not available after client-side check
  if (!currentUserId && isCurrentUser) {
    toast.error("Unable to get user information. Please log in again.");
    return (
      <AuthenticatedRoute>
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
          <div className="text-center text-white">
            <h2 className="text-2xl font-bold mb-4">Authentication Error</h2>
            <p className="text-gray-300">Unable to get user information. Please log in again.</p>
          </div>
        </div>
      </AuthenticatedRoute>
    );
  }

  if (error || !profileData) {
    toast.error("Failed to load profile data");
    return (
      <AuthenticatedRoute>
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
          <div className="text-center text-white">
            <h2 className="text-2xl font-bold mb-4">Profile Not Found</h2>
            <p className="text-gray-300">Unable to load profile data.</p>
          </div>
        </div>
      </AuthenticatedRoute>
    );
  }

  return (
    <>
      <Navbar />
      <AuthenticatedRoute>
        <div className="min-h-screen w-full bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <div className="w-full px-6 py-8 pb-20 pt-20 animate-fade-in">
          {/* Header Section */}
          <div className="relative mb-8">
            <div className="bg-gradient-to-r from-purple-600/20 to-blue-600/20 backdrop-blur-sm border border-white/10 rounded-3xl p-8">
              <div className="flex flex-col md:flex-row items-start gap-6">
                {/* Avatar Section */}
                <div className="relative group">
                  {profileData.avatar ? (
                    <div className="w-32 h-32 rounded-full overflow-hidden border-2 border-white/20">
                      <img 
                        src={profileData.avatar} 
                        alt={profileData.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          // Fallback to initials if image fails to load
                          const target = e.target as HTMLImageElement;
                          target.style.display = 'none';
                          const fallback = document.createElement('div');
                          fallback.className = 'w-full h-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-white text-4xl font-bold';
                          fallback.textContent = profileData.name.split(' ').map(n => n[0]).join('');
                          target.parentNode?.insertBefore(fallback, target.nextSibling);
                        }}
                      />
                    </div>
                  ) : (
                    <div className="w-32 h-32 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-white text-4xl font-bold shadow-2xl">
                      {profileData.name.split(' ').map(n => n[0]).join('')}
                    </div>
                  )}
                  {isCurrentUser && (
                    <button 
                      className="absolute inset-0 rounded-full bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                      onClick={() => {/* Add avatar upload functionality here */}}
                    >
                      <Camera className="w-6 h-6 text-white" />
                    </button>
                  )}
                </div>

                {/* Profile Info */}
                <div className="flex-1">
                  <div className="flex items-start justify-between">
                    <div className="w-full">
                      {/* Name */}
                      {isEditing ? (
                        <div className="mb-4">
                          <label className="block text-sm font-medium text-gray-300 mb-1">Full Name</label>
                          <input
                            type="text"
                            value={editData.name || ""}
                            onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                            placeholder="Your full name"
                            className="w-full p-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-500 transition-colors"
                          />
                        </div>
                      ) : (
                        <h1 className="text-3xl font-bold text-white mb-2">{profileData.name}</h1>
                      )}

                      {/* Title */}
                      {isEditing ? (
                        <div className="mb-4">
                          <label className="block text-sm font-medium text-gray-300 mb-1">Professional Title</label>
                          <input
                            type="text"
                            value={editData.title || ""}
                            onChange={(e) => setEditData({ ...editData, title: e.target.value })}
                            placeholder="e.g., Full Stack Developer"
                            className="w-full p-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-500 transition-colors"
                          />
                        </div>
                      ) : (
                        profileData.title && <p className="text-blue-400 text-xl font-medium mb-2">{profileData.title}</p>
                      )}

                      {/* Location & Experience Row */}
                      {isEditing ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-300 mb-1">Location</label>
                            <input
                              type="text"
                              value={editData.location || ""}
                              onChange={(e) => setEditData({ ...editData, location: e.target.value })}
                              placeholder="e.g., San Francisco, CA"
                              className="w-full p-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-500 transition-colors"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-300 mb-1">Experience</label>
                            <input
                              type="text"
                              value={editData.experience || ""}
                              onChange={(e) => setEditData({ ...editData, experience: e.target.value })}
                              placeholder="e.g., 5+ years"
                              className="w-full p-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-500 transition-colors"
                            />
                          </div>
                        </div>
                      ) : (
                        <div className="flex flex-wrap gap-4 mb-4">
                          {profileData.location && (
                            <div className="flex items-center gap-2 text-gray-300">
                              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                              </svg>
                              <span>{profileData.location}</span>
                            </div>
                          )}
                          {profileData.experience && (
                            <div className="flex items-center gap-2 text-gray-300">
                              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M6 6V5a3 3 0 013-3h2a3 3 0 013 3v1h2a2 2 0 012 2v6a2 2 0 01-2 2H4a2 2 0 01-2-2V8a2 2 0 012-2h2zm4-3a1 1 0 00-1 1v1h2V4a1 1 0 00-1-1z" clipRule="evenodd" />
                              </svg>
                              <span>{profileData.experience}</span>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Availability */}
                      {isEditing ? (
                        <div className="mb-4">
                          <label className="block text-sm font-medium text-gray-300 mb-1">Availability</label>
                          <select
                            value={editData.availability || ""}
                            onChange={(e) => setEditData({ ...editData, availability: e.target.value })}
                            className="w-full p-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-purple-500 transition-colors"
                          >
                            <option value="">Select availability</option>
                            <option value="Available">Available</option>
                            <option value="Busy">Busy</option>
                            <option value="Open to work">Open to work</option>
                          </select>
                        </div>
                      ) : (
                        profileData.availability && (
                          <div className="mb-4">
                            <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                              profileData.availability === 'Available' 
                                ? 'bg-green-900/50 text-green-300' 
                                : profileData.availability === 'Open to work'
                                ? 'bg-blue-900/50 text-blue-300'
                                : 'bg-yellow-900/50 text-yellow-300'
                            }`}>
                              {profileData.availability}
                            </span>
                          </div>
                        )
                      )}

                      {/* About */}
                      {isEditing ? (
                        <div className="mb-4">
                          <label className="block text-sm font-medium text-gray-300 mb-1">About</label>
                          <textarea
                            value={editData.about || ""}
                            onChange={(e) => setEditData({ ...editData, about: e.target.value })}
                            placeholder="Tell us about yourself..."
                            className="w-full p-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 resize-none focus:outline-none focus:border-purple-500 transition-colors"
                            rows={3}
                          />
                        </div>
                      ) : (
                        profileData.about && <p className="text-gray-300 text-lg mb-4">{profileData.about}</p>
                      )}

                      {/* Social Links */}
                      {isEditing ? (
                        <div className="space-y-3 mt-4">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <div>
                              <label className="block text-sm font-medium text-gray-300 mb-1">GitHub</label>
                              <input
                                type="url"
                                value={editData.socialLinks?.github || ""}
                                onChange={(e) => setEditData({ 
                                  ...editData, 
                                  socialLinks: { ...editData.socialLinks, github: e.target.value }
                                })}
                                placeholder="https://github.com/username"
                                className="w-full p-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-500 transition-colors"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-300 mb-1">LinkedIn</label>
                              <input
                                type="url"
                                value={editData.socialLinks?.linkedin || ""}
                                onChange={(e) => setEditData({ 
                                  ...editData, 
                                  socialLinks: { ...editData.socialLinks, linkedin: e.target.value }
                                })}
                                placeholder="https://linkedin.com/in/username"
                                className="w-full p-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-500 transition-colors"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-300 mb-1">Twitter</label>
                              <input
                                type="url"
                                value={editData.socialLinks?.twitter || ""}
                                onChange={(e) => setEditData({ 
                                  ...editData, 
                                  socialLinks: { ...editData.socialLinks, twitter: e.target.value }
                                })}
                                placeholder="https://twitter.com/username"
                                className="w-full p-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-500 transition-colors"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-300 mb-1">Website</label>
                              <input
                                type="url"
                                value={editData.socialLinks?.website || ""}
                                onChange={(e) => setEditData({ 
                                  ...editData, 
                                  socialLinks: { ...editData.socialLinks, website: e.target.value }
                                })}
                                placeholder="https://yourwebsite.com"
                                className="w-full p-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-500 transition-colors"
                              />
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="flex gap-3">
                          {profileData.socialLinks.github && (
                            <a href={profileData.socialLinks.github} target="_blank" rel="noopener noreferrer"
                              className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors">
                              <Github className="w-5 h-5 text-white" />
                            </a>
                          )}
                          {profileData.socialLinks.linkedin && (
                            <a href={profileData.socialLinks.linkedin} target="_blank" rel="noopener noreferrer"
                              className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors">
                              <Linkedin className="w-5 h-5 text-white" />
                            </a>
                          )}
                          {profileData.socialLinks.twitter && (
                            <a href={profileData.socialLinks.twitter} target="_blank" rel="noopener noreferrer"
                              className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors">
                              <Twitter className="w-5 h-5 text-white" />
                            </a>
                          )}
                          {profileData.socialLinks.website && (
                            <a href={profileData.socialLinks.website} target="_blank" rel="noopener noreferrer"
                              className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors">
                              <Globe className="w-5 h-5 text-white" />
                            </a>
                          )}
                        </div>
                      )}
                    </div>

                    <div className="flex gap-2">
                      {isEditing ? (
                        <>
                          <button
                            onClick={handleSave}
                            disabled={updateProfileMutation.isPending}
                            className="p-2 rounded-lg bg-green-600/20 hover:bg-green-600/30 transition-colors disabled:opacity-50"
                          >
                            {updateProfileMutation.isPending ? (
                              <Loader2 className="w-5 h-5 text-white animate-spin" />
                            ) : (
                              <Save className="w-5 h-5 text-green-400" />
                            )}
                          </button>
                          <button
                            onClick={handleCancel}
                            className="p-2 rounded-lg bg-red-600/20 hover:bg-red-600/30 transition-colors"
                          >
                            <X className="w-5 h-5 text-red-400" />
                          </button>
                        </>
                      ) : (
                        <>
                          {isCurrentUser ? (
                            <button
                              onClick={() => setIsEditing(true)}
                              className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                            >
                              <Edit3 className="w-4 h-4" />
                            </button>
                          ) : (
                            <Link
                              to={`/messages?chat=${profileData.user_id}`}
                              className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
                            >
                              <MessageCircle className="w-4 h-4" />
                              Message
                            </Link>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Left Column */}
            <div className="lg:col-span-1 space-y-6">

              {/* Education Section */}
              <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
                <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  Education
                  {isEditing && (
                    <button
                      onClick={() => setEditData({
                        ...editData,
                        education: [...(editData.education || []), {
                          degree: "",
                          institution: "",
                          startYear: new Date().getFullYear(),
                          endYear: new Date().getFullYear()
                        }]
                      })}
                      className="ml-auto p-1 rounded-lg bg-blue-600/20 hover:bg-blue-600/30 transition-colors"
                    >
                      <Plus className="w-4 h-4 text-blue-400" />
                    </button>
                  )}
                </h2>
                {isEditing ? (
                  <div className="space-y-4">
                    {editData.education?.map((edu, index) => (
                      <div key={index} className="bg-white/5 rounded-lg p-4 space-y-3">
                        <div className="flex justify-between items-start">
                          <h4 className="text-sm font-medium text-gray-300">Education #{index + 1}</h4>
                          <button
                            onClick={() => {
                              const newEducation = editData.education?.filter((_, i) => i !== index) || [];
                              setEditData({ ...editData, education: newEducation });
                            }}
                            className="p-1 rounded-lg bg-red-600/20 hover:bg-red-600/30 transition-colors"
                          >
                            <Trash2 className="w-3 h-3 text-red-400" />
                          </button>
                        </div>
                        <div className="space-y-2">
                          <input
                            type="text"
                            value={edu.degree}
                            onChange={(e) => {
                              const newEducation = [...(editData.education || [])];
                              newEducation[index] = { ...newEducation[index], degree: e.target.value };
                              setEditData({ ...editData, education: newEducation });
                            }}
                            placeholder="Degree (e.g., B.Tech in Computer Science)"
                            className="w-full p-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 transition-colors"
                          />
                          <input
                            type="text"
                            value={edu.institution}
                            onChange={(e) => {
                              const newEducation = [...(editData.education || [])];
                              newEducation[index] = { ...newEducation[index], institution: e.target.value };
                              setEditData({ ...editData, education: newEducation });
                            }}
                            placeholder="Institution (e.g., IIT Bombay)"
                            className="w-full p-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 transition-colors"
                          />
                          <div className="grid grid-cols-2 gap-2">
                            <input
                              type="number"
                              value={edu.startYear || ""}
                              onChange={(e) => {
                                const newEducation = [...(editData.education || [])];
                                newEducation[index] = { ...newEducation[index], startYear: parseInt(e.target.value) || undefined };
                                setEditData({ ...editData, education: newEducation });
                              }}
                              placeholder="Start Year"
                              className="w-full p-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 transition-colors"
                            />
                            <input
                              type="number"
                              value={edu.endYear || ""}
                              onChange={(e) => {
                                const newEducation = [...(editData.education || [])];
                                newEducation[index] = { ...newEducation[index], endYear: parseInt(e.target.value) || undefined };
                                setEditData({ ...editData, education: newEducation });
                              }}
                              placeholder="End Year"
                              className="w-full p-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 transition-colors"
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="space-y-4">
                    {profileData.education.map((edu, index) => (
                      <div key={index} className="border-l-2 border-purple-500/30 pl-4">
                        <h3 className="font-semibold text-white">{edu.degree}</h3>
                        <p className="text-gray-300">{edu.institution}</p>
                        <p className="text-sm text-gray-400 flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          {edu.startYear} - {edu.endYear}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Skills Section */}
              <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
                <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                  <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                  Skills
                  {isEditing && (
                    <button
                      onClick={() => setEditData({
                        ...editData,
                        skills: [...(editData.skills || []), ""]
                      })}
                      className="ml-auto p-1 rounded-lg bg-purple-600/20 hover:bg-purple-600/30 transition-colors"
                    >
                      <Plus className="w-4 h-4 text-purple-400" />
                    </button>
                  )}
                </h2>
                {isEditing ? (
                  <div className="space-y-2">
                    {editData.skills?.map((skill, index) => (
                      <div key={index} className="flex gap-2">
                        <input
                          type="text"
                          value={skill}
                          onChange={(e) => {
                            const newSkills = [...(editData.skills || [])];
                            newSkills[index] = e.target.value;
                            setEditData({ ...editData, skills: newSkills });
                          }}
                          placeholder="Enter skill"
                          className="flex-1 p-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-500 transition-colors"
                        />
                        <button
                          onClick={() => {
                            const newSkills = editData.skills?.filter((_, i) => i !== index) || [];
                            setEditData({ ...editData, skills: newSkills });
                          }}
                          className="p-2 rounded-lg bg-red-600/20 hover:bg-red-600/30 transition-colors"
                        >
                          <Trash2 className="w-4 h-4 text-red-400" />
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {profileData.skills.map((skill, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-gradient-to-r from-purple-500/20 to-blue-500/20 border border-purple-500/30 rounded-full text-sm text-white"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Right Column */}
            <div className="lg:col-span-3 space-y-6">
              {/* About Section */}
              <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
                <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                  <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                  About
                </h2>
                <div className="prose prose-invert max-w-none">
                  <p className="text-gray-300 leading-relaxed">
                    {profileData.about}
                  </p>
                </div>
              </div>

              {/* Projects Section */}
              <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
                <h2 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  Projects
                  {isEditing && (
                    <button
                      onClick={() => setEditData({
                        ...editData,
                        projects: [...(editData.projects || []), {
                          title: "",
                          description: "",
                          link: ""
                        }]
                      })}
                      className="ml-auto p-1 rounded-lg bg-green-600/20 hover:bg-green-600/30 transition-colors"
                    >
                      <Plus className="w-4 h-4 text-green-400" />
                    </button>
                  )}
                </h2>
                {isEditing ? (
                  <div className="space-y-4">
                    {editData.projects?.map((project, index) => (
                      <div key={index} className="bg-white/5 rounded-lg p-4 space-y-3">
                        <div className="flex justify-between items-start">
                          <h4 className="text-sm font-medium text-gray-300">Project #{index + 1}</h4>
                          <button
                            onClick={() => {
                              const newProjects = editData.projects?.filter((_, i) => i !== index) || [];
                              setEditData({ ...editData, projects: newProjects });
                            }}
                            className="p-1 rounded-lg bg-red-600/20 hover:bg-red-600/30 transition-colors"
                          >
                            <Trash2 className="w-3 h-3 text-red-400" />
                          </button>
                        </div>
                        <div className="space-y-2">
                          <input
                            type="text"
                            value={project.title}
                            onChange={(e) => {
                              const newProjects = [...(editData.projects || [])];
                              newProjects[index] = { ...newProjects[index], title: e.target.value };
                              setEditData({ ...editData, projects: newProjects });
                            }}
                            placeholder="Project Title (e.g., Postman Clone)"
                            className="w-full p-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-green-500 transition-colors"
                          />
                          <textarea
                            value={project.description || ""}
                            onChange={(e) => {
                              const newProjects = [...(editData.projects || [])];
                              newProjects[index] = { ...newProjects[index], description: e.target.value };
                              setEditData({ ...editData, projects: newProjects });
                            }}
                            placeholder="Project Description"
                            rows={3}
                            className="w-full p-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 resize-none focus:outline-none focus:border-green-500 transition-colors"
                          />
                          <input
                            type="url"
                            value={project.link || ""}
                            onChange={(e) => {
                              const newProjects = [...(editData.projects || [])];
                              newProjects[index] = { ...newProjects[index], link: e.target.value };
                              setEditData({ ...editData, projects: newProjects });
                            }}
                            placeholder="Project Link (optional)"
                            className="w-full p-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-green-500 transition-colors"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="grid gap-4">
                    {profileData.projects.map((project, index) => (
                      <div
                        key={index}
                        className="group bg-gradient-to-br from-white/5 to-white/10 border border-white/10 rounded-xl p-6 hover:from-white/10 hover:to-white/15 transition-all duration-300"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h3 className="text-lg font-semibold text-white mb-2">{project.title}</h3>
                            <p className="text-gray-300 mb-3">{project.description}</p>
                          </div>
                          {project.link && (
                            <a
                              href={project.link}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors opacity-0 group-hover:opacity-100"
                            >
                              <ExternalLink className="w-4 h-4 text-white" />
                            </a>
                          )}
                        </div>
                        {project.link && (
                          <a
                            href={project.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm text-purple-400 hover:text-purple-300 transition-colors"
                          >
                            View Project →
                          </a>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

        </div>
      </div>
      </AuthenticatedRoute>
    </>
  );
}