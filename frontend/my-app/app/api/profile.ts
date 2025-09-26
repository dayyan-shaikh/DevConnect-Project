import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axiosInstance from "./axios";

// Profile data types
export interface Education {
  id?: string;
  degree: string;
  institution: string;
  startYear?: number;
  endYear?: number;
}

export interface Project {
  id?: string;
  title: string;
  description?: string;
  link?: string;
}

export interface SocialLinks {
  github?: string;
  linkedin?: string;
  twitter?: string;
  website?: string;
}

export interface Profile {
  id: string;
  user_id: string;
  name: string;
  title?: string;
  location?: string;
  avatar?: string;
  experience?: string;
  availability?: string;
  about?: string;
  education: Education[];
  skills: string[];
  projects: Project[];
  socialLinks: SocialLinks;
}

export interface PaginatedProfilesResponse {
  data: Profile[];
  nextCursor: string | null;
  hasNextPage: boolean;
}

export interface UpdateProfileDto {
  name?: string;
  title?: string;
  location?: string;
  avatar?: string;
  experience?: string;
  availability?: string;
  about?: string;
  education?: Education[];
  skills?: string[];
  projects?: Project[];
  socialLinks?: SocialLinks;
}

// API functions
const profileApi = {
  getProfile: async (profileId: string): Promise<Profile> => {
    const response = await axiosInstance.get(`/profile/${profileId}`);
    return response.data;
  },

  getAllProfiles: async (cursor?: string, limit: number = 25): Promise<PaginatedProfilesResponse> => {
    const params = new URLSearchParams();
    if (cursor) params.append('cursor', cursor);
    params.append('limit', limit.toString());
    
    const response = await axiosInstance.get(`/profile?${params.toString()}`);
    return response.data;
  },

  getProfileByUserId: async (userId: string): Promise<Profile> => {
    // First try to get existing profile by user_id
    try {
      const response = await axiosInstance.get(`/profile/user/${userId}`);
      return response.data;
    } catch (error) {
      // If profile doesn't exist, create one first
      await profileApi.createProfile(userId);
      const response = await axiosInstance.get(`/profile/user/${userId}`);
      return response.data;
    }
  },

  updateProfile: async (profileId: string, data: UpdateProfileDto): Promise<Profile> => {
    const response = await axiosInstance.put(`/profile/${profileId}`, data);
    return response.data;
  },

  createProfile: async (userId: string): Promise<Profile> => {
    const response = await axiosInstance.post(`/profile/${userId}`);
    return response.data;
  },
};

// React Query hooks
export const useProfile = (profileId: string) => {
  return useQuery({
    queryKey: ["profile", profileId],
    queryFn: () => profileApi.getProfile(profileId),
    enabled: !!profileId,
  });
};

export const useAllProfiles = () => {
  return useQuery({
    queryKey: ['profiles'],
    queryFn: async () => {
      // Fetch all profiles by handling pagination internally
      let allProfiles: Profile[] = [];
      let cursor: string | null = null;
      let hasNextPage = true;

      while (hasNextPage) {
        const response = await profileApi.getAllProfiles(cursor || undefined, 25);
        allProfiles = [...allProfiles, ...response.data];
        cursor = response.nextCursor;
        hasNextPage = response.hasNextPage;
      }

      return allProfiles;
    },
  });
};

export const useProfileByUserId = (userId: string) => {
  return useQuery({
    queryKey: ["profile", "user", userId],
    queryFn: () => profileApi.getProfileByUserId(userId),
    enabled: !!userId,
  });
};

export const useUpdateProfile = (
  onSuccess?: (data: Profile) => void,
  onError?: (error: any) => void
) => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ profileId, data }: { profileId: string; data: UpdateProfileDto }) =>
      profileApi.updateProfile(profileId, data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["profile", data.id] });
      onSuccess?.(data);
    },
    onError,
  });
};

export const useCreateProfile = (
  onSuccess?: (data: Profile) => void,
  onError?: (error: any) => void
) => {
  return useMutation({
    mutationFn: (userId: string) => profileApi.createProfile(userId),
    onSuccess,
    onError,
  });
};
