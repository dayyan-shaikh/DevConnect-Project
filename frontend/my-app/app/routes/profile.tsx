import { useState, useEffect } from "react";
import { useSearchParams, Link } from "react-router";
import { AuthenticatedRoute } from "../components/ProtectedRoute";
import { Navbar } from "../components/Navbar";
import {
  Calendar, ExternalLink, Github, Linkedin, Twitter, Globe,
  Edit3, Loader2, Save, X, Plus, Trash2, MessageCircle, Camera
} from "lucide-react";
import { AvatarUpload } from "../components/ui/avatar-upload";
import {
  useProfile,
  useProfileByUserId,
  useUpdateProfile,
  useUploadAvatar,
  type Profile,
  type UpdateProfileDto
} from "../api/profile";
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
  const [profileToFetch, setProfileToFetch] = useState<{ type: "id" | "userId"; value: string | null }>({ type: "userId", value: null });

  // Fetch current user ID once on mount
  useEffect(() => {
    const userId = getCurrentUserId();
    setCurrentUserId(userId);

    const idFromUrl = searchParams.get("id");
    if (idFromUrl) {
      setProfileToFetch({ type: "id", value: idFromUrl });
    } else {
      setProfileToFetch({ type: "userId", value: userId });
    }
  }, [searchParams]);

  const isCurrentUser = profileToFetch.type === "userId";

  const { data: profileData, isLoading, error } =
    profileToFetch.type === "id" && profileToFetch.value
      ? useProfile(profileToFetch.value)
      : useProfileByUserId(profileToFetch.value || "");

  const updateProfileMutation = useUpdateProfile(
    () => {
      toast.success("Profile updated successfully!");
      setIsEditing(false);
      setEditData({});
    },
    () => toast.error("Failed to update profile.")
  );

  // ✅ Avatar upload mutation
  const uploadAvatarMutation = useUploadAvatar(
    (data) => {
      toast.success("Profile picture updated!");
      setEditData((prev) => ({ ...prev, avatar: data.avatar }));
    },
    () => toast.error("Failed to upload profile image.")
  );

  // Initialize editable data
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
        socialLinks: { ...profileData.socialLinks },
      });
    }
  }, [isEditing, profileData]);

  const handleSave = () => {
    if (!profileData?.id) return;
    updateProfileMutation.mutate({ profileId: profileData.id, data: editData });
  };

  const handleAvatarUploadSuccess = (updatedProfile: Profile) => {
    setEditData((prev) => ({
      ...prev,
      avatar: updatedProfile.avatar,
    }));
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditData({});
  };

  if (isLoading || !profileToFetch.value) {
    return (
      <AuthenticatedRoute>
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white">
          <Loader2 className="animate-spin mr-2" /> Loading profile...
        </div>
      </AuthenticatedRoute>
    );
  }

  if (error || !profileData) {
    return (
      <AuthenticatedRoute>
        <div className="min-h-screen flex items-center justify-center text-white bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
          Failed to load profile data.
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

                  {isCurrentUser ? (
                    <div className="relative group">
                      <AvatarUpload
                        profileId={profileData.id}
                        currentAvatar={profileData.avatar}
                        name={profileData.name}
                        onUploadSuccess={handleAvatarUploadSuccess}
                        className="cursor-pointer"
                        size="lg"
                      />
                    </div>
                  ) : (
                    <div className="relative">
                      <div className="w-32 h-32 rounded-full bg-gradient-to-br from-purple-600/20 to-blue-600/20 flex items-center justify-center overflow-hidden border-2 border-white/10">
                        {profileData.avatar ? (
                          <img
                            src={profileData.avatar}
                            alt={profileData.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <span className="text-4xl font-bold text-white/60">
                            {profileData.name?.charAt(0).toUpperCase() || 'U'}
                          </span>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Profile Info */}
                  <div className="flex-1">
                    <div className="flex items-start justify-between">
                      <div className="w-full">
                        {isEditing ? (
                          <input
                            type="text"
                            value={editData.name || ""}
                            onChange={(e) =>
                              setEditData({ ...editData, name: e.target.value })
                            }
                            placeholder="Your Name"
                            className="w-full p-3 mb-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-purple-500"
                          />
                        ) : (
                          <h1 className="text-3xl font-bold text-white mb-2">
                            {profileData.name}
                          </h1>
                        )}

                        {isEditing ? (
                          <input
                            type="text"
                            value={editData.title || ""}
                            onChange={(e) =>
                              setEditData({ ...editData, title: e.target.value })
                            }
                            placeholder="Your Title"
                            className="w-full p-3 mb-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-purple-500"
                          />
                        ) : (
                          profileData.title && (
                            <p className="text-blue-400 text-xl font-medium mb-2">
                              {profileData.title}
                            </p>
                          )
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
                    {isEditing && (
                      <button
                        onClick={() => setEditData({
                          ...editData,
                          about: profileData.about || ''
                        })}
                        className="ml-auto p-1 rounded-lg bg-yellow-600/20 hover:bg-yellow-600/30 transition-colors"
                      >
                        <Edit3 className="w-4 h-4 text-yellow-400" />
                      </button>
                    )}
                  </h2>
                  {isEditing && editData.about !== undefined ? (
                    <div className="space-y-2">
                      <textarea
                        value={editData.about}
                        onChange={(e) => setEditData({ ...editData, about: e.target.value })}
                        placeholder="Tell us about yourself..."
                        rows={5}
                        className="w-full p-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-yellow-500 transition-colors resize-none"
                      />
                    </div>
                  ) : (
                    <div className="prose prose-invert max-w-none">
                      <p className="text-gray-300 leading-relaxed whitespace-pre-line">
                        {profileData.about || "No about information provided."}
                      </p>
                    </div>
                  )}
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