import { useState, useEffect } from "react";

// Interface for props passed to EnhancedEmbedContent component
export interface EnhancedEmbedContentProps {
    link: string;        // URL to the content
    type: string;        // Type of content (youtube, instagram, x, linkedin, github)
    className?: string;  // Optional additional CSS classes
    isDashboard?: boolean; // Flag to indicate if rendering in dashboard
}

// YouTube helpers
function getYoutubeVideoId(url: string): string | null {
    const regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[7].length === 11) ? match[7] : null;
}

// Twitter/X helpers
function getTwitterId(url: string): string | null {
    const regex = /twitter\.com\/\w+\/status\/(\d+)/;
    const xRegex = /x\.com\/\w+\/status\/(\d+)/;
    
    const twitterMatch = url.match(regex);
    const xMatch = url.match(xRegex);
    
    return (twitterMatch && twitterMatch[1]) || (xMatch && xMatch[1]) || null;
}

// LinkedIn helpers
function getLinkedInPostId(url: string): string | null {
    const regex = /\/(?:posts|pulse)\/([A-Za-z0-9-]+)/;
    const match = url.match(regex);
    return match ? match[1] : null;
}

// GitHub helpers
function parseGitHubUrl(url: string): { owner: string, repo: string, path?: string } | null {
    const regex = /github\.com\/([^\/]+)\/([^\/]+)(?:\/tree\/[^\/]+\/(.+))?/;
    const match = url.match(regex);
    
    if (!match) return null;
    
    return {
        owner: match[1],
        repo: match[2],
        path: match[3] || ""
    };
}

// Instagram helpers
function getInstagramPostId(url: string): string | null {
    const regex = /instagram\.com\/p\/([^\/]+)/;
    const match = url.match(regex);
    return match ? match[1] : null;
}

// Main component for embedding content from various platforms
export function EnhancedEmbedContent({ link, type, className = "", isDashboard = false }: EnhancedEmbedContentProps) {
    const [isLoaded, setIsLoaded] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Load Twitter widget script if needed
    useEffect(() => {
        if (type === "x" && !window.twttr) {
            const script = document.createElement("script");
            script.src = "https://platform.twitter.com/widgets.js";
            script.charset = "utf-8";
            script.async = true;
            script.onload = () => {
                if (window.twttr) {
                    window.twttr.widgets.load();
                    setIsLoaded(true);
                }
            };
            script.onerror = () => {
                setError("Failed to load Twitter widget");
            };
            document.body.appendChild(script);
            return;
        }
        
        // If script already exists, try to load widgets
        if (type === "x" && window.twttr) {
            window.twttr.widgets.load();
            setIsLoaded(true);
        }
        
        // Load Instagram embed script if needed
        if (type === "instagram" && !window.instgrm) {
            const script = document.createElement("script");
            script.src = "//www.instagram.com/embed.js";
            script.async = true;
            script.onload = () => {
                if (window.instgrm) {
                    window.instgrm.Embeds.process();
                    setIsLoaded(true);
                }
            };
            script.onerror = () => {
                setError("Failed to load Instagram widget");
            };
            document.body.appendChild(script);
            return;
        }
        
        // If script already exists, try to process embeds
        if (type === "instagram" && window.instgrm) {
            window.instgrm.Embeds.process();
            setIsLoaded(true);
        }
    }, [type]);

    // Error state display
    if (error) {
        return (
            <div className={`embed-error p-4 bg-red-50 border border-red-200 rounded-md ${className}`}>
                <p className="text-red-500">{error}</p>
                <a 
                    href={link} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-blue-500 underline mt-2 inline-block"
                >
                    View on original site
                </a>
            </div>
        );
    }

    // YouTube Embed
    if (type === "youtube") {
        const videoId = getYoutubeVideoId(link);
        if (!videoId) {
            return (
                <div className={`embed-error p-4 bg-red-50 border border-red-200 rounded-md ${className}`}>
                    <p className="text-red-500">Invalid YouTube URL</p>
                    <a 
                        href={link} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-blue-500 underline mt-2 inline-block"
                    >
                        View on YouTube
                    </a>
                </div>
            );
        }
        
        // Dashboard preview for YouTube
        if (isDashboard) {
            return (
                <div className={`youtube-preview flex items-center p-2 border rounded-md ${className}`}>
                    <img 
                        src={`https://img.youtube.com/vi/${videoId}/mqdefault.jpg`}
                        alt="YouTube Thumbnail" 
                        className="w-24 h-16 rounded mr-3 object-cover"
                    />
                    <div>
                        <div className="font-medium text-sm">YouTube Video</div>
                        <a 
                            href={link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-blue-500 hover:underline"
                        >
                            {link.substring(0, 40)}...
                        </a>
                    </div>
                </div>
            );
        }
        
        // Full embed for YouTube
        return (
            <div className={`aspect-video ${className}`}>
                <iframe
                    className="w-full h-full rounded-md"
                    src={`https://www.youtube.com/embed/${videoId}`}
                    title="YouTube video player"
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    referrerPolicy="strict-origin-when-cross-origin"
                    allowFullScreen
                ></iframe>
            </div>
        );
    }

    // Twitter/X Embed
    if (type === "x") {
        const tweetId = getTwitterId(link);
        
        // Dashboard preview for Twitter/X
        if (isDashboard) {
            return (
                <div className={`x-preview flex items-center p-2 border rounded-md ${className}`}>
                    <div className="w-8 h-8 mr-3 flex items-center justify-center">
                        <svg viewBox="0 0 24 24" aria-hidden="true" fill="currentColor" className="text-gray-900">
                            <path d="M13.3174 10.7749L19.1457 4H17.7646L12.7039 9.88256L8.66193 4H4L10.1242 12.8955L4 20H5.38114L10.7357 13.7878L14.994 20H19.656L13.3174 10.7749ZM11.4308 12.9887L10.8113 12.0615L5.72112 4.95017H7.95657L12.0243 10.5587L12.6437 11.4859L18.0142 19.0498H15.7788L11.4308 12.9887Z" />
                        </svg>
                    </div>
                    <div>
                        <div className="font-medium text-sm">X Post</div>
                        <a 
                            href={link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-blue-500 hover:underline"
                        >
                            {link.substring(0, 40)}...
                        </a>
                    </div>
                </div>
            );
        }
        
        // Full embed for Twitter/X
        return (
            <div className={`x-embed min-h-[250px] ${className}`}>
                <blockquote className="twitter-tweet" data-conversation="none">
                    <a href={link}></a>
                </blockquote>
                {!isLoaded && (
                    <div className="flex justify-center items-center p-4">
                        <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-blue-500"></div>
                    </div>
                )}
            </div>
        );
    }

    // Instagram Embed
    if (type === "instagram") {
        const postId = getInstagramPostId(link);
        
        // Dashboard preview for Instagram
        if (isDashboard) {
            return (
                <div className={`instagram-preview flex items-center p-2 border rounded-md ${className}`}>
                    <div className="w-8 h-8 mr-3 flex items-center justify-center">
                        <svg viewBox="0 0 24 24" fill="currentColor" className="text-pink-500">
                            <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                        </svg>
                    </div>
                    <div>
                        <div className="font-medium text-sm">Instagram Post</div>
                        <a 
                            href={link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-blue-500 hover:underline"
                        >
                            {link.substring(0, 40)}...
                        </a>
                    </div>
                </div>
            );
        }
        
        // Full embed for Instagram
        return (
            <div className={`instagram-embed min-h-[450px] ${className}`}>
                <blockquote
                    className="instagram-media"
                    data-instgrm-captioned
                    data-instgrm-permalink={link}
                >
                    <a href={link}>View on Instagram</a>
                </blockquote>
                {!isLoaded && (
                    <div className="flex justify-center items-center p-4">
                        <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-pink-500"></div>
                    </div>
                )}
            </div>
        );
    }

    // LinkedIn Embed
    if (type === "linkedin") {
        const postId = getLinkedInPostId(link);
        
        // Dashboard preview for LinkedIn
        if (isDashboard) {
            return (
                <div className={`linkedin-preview flex items-center p-2 border rounded-md ${className}`}>
                    <div className="w-8 h-8 mr-3 flex items-center justify-center">
                        <svg viewBox="0 0 24 24" fill="currentColor" className="text-blue-700">
                            <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.32 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.79M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z" />
                        </svg>
                    </div>
                    <div>
                        <div className="font-medium text-sm">LinkedIn Post</div>
                        <a 
                            href={link}
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-xs text-blue-500 hover:underline"
                        >
                            {link.substring(0, 40)}...
                        </a>
                    </div>
                </div>
            );
        }
        
        if (!postId) {
            return (
                <div className={`embed-error p-4 bg-red-50 border border-red-200 rounded-md ${className}`}>
                    <p className="text-red-500">Invalid LinkedIn post URL</p>
                    <a 
                        href={link} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-blue-500 underline mt-2 inline-block"
                    >
                        View on LinkedIn
                    </a>
                </div>
            );
        }
        
        // Full embed for LinkedIn
        return (
            <div className={`linkedin-embed ${className}`}>
                <iframe
                    src={`https://www.linkedin.com/embed/feed/update/urn:li:share:${postId}`}
                    className="w-full min-h-96 rounded-md"
                    frameBorder="0"
                    allowFullScreen
                    title="LinkedIn Post"
                ></iframe>
            </div>
        );
    }

    // GitHub Repository Embed
    if (type === "github") {
        const repoInfo = parseGitHubUrl(link);
        
        // Dashboard preview for GitHub
        if (isDashboard) {
            return (
                <div className={`github-preview flex items-center p-2 border rounded-md ${className}`}>
                    <div className="w-8 h-8 mr-3 flex items-center justify-center">
                        <svg className="text-gray-800" viewBox="0 0 16 16" fill="currentColor">
                            <path fillRule="evenodd" d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"></path>
                        </svg>
                    </div>
                    <div>
                        <div className="font-medium text-sm">
                            {repoInfo ? `${repoInfo.owner}/${repoInfo.repo}` : "GitHub Repository"}
                        </div>
                        <a 
                            href={link}
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-xs text-blue-500 hover:underline"
                        >
                            {link.substring(0, 40)}...
                        </a>
                    </div>
                </div>
            );
        }
        
        if (!repoInfo) {
            return (
                <div className={`embed-error p-4 bg-red-50 border border-red-200 rounded-md ${className}`}>
                    <p className="text-red-500">Invalid GitHub URL</p>
                    <a 
                        href={link} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-blue-500 underline mt-2 inline-block"
                    >
                        View on GitHub
                    </a>
                </div>
            );
        }
        
        // Full embed for GitHub
        return (
            <div className={`github-embed border rounded-md p-4 ${className}`}>
                <div className="flex items-center mb-2">
                    <svg className="w-5 h-5 mr-2 text-gray-700" viewBox="0 0 16 16" fill="currentColor">
                        <path fillRule="evenodd" d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"></path>
                    </svg>
                    <a 
                        href={link} 
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-medium text-blue-600 hover:underline"
                    >
                        {repoInfo.owner}/{repoInfo.repo}
                    </a>
                </div>
                <div className="mt-2">
                    <a 
                        href={link} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-sm text-blue-500 hover:underline"
                    >
                        View Repository
                    </a>
                </div>
            </div>
        );
    }

    // Default case for unsupported types
    return (
        <div className={`unsupported-embed p-4 border rounded-md ${className}`}>
            <div className="mb-2 text-gray-700">
                Content from {type.charAt(0).toUpperCase() + type.slice(1)}
            </div>
            <a 
                href={link} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-blue-500 hover:underline"
            >
                View content on original site
            </a>
        </div>
    );
}

// Add TypeScript interface declaration for external scripts
declare global {
    interface Window {
        twttr?: any;
        instgrm?: any;
    }
}