import { useRef, useState } from "react";
import { CrossIcon } from "../icons/CrossIcon";
import { Button } from "./Button";
import { Input } from "./Input";
import { BACKEND_URL } from "../config";
import axios from "axios";
import { EnhancedEmbedContent } from "./EmbedContent";

// Types of content that can be embedded
const CONTENT_TYPES = [
    { id: "youtube", label: "YouTube" },
    { id: "x", label: "Twitter/X" },
    { id: "instagram", label: "Instagram" },
    { id: "linkedin", label: "LinkedIn" },
    { id: "github", label: "GitHub" }
];

// Interface for the props passed to the CreateContentModal component
interface CreateContentModalProps {
    open: boolean;               // State to determine if the modal is open
    onClose: () => void;         // Function to close the modal
}

// CreateContentModal component definition
export function CreateContentModal({ open, onClose }: CreateContentModalProps) {
    // Reference to the link input field
    const linkRef = useRef<HTMLInputElement>(null);
    
    // State to manage the selected content type
    const [type, setType] = useState(CONTENT_TYPES[0].id);
    
    // State to show preview
    const [previewLink, setPreviewLink] = useState<string>("");
    
    // Function to handle adding new content
    async function addContent() {
        try {
            const link = linkRef.current?.value;
            
            if (!link) {
                alert("Please enter a valid link");
                return;
            }
            
            // Making a POST request to add new content
            await axios.post(`${BACKEND_URL}/api/v1/content`, {
                link,
                type
            }, {
                headers: {
                    "Authorization": localStorage.getItem("token") || "" // Including the authorization token
                }
            });
            
            // Clearing the input field and preview
            if (linkRef.current) {
                linkRef.current.value = "";
                setPreviewLink("");
            }
            
            // Closing the modal after adding content
            onClose();
        } catch (error) {
            console.error("Error adding content:", error);
            alert("Failed to add content. Please try again later.");
        }
    }
    
    // Function to detect content type from URL
    const detectContentType = () => {
        const link = linkRef.current?.value || "";
        
        if (link.includes("youtube.com") || link.includes("youtu.be")) {
            setType("youtube");
        } else if (link.includes("twitter.com") || link.includes("x.com")) {
            setType("x");
        } else if (link.includes("instagram.com")) {
            setType("instagram");
        } else if (link.includes("linkedin.com")) {
            setType("linkedin");
        } else if (link.includes("github.com")) {
            setType("github");
        }
        
        // Update preview link
        setPreviewLink(link);
    };

    // Show preview of content
    const showPreview = () => {
        const link = linkRef.current?.value || "";
        if (link) {
            setPreviewLink(link);
        }
    };

    return (
        <div>
            {open && (
                // Modal background overlay
                <div>
                    <div className="w-screen h-screen bg-slate-500 fixed top-0 left-0 opacity-60 flex justify-center z-40"></div>
                    {/* Modal content container */}
                    <div className="w-screen h-screen fixed top-0 left-0 flex justify-center items-center z-50">
                        <div className="bg-white opacity-100 p-6 rounded-lg shadow-lg w-full max-w-md">
                            {/* Close button */}
                            <div className="flex justify-end mb-4">
                                <div onClick={onClose} className="cursor-pointer text-gray-500 hover:text-gray-700">
                                    <CrossIcon />
                                </div>
                            </div>
                            
                            {/* Modal header */}
                            <div className="mb-4">
                                <h2 className="text-xl font-semibold text-center">Add New Content</h2>
                            </div>
                            
                            {/* Input field for link with auto-detection */}
                            <div className="mb-4">
                                <Input 
                                    reference={linkRef} 
                                    placeholder="Paste your link here" 
                                    onChange={detectContentType}
                                    label="Content Link"
                                    fullWidth
                                    helperText="Paste a link to embed content from various platforms"
                                />
                            </div>
                            
                            {/* Content type selection */}
                            <div className="mb-4">
                                <h3 className="mb-2 font-medium text-gray-700">Content Type</h3>
                                <div className="flex flex-wrap gap-2 mb-4">
                                    {CONTENT_TYPES.map((contentType) => (
                                        <Button
                                            key={contentType.id}
                                            text={contentType.label}
                                            variant={type === contentType.id ? "primary" : "secondary"}
                                            onClick={() => setType(contentType.id)}
                                        />
                                    ))}
                                </div>
                            </div>
                            
                            {/* Preview button */}
                            <div className="mb-4 flex justify-center">
                                <Button 
                                    onClick={showPreview} 
                                    variant="secondary" 
                                    text="Preview Content" 
                                />
                            </div>
                            
                            {/* Content preview */}
                            {previewLink && (
                                <div className="mb-4 border rounded-lg overflow-hidden">
                                    <div className="p-2 bg-gray-50 border-b font-medium text-sm text-gray-700">
                                        Preview
                                    </div>
                                    <div className="p-2 max-h-96 overflow-auto">
                                        <EnhancedEmbedContent link={previewLink} type={type} isDashboard={true} />
                                    </div>
                                </div>
                            )}
                            
                            {/* Submit button */}
                            <div className="flex justify-center">
                                <Button 
                                    onClick={addContent} 
                                    variant="primary" 
                                    text="Add Content" 
                                />
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}