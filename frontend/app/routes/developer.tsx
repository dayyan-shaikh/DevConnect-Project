import { useState, useEffect, useMemo } from "react";
import { Search, MapPin, Star, Github, Linkedin, Mail, Code, Users, Award } from "lucide-react";
import { FloatingCard, AnimatedInput, SparklesBackground } from "../components/ui/aceternity";
import { motion } from "framer-motion";
import { cn } from "../lib/utils";
import { Navbar } from "../components/Navbar";
import { useAllProfiles, type Profile } from "../api/profile";
import { LoadingSpinner } from "../components/LoadingSpinner";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "../components/ui/pagination";

const generateAvatar = (name: string) => {
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=6366f1&color=fff&size=150`;
};

import { useNavigate } from 'react-router';

const DeveloperCard = ({ developer, delay }: { developer: Profile; delay: number }) => {
  const navigate = useNavigate();

  const handleCardClick = () => {
    navigate(`/profile?id=${developer.id}`);
  };

  return (
    <div 
      className="cursor-pointer" 
      onClick={handleCardClick}
    >
      <FloatingCard className="p-6 h-full bg-gray-900/80 border-gray-700/50 hover:border-blue-500/50 transition-colors" delay={delay}>
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-start gap-4 mb-4">
            <div className="relative">
              <img
                src={developer.avatar || generateAvatar(developer.name)}
                alt={developer.name}
                className="w-16 h-16 rounded-full object-cover border-2 border-white/50"
              />
              <div className={cn(
                "absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white",
                developer.availability === "Available" ? "bg-green-500" : "bg-yellow-500"
              )} />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-lg text-white truncate">{developer.name}</h3>
              <p className="text-blue-600 font-medium">{developer.title}</p>
              <div className="flex items-center gap-1 text-sm text-gray-300 mt-1">
                <MapPin className="w-4 h-4" />
                <span>{developer.location}</span>
              </div>
            </div>
          </div>

          {/* About */}
          {developer.about && (
            <p className="text-gray-300 text-sm mb-4 line-clamp-3">{developer.about}</p>
          )}

          {/* Skills */}
          <div className="mb-4">
            <div className="flex flex-wrap gap-2">
              {developer.skills.slice(0, 4).map((skill, index) => (
                <span
                  key={skill}
                  className="px-2 py-1 bg-blue-900/50 text-blue-300 text-xs rounded-full font-medium"
                >
                  {skill}
                </span>
              ))}
              {developer.skills.length > 4 && (
                <span className="px-2 py-1 bg-gray-700 text-gray-300 text-xs rounded-full font-medium">
                  +{developer.skills.length - 4} more
                </span>
              )}
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
            <div className="flex items-center gap-2">
              <Code className="w-4 h-4 text-gray-400" />
              <span className="text-gray-300">{developer.experience || "Not specified"}</span>
            </div>
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-gray-400" />
              <span className="text-gray-300">{developer.projects.length} projects</span>
            </div>
          </div>

          {/* Rate and Availability */}
          <div className="flex items-center justify-between mb-4">
            <span className={cn(
              "px-3 py-1 rounded-full text-sm font-medium",
              developer.availability === "Available" 
                ? "bg-green-900/50 text-green-300" 
                : "bg-yellow-900/50 text-yellow-300"
            )}>
              {developer.availability}
            </span>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3 mt-auto pt-4 border-t border-gray-700/50">
            {/* Social Links */}
            <div className="flex gap-3 items-center">
              {developer.socialLinks?.github && (
                <a
                  href={developer.socialLinks.github}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center w-8 h-8 bg-gray-800 hover:bg-gray-700 rounded-full transition-colors"
                >
                  <Github className="w-4 h-4 text-gray-300" />
                </a>
              )}
              {developer.socialLinks?.linkedin && (
                <a
                  href={developer.socialLinks.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center w-8 h-8 bg-blue-600 hover:bg-blue-700 rounded-full transition-colors"
                >
                  <Linkedin className="w-4 h-4 text-white" />
                </a>
              )}
            </div>
            <motion.button
              className="ml-auto px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={(e) => {
                e.stopPropagation();
                navigate(`/profile?id=${developer.id}`);
              }}
            >
              View Profile
            </motion.button>
          </div>
        </div>
      </FloatingCard>
    </div>
  );
};

const ITEMS_PER_PAGE = 15;

export default function DeveloperPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  
  const { data: profiles, isLoading, error } = useAllProfiles();

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedSkills]);

  // Get all unique skills from profiles
  const allSkills = Array.from(new Set(profiles?.flatMap((profile: Profile) => profile.skills) || []));

  // Filter profiles based on search and skills
  const filteredDevelopers = useMemo(() => {
    return profiles?.filter((profile: Profile) => {
      const matchesSearch = profile.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (profile.title?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
                          (profile.location?.toLowerCase() || "").includes(searchTerm.toLowerCase());
      
      const matchesSkills = selectedSkills.length === 0 || 
                          selectedSkills.every((skill: string) => 
                            profile.skills.some((devSkill: string) => 
                              devSkill.toLowerCase().includes(skill.toLowerCase())
                            )
                          );
      
      return matchesSearch && matchesSkills;
    }) || [];
  }, [profiles, searchTerm, selectedSkills]);

  // Pagination logic
  const totalPages = Math.ceil(filteredDevelopers.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedDevelopers = filteredDevelopers.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const toggleSkill = (skill: string) => {
    setSelectedSkills(prev =>
      prev.includes(skill)
        ? prev.filter(s => s !== skill)
        : [...prev, skill]
    );
  };

  if (isLoading) {
    return (
      <SparklesBackground>
        <Navbar />
        <div className="w-full px-6 py-8 pt-20 flex justify-center items-center min-h-screen">
          <LoadingSpinner />
        </div>
      </SparklesBackground>
    );
  }

  if (error) {
    return (
      <SparklesBackground>
        <Navbar />
        <div className="w-full px-6 py-8 pt-20 flex justify-center items-center min-h-screen">
          <div className="text-center">
            <p className="text-red-400 text-lg mb-4">Failed to load developers</p>
            <p className="text-gray-300">Please try again later</p>
          </div>
        </div>
      </SparklesBackground>
    );
  }

  return (
    <SparklesBackground>
      <Navbar />
      <div className="w-full px-6 py-8 pt-20">
        {/* Header */}
        <motion.div
          className="text-center mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="text-4xl font-bold text-white mb-4">Find Developers</h1>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Connect with talented developers from around the world. Find the perfect match for your project.
          </p>
        </motion.div>

        {/* Search and Filters */}
        <motion.div
          className="mx-auto mb-8 px-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <div className="bg-gray-900/80 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-gray-700/50">
            {/* Search Bar */}
            <div className="mb-6">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search developers by name, title, or location..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-gray-800/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Skill Filters */}
            <div>
              <h3 className="text-sm font-medium text-gray-300 mb-3">Filter by Skills:</h3>
              <div className="flex flex-wrap gap-2">
                {allSkills.map((skill) => (
                  <motion.button
                    key={skill}
                    onClick={() => toggleSkill(skill)}
                    className={cn(
                      "px-3 py-1 rounded-full text-sm font-medium transition-colors",
                      selectedSkills.includes(skill)
                        ? "bg-blue-600 text-white"
                        : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                    )}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    {skill}
                  </motion.button>
                ))}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Results Count */}
        <motion.div
          className="w-full mx-auto mb-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <p className="text-gray-300">
            Showing {filteredDevelopers.length} developer{filteredDevelopers.length !== 1 ? 's' : ''}
            {selectedSkills.length > 0 && (
              <span> with skills: {selectedSkills.join(', ')}</span>
            )}
          </p>
        </motion.div>

        {/* Developer Cards Grid */}
        <div className="w-full mx-auto">
          {filteredDevelopers.length > 0 ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                {paginatedDevelopers.map((developer, index) => (
                  <DeveloperCard
                    key={developer.id}
                    developer={developer}
                    delay={(index % 3) * 0.1}
                  />
                ))}
              </div>
              
              {/* Pagination */}
              {totalPages > 1 && (
                <div className="mt-8">
                  <Pagination>
                    <PaginationContent className="flex-wrap gap-1">
                      <PaginationItem className="mr-2">
                        <PaginationPrevious 
                          onClick={() => {
                            if (currentPage > 1) handlePageChange(currentPage - 1);
                          }}
                          className={cn(
                            currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer hover:bg-gray-700",
                            "px-4 py-2 rounded-md transition-colors"
                          )}
                        />
                      </PaginationItem>
                      
                      {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                        // Show first 2 pages, last 2 pages, and current page with neighbors
                        let pageNum;
                        if (totalPages <= 5) {
                          pageNum = i + 1;
                        } else if (currentPage <= 3) {
                          pageNum = i + 1;
                        } else if (currentPage >= totalPages - 2) {
                          pageNum = totalPages - 4 + i;
                        } else {
                          pageNum = currentPage - 2 + i;
                        }
                        
                        return (
                          <PaginationItem key={pageNum}>
                            <PaginationLink 
                              onClick={() => handlePageChange(pageNum)}
                              isActive={currentPage === pageNum}
                              className={cn(
                                currentPage === pageNum 
                                  ? "bg-blue-600 text-white" 
                                  : "hover:bg-gray-700 text-gray-300",
                                "cursor-pointer px-4 py-2 rounded-md transition-colors"
                              )}
                            >
                              {pageNum}
                            </PaginationLink>
                          </PaginationItem>
                        );
                      })}
                      
                      {totalPages > 5 && currentPage < totalPages - 2 && (
                        <PaginationItem>
                          <PaginationEllipsis />
                        </PaginationItem>
                      )}
                      
                      <PaginationItem>
                        <PaginationNext 
                          onClick={() => {
                            if (currentPage < totalPages) handlePageChange(currentPage + 1);
                          }}
                          className={cn(
                            currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer hover:bg-gray-700",
                            "px-4 py-2 rounded-md transition-colors"
                          )}
                        />
                      </PaginationItem>
                    </PaginationContent>
                  </Pagination>
                  
                  <div className="text-center mt-2 text-sm text-gray-400">
                    Page {currentPage} of {totalPages} • {filteredDevelopers.length} total developers
                  </div>
                </div>
              )}
            </>
          ) : (
            <motion.div
              className="text-center py-12"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className="text-gray-500 mb-4">
                <Users className="w-16 h-16 mx-auto" />
              </div>
              <h3 className="text-xl font-semibold text-gray-300 mb-2">No developers found</h3>
              <p className="text-gray-400">
                Try adjusting your search criteria or removing some skill filters.
              </p>
            </motion.div>
          )}
        </div>
      </div>
    </SparklesBackground>
  );
}
