import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Card } from "../components/Card";
import { BACKEND_URL } from "../config";
import axios from "axios";

interface Content {
  _id: string;
  link?: string;
  type: "youtube" | "x" | "instagram" | "linkedin" | "github";
  tag: string[];
  createdAt?: string;
}

export function SharedBrain() {
  const { hash } = useParams<{ hash: string }>();
  const [contents, setContents] = useState<Content[]>([]);
  const [username, setUsername] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchSharedContent = async () => {
      try {
        // Updated endpoint to match backend implementation
        const response = await axios.get(`${BACKEND_URL}/api/v1/brain/${hash}`);
        
        // Update to match backend response structure
        setContents(response.data.content);
        setUsername(response.data.username || "User");
      } catch (error) {
        console.error("Error fetching shared content:", error);
        alert("Invalid or expired share link");
      } finally {
        setIsLoading(false);
      }
    };

    fetchSharedContent();
  }, [hash]);

  const formatDate = (dateString?: string) => {
    if (!dateString) return "Recently added";
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };
  
  // Function to get titles from links (copied from dashboard.tsx)
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
  
  // Helper function to determine content type from link (copied from dashboard.tsx)
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

  return (
    <div className="flex bg-gray-50 min-h-screen p-6">
      <div className="flex-1 max-w-7xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">Shared Brain</h1>
        <p className="text-gray-600 mb-6">Content shared by {username}</p>
        
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : contents.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {contents.map((content) => {
              // Fix contentType calculation
              const contentType = content.type || getLinkType(content.link);
              // Fix title calculation
              const finalTitle = getTitleFromLink(content.link, contentType);
              
              return (
                <Card
                  key={content._id}
                  title={finalTitle}
                  link={content.link}
                  type={contentType}
                  createdAt={formatDate(content.createdAt)}
                  tags={content.tag || []}
                  isPublic={true} // This hides interactive buttons
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
            <h3 className="mt-2 text-lg font-medium text-gray-900">No shared content found</h3>
            <p className="mt-1 text-gray-500">This share link may be invalid or expired</p>
          </div>
        )}
      </div>
    </div>
  );
}