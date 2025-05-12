import { NoteIcon } from "../icons/NoteIcon";
import { HeartIcon } from "../icons/HeartIcon";
import { ShareIcon } from "../icons/ShareIcon";
import { TrashIcon } from "../icons/TrashIcon";
import { YoutubeIcon } from "../icons/YoutubeIcon";
import { TwitterIcon } from "../icons/TwitterIcon";
import { EnhancedEmbedContent } from "./EmbedContent";
import { InstagramIcon } from "../icons/InstagramIcon";
import { LinkedInIcon } from "../icons/LinkedInIcon";
import { GithubIcon } from "../icons/GithubIcon";
import { SpotifyIcon } from "../icons/SpotifyIcon";
import { TikTokIcon } from "../icons/TikTokIcon";
import { MediumIcon } from "../icons/MediumIcon";
import { NotionIcon } from "../icons/NotionIcon";
import { OtherIcon } from "../icons/OtherIcon";

interface CardProps {
    title: string;
    link?: string;
    type: string;
    description?: string;
    createdAt?: string;
    tags?: string[];
    notes?: string;
    onNoteClick?: () => void;
    onLikeClick?: () => void;
    onDeleteClick?: () => void;
    isLiked?: boolean;
    isPublic?: boolean; // New prop added
}

// Helper function to get the appropriate icon based on content type
const getContentIcon = (type: string) => {
    switch (type) {
        case "youtube":
            return <YoutubeIcon />;
        case "twitter":
        case "x":
            return <TwitterIcon />;
        case "instagram":
            return <InstagramIcon />;
        case "linkedin":
            return <LinkedInIcon />;
        case "github":
            return <GithubIcon />;
        case "spotify":
            return <SpotifyIcon />;
        case "tiktok":
            return <TikTokIcon />;
        case "medium":
            return <MediumIcon />;
        case "notion":
            return <NotionIcon />;
        default:
            return <OtherIcon />;
    }
};

// Helper function to get the appropriate icon color based on content type
const getIconColor = (type: string) => {
    switch (type) {
        case "youtube":
            return "text-red-600";
        case "twitter":
        case "x":
            return "text-blue-400";
        case "instagram":
            return "text-pink-500";
        case "linkedin":
            return "text-blue-700";
        case "github":
            return "text-gray-800";
        case "spotify":
            return "text-green-500";
        case "tiktok":
            return "text-black";
        case "medium":
            return "text-gray-800";
        case "notion":
            return "text-gray-800";
        default:
            return "text-gray-600";
    }
};

export function Card({ 
    title, 
    link, 
    type, 
    description, 
    createdAt, 
    tags = [], 
    notes,
    onNoteClick,
    onLikeClick,
    onDeleteClick,
    isLiked = false,
    isPublic = false // Default to false
}: CardProps) {
    return (
        <div className="w-full max-w-sm overflow-hidden bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow duration-300">
            {/* Card Header */}
            <div className="flex items-center justify-between p-3 border-b border-gray-100">
                {/* Title with Icon */}
                <div className="flex items-center gap-2">
                    <div className={getIconColor(type)}>
                        {getContentIcon(type)}
                    </div>
                    <span className="font-medium text-gray-800 truncate max-w-[180px]" title={title}>
                        {title}
                    </span>
                </div>
                
                {/* Action Icons - Conditionally rendered */}
                {!isPublic && (
                    <div className="flex items-center gap-1">
                        <button 
                            className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                            onClick={onNoteClick}
                            title="Add notes"
                            aria-label="Add notes"
                        >
                            <NoteIcon />
                        </button>
                        <button 
                            className={`p-1 transition-colors ${isLiked ? 'text-red-500' : 'text-gray-400 hover:text-gray-600'}`}
                            onClick={onLikeClick}
                            title={isLiked ? "Unlike" : "Like"}
                            aria-label={isLiked ? "Unlike" : "Like"}
                        >
                            <HeartIcon />
                        </button>
                        <button 
                            className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                            onClick={() => link && window.open(link, '_blank')}
                            title="Open original"
                            aria-label="Open original"
                        >
                            <ShareIcon />
                        </button>
                        <button 
                            className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                            onClick={onDeleteClick}
                            title="Delete"
                            aria-label="Delete"
                        >
                            <TrashIcon />
                        </button>
                    </div>
                )}
            </div>
            
            {/* Content - Embedded Content */}
            <div className="w-full">
                {link && (
                    <div className="min-h-[250px] flex items-center justify-center bg-gray-50">
                        <EnhancedEmbedContent link={link} type={type} />
                    </div>
                )}
            </div>
            
            {/* Description - Optional */}
            {description && (
                <div className="px-4 py-2">
                    <p className="text-sm text-gray-600 line-clamp-2">{description}</p>
                </div>
            )}
            
            {/* Tags - Optional */}
            {tags && tags.length > 0 && (
                <div className="px-4 py-2 flex flex-wrap gap-1">
                    {tags.map((tag, index) => (
                        <span 
                            key={index} 
                            className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded-full"
                        >
                            {tag}
                        </span>
                    ))}
                </div>
            )}
            
            {/* Notes - Optional */}
            {notes && (
                <div className="px-4 py-2 bg-yellow-50">
                    <p className="text-xs text-gray-700">{notes}</p>
                </div>
            )}
            
            {/* Footer with timestamp */}
            {createdAt && (
                <div className="px-4 py-2 text-xs text-gray-500">
                    Added {createdAt}
                </div>
            )}
        </div>
    );
}