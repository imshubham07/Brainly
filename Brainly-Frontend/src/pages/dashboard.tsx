import { useEffect, useState } from "react";
import { Button } from "../components/Button";
import { Card } from "../components/Card";
import { CreateContentModal } from "../components/CreateContentModal";
import { PlusIcon } from "../icons/PlusIcon";
import { ShareIcon } from "../icons/ShareIcon";
import { Sidebar } from "../components/Sidebar";
import { useContent } from "../hooks/useContent";
import { BACKEND_URL } from "../config";
import axios from "axios";

// Define the Content interface based on the backend model
interface Content {
  _id: string; // MongoDB document ID
  id?: string;
  link?: string;
  type: "youtube" | "x" | "instagram" | "linkedin" | "github"; // Updated to match exact types
  userId: string | { username: string }; // Could be populated with user object
  tag: string[]; // Using tag as per backend implementation
  createdAt?: string;
}

// Interface for liked content and notes
interface LikedContentMap {
  [key: string]: boolean;
}

interface ContentNotesMap {
  [key: string]: string;
}

export function Dashboard() {
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const { contents = [], refresh } = useContent() || {};
  const [likedContent, setLikedContent] = useState<LikedContentMap>({});
  const [activeNoteId, setActiveNoteId] = useState<string | null>(null);
  const [contentNotes, setContentNotes] = useState<ContentNotesMap>({});
  const [isShared, setIsShared] = useState<boolean>(false);
  const [shareUrl, setShareUrl] = useState<string>("");
  const [showShareCard, setShowShareCard] = useState<boolean>(false);
  const [activeFilter, setActiveFilter] = useState<string>("All");
  
  // Function to convert sidebar item to filter type
  const getFilterType = (item: string): string => {
    switch(item) {
      case "All": return "All";
      case "Twitter": return "x";
      case "YouTube": return "youtube";
      case "Instagram": return "instagram";
      case "LinkedIn": return "linkedin";
      case "GitHub": return "github";
      default: return "All";
    }
  };
  
  // Filter content based on active filter and search term
  const filteredContents = Array.isArray(contents) ? contents.filter(content => {
    // Check if content matches the active platform filter
    const filterType = getFilterType(activeFilter);
    const matchesPlatform = filterType === "All" || 
      content.type?.toLowerCase() === filterType.toLowerCase();
    
    // Check if content matches the search term
    const matchesSearch = !searchTerm || 
      (content.link && content.link.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (content.tag && content.tag.some(t => t.toLowerCase().includes(searchTerm.toLowerCase())));
    
    return matchesPlatform && matchesSearch;
  }) : [];
  
  useEffect(() => {
    const loadContent = async () => {
      setIsLoading(true);
      await refresh();
      setIsLoading(false);
    };
    
    loadContent();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [modalOpen]);
  
  // Initialize liked status and notes from localStorage on component mount
  useEffect(() => {
    try {
      const savedLikes = localStorage.getItem('likedContent');
      if (savedLikes) {
        setLikedContent(JSON.parse(savedLikes));
      }
      
      const savedNotes = localStorage.getItem('contentNotes');
      if (savedNotes) {
        setContentNotes(JSON.parse(savedNotes));
      }

      // Check if brain is currently shared
      checkBrainShareStatus();
    } catch (e) {
      console.error("Error loading saved data:", e);
    }
  }, []);

  // Check if brain is currently shared
  const checkBrainShareStatus = async () => {
    try {
      // Try to fetch the user's sharing status directly
      const response = await axios.get(
        `${BACKEND_URL}/api/v1/brain/share/status`,
        { headers: { "Authorization": localStorage.getItem("token") || "" } }
      );
      
      // If the API response indicates sharing is enabled and has a hash
      if (response.data.isShared && response.data.hash) {
        const hash = response.data.hash;
        localStorage.setItem("brainShareHash", hash);
        setIsShared(true);
        setShareUrl(`${window.location.origin}/share/${hash}`);
      } else {
        // If not shared, clear local storage
        localStorage.removeItem("brainShareHash");
        setIsShared(false);
        setShareUrl("");
      }
    } catch (error) {
      console.error("Error checking brain share status:", error);
      
      // Fallback to localStorage if API fails
      const hash = localStorage.getItem("brainShareHash");
      if (hash) {
        setIsShared(true);
        setShareUrl(`${window.location.origin}/share/${hash}`);
      } else {
        setIsShared(false);
      }
    }
  };

  // Toggle brain sharing
  const toggleBrainShare = async () => {
    try {
      const action = !isShared;
      const response = await axios.post(
        `${BACKEND_URL}/api/v1/brain/share`, 
        { share: action },
        { headers: { "Authorization": localStorage.getItem("token") || "" } }
      );

      if (action && response.data.hash) {
        const hash = response.data.hash;
        localStorage.setItem("brainShareHash", hash);
        const newShareUrl = `${window.location.origin}/share/${hash}`;
        setShareUrl(newShareUrl);
        setIsShared(true);
        
        // Copy to clipboard
        await navigator.clipboard.writeText(newShareUrl);
        setShowShareCard(true);
        setTimeout(() => setShowShareCard(false), 5000);
      } else {
        localStorage.removeItem("brainShareHash");
        setShareUrl("");
        setIsShared(false);
      }
    } catch (error) {
      console.error("Error toggling brain share:", error);
      alert("Failed to update sharing settings. Please try again.");
    }
  };

  // Helper functions to extract information from links
  const getLinkType = (link?: string): "youtube" | "x" | "instagram" | "linkedin" | "github" => {
    if (!link) return "x"; // Default type
    
    if (link.includes("youtube.com") || link.includes("youtu.be")) {
      return "youtube";
    } else if (link.includes("twitter.com") || link.includes("x.com")) {
      return "x";
    } else if (link.includes("instagram.com")) {
      return "instagram";
    } else if (link.includes("linkedin.com")) {
      return "linkedin";
    } else if (link.includes("github.com")) {
      return "github";
    }
    
    // Default to x if no match
    return "x";
  };
  
  // Function to get titles from links
  const getTitleFromLink = (link?: string, contentType?: string): string => {
    if (!link) return "Untitled";
    
    try {
      // For YouTube links, try to get a more friendly title
      if (contentType === "youtube" || link.includes("youtube.com") || link.includes("youtu.be")) {
        return "YouTube Video";
      }
      
      // For Twitter links, create a better title
      if (contentType === "x" || link.includes("twitter.com") || link.includes("x.com")) {
        // Extract username if possible
        const twitterMatch = link.match(/twitter\.com\/([^\/]+)/);
        const xMatch = link.match(/x\.com\/([^\/]+)/);
        const username = twitterMatch?.[1] || xMatch?.[1];
        
        if (username && username !== "status") {
          return `Tweet by @${username}`;
        }
        return "Twitter Post";
      }
      
      // Instagram title
      if (contentType === "instagram" || link.includes("instagram.com")) {
        // Extract username if possible
        const instagramMatch = link.match(/instagram\.com\/([^\/]+)/);
        const username = instagramMatch?.[1];
        
        if (username && username !== "p") {
          return `Instagram Post by @${username}`;
        }
        return "Instagram Post";
      }
      
      // LinkedIn title
      if (contentType === "linkedin" || link.includes("linkedin.com")) {
        return "LinkedIn Post";
      }
      
      // GitHub title
      if (contentType === "github" || link.includes("github.com")) {
        const repoMatch = link.match(/github\.com\/([^\/]+)\/([^\/]+)/);
        if (repoMatch) {
          return `${repoMatch[1]}/${repoMatch[2]} GitHub Repo`;
        }
        return "GitHub Repository";
      }
      
      // For other URLs, use the hostname and pathname
      const url = new URL(link.startsWith("http") ? link : `https://${link}`);
      const pathSegments = url.pathname.split("/").filter(segment => segment);
      
      if (pathSegments.length > 0) {
        const lastSegment = pathSegments[pathSegments.length - 1]
          .replace(/-/g, " ")
          .replace(/_/g, " ")
          .replace(/\.\w+$/, ""); // Remove file extension
        
        // Capitalize first letter of each word
        return lastSegment
          .split(" ")
          .map(word => word.charAt(0).toUpperCase() + word.slice(1))
          .join(" ");
      }
      
      return url.hostname.replace("www.", "").charAt(0).toUpperCase() + url.hostname.replace("www.", "").slice(1);
    } catch (e) {
      // If parsing fails, just return the link or part of it
      const shortLink = link.length > 30 ? link.substring(0, 30) + "..." : link;
      return shortLink;
    }
  };

  // Handle liking/unliking content
  const handleLikeClick = (contentId: string) => {
    setLikedContent(prevLiked => {
      const newLikedContent = { 
        ...prevLiked,
        [contentId]: !prevLiked[contentId]
      };
      
      // Save to localStorage
      localStorage.setItem('likedContent', JSON.stringify(newLikedContent));
      return newLikedContent;
    });
  };
  
  // Handle note clicks to manage note entry
  const handleNoteClick = (contentId: string) => {
    // Simple implementation: toggle note editing for this content
    if (activeNoteId === contentId) {
      setActiveNoteId(null);
    } else {
      setActiveNoteId(contentId);
      // If there's no existing note, prompt for one
      if (!contentNotes[contentId]) {
        const note = prompt("Add a note for this content:");
        if (note) {
          setContentNotes(prevNotes => {
            const newNotes = { ...prevNotes, [contentId]: note };
            localStorage.setItem('contentNotes', JSON.stringify(newNotes));
            return newNotes;
          });
        }
      }
    }
  };
  
  // Fixed: Handle deleting content - updated to use DELETE method
  const handleDeleteClick = async (contentId: string) => {
    if (window.confirm("Are you sure you want to delete this content?")) {
      try {
        // Use DELETE method as per backend API design
        await axios.delete(`${BACKEND_URL}/api/v1/content/${contentId}`, {
          headers: { "Authorization": localStorage.getItem("token") || "" }
        });
        
        // Remove content from local state
        setLikedContent(prevLiked => {
          const newLikedContent = { ...prevLiked };
          delete newLikedContent[contentId];
          localStorage.setItem('likedContent', JSON.stringify(newLikedContent));
          return newLikedContent;
        });
        
        setContentNotes(prevNotes => {
          const newNotes = { ...prevNotes };
          delete newNotes[contentId];
          localStorage.setItem('contentNotes', JSON.stringify(newNotes));
          return newNotes;
        });
        
        // Refresh content list
        refresh();
      } catch (error) {
        console.error("Error deleting content:", error);
        alert("Failed to delete content. Please try again.");
      }
    }
  };

  // Format date for display
  const formatDate = (dateString?: string): string => {
    if (!dateString) return "Recently added";
    
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric' 
      });
    } catch (e) {
      return "Unknown date";
    }
  };

  // Get the heading based on active filter
  const getFilterHeading = () => {
    if (activeFilter === "All") return "Your Content";
    return `${activeFilter} Content`;
  };

  return (
    <div className="flex bg-gray-50 min-h-screen">
      <Sidebar 
        activeItem={activeFilter}
        setActiveItem={setActiveFilter}
      />
      
      <div className="flex-1 ml-64 p-6">
        <CreateContentModal open={modalOpen} onClose={() => setModalOpen(false)} />
        
        {/* Share notification card */}
        {showShareCard && (
          <div className="fixed top-6 right-6 bg-white shadow-lg rounded-lg p-4 z-50 w-96 border-l-4 border-green-500 animate-fadeIn">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-800">Brain Shared Successfully!</h3>
                <p className="text-sm text-gray-600 mt-1">Link copied to clipboard:</p>
                <div className="mt-2 p-2 bg-gray-100 rounded-md flex items-center justify-between">
                  <div className="text-sm text-gray-800 truncate">{shareUrl}</div>
                  <button 
                    onClick={async () => {
                      await navigator.clipboard.writeText(shareUrl);
                      alert("Link copied again!");
                    }}
                    className="ml-2 p-1 text-blue-500 hover:text-blue-700"
                    title="Copy link"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                  </button>
                </div>
              </div>
              <button 
                onClick={() => setShowShareCard(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        )}
        
        {/* Header section */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold text-gray-800">{getFilterHeading()}</h1>
            <div className="flex gap-3">
              <Button 
                onClick={() => setModalOpen(true)} 
                variant="primary" 
                text="Add content" 
                startIcon={<PlusIcon />} 
              />
              <Button 
                onClick={toggleBrainShare} 
                variant={isShared ? "danger" : "secondary"} 
                text={isShared ? "Unshare brain" : "Share brain"} 
                startIcon={<ShareIcon />} 
              />
            </div>
          </div>
          
          {/* Search bar */}
          <div className="relative">
            <input
              type="text"
              placeholder="Search content..."
              className="w-full p-3 pl-10 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <svg 
              className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" 
              xmlns="http://www.w3.org/2000/svg" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>
        
        {/* Content area */}
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : filteredContents.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredContents.map((content) => {
              const contentId = content._id || "";
              
              // Make sure we get the right content type
              let contentType = content.type || getLinkType(content.link);
              
              // Handle legacy 'twitter' type by converting to 'x'
              if (contentType === "twitter") {
                contentType = "x";
              }
              
              // Generate title from link since backend doesn't store title
              const finalTitle = getTitleFromLink(content.link, contentType);
              
              return (
                <Card
                  key={contentId}
                  title={finalTitle}
                  link={content.link}
                  type={contentType}
                  createdAt={formatDate(content.createdAt)}
                  tags={content.tag || []}  // Use tag as per backend
                  notes={contentNotes[contentId]}
                  onNoteClick={() => handleNoteClick(contentId)}
                  onLikeClick={() => handleLikeClick(contentId)}
                  onDeleteClick={() => handleDeleteClick(contentId)}
                  isLiked={!!likedContent[contentId]}
                />
              );
            })}
          </div>
        ) : (
          <div className="text-center py-16 bg-white rounded-lg shadow-sm">
            <svg 
              className="mx-auto h-12 w-12 text-gray-400" 
              xmlns="http://www.w3.org/2000/svg" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
            </svg>
            <h3 className="mt-2 text-lg font-medium text-gray-900">
              {searchTerm 
                ? "No matching content found" 
                : activeFilter !== "All" 
                  ? `No ${activeFilter} content found` 
                  : "No content yet"}
            </h3>
            <p className="mt-1 text-gray-500">
              {searchTerm 
                ? "Try using different keywords or clear your search" 
                : activeFilter !== "All"
                  ? `Try adding ${activeFilter} content with the "Add content" button`
                  : "Get started by adding your first content item"}
            </p>
            {searchTerm && (
              <button
                className="mt-4 text-blue-500 hover:text-blue-700"
                onClick={() => setSearchTerm("")}
              >
                Clear search
              </button>
            )}
            {activeFilter !== "All" && (
              <button
                className="mt-4 ml-4 text-blue-500 hover:text-blue-700"
                onClick={() => setActiveFilter("All")}
              >
                Show all content
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}