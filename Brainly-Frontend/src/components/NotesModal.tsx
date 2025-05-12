import {  useState, useEffect } from "react";
import { CrossIcon } from "../icons/CrossIcon";
import { Button } from "./Button";
import { TextArea } from "./TextArea";
import { BACKEND_URL } from "../config";
import axios from "axios";

interface NotesModalProps {
    open: boolean;
    onClose: () => void;
    contentId: string;
    initialNotes?: string;
    onSuccess?: (notes: string) => void;
}

export function NotesModal({ open, onClose, contentId, initialNotes = "", onSuccess }: NotesModalProps) {
    const [notes, setNotes] = useState(initialNotes);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    
    // Close on escape key
    useEffect(() => {
        function handleEscape(e: KeyboardEvent) {
            if (e.key === 'Escape') onClose();
        }
        
        if (open) {
            document.addEventListener('keydown', handleEscape);
            document.body.style.overflow = 'hidden'; // Prevent scrolling when modal is open
        }
        
        return () => {
            document.removeEventListener('keydown', handleEscape);
            document.body.style.overflow = 'auto'; // Restore scrolling when modal is closed
        };
    }, [open, onClose]);

    // Reset notes when modal opens
    useEffect(() => {
        if (open) {
            setNotes(initialNotes);
        }
    }, [open, initialNotes]);

    // Save notes
    async function saveNotes() {
        setLoading(true);
        setError(null);
        
        try {
            await axios.patch(`${BACKEND_URL}/api/v1/content/${contentId}`, {
                notes
            }, {
                headers: {
                    "Authorization": localStorage.getItem("token") || ""
                }
            });
            
            // Call success callback if provided
            if (onSuccess) onSuccess(notes);
            
            // Close the modal after adding content
            onClose();
        } catch (err) {
            setError("Failed to save notes. Please try again.");
            console.error("Error saving notes:", err);
        } finally {
            setLoading(false);
        }
    }

    if (!open) return null;

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto">
            {/* Modal backdrop */}
            <div 
                className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
                onClick={onClose}
            ></div>
            
            {/* Modal content */}
            <div className="flex items-center justify-center min-h-screen p-4">
                <div 
                    className="bg-white rounded-lg shadow-xl w-full max-w-md transform transition-all"
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Modal header */}
                    <div className="flex justify-between items-center p-4 border-b">
                        <h2 className="text-lg font-semibold text-gray-800">My Notes</h2>
                        <button 
                            onClick={onClose}
                            className="p-1 rounded-full hover:bg-gray-100 transition-colors"
                            aria-label="Close"
                        >
                            <CrossIcon />
                        </button>
                    </div>
                    
                    {/* Modal body */}
                    <div className="p-6">
                        {error && (
                            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded-md text-sm">
                                {error}
                            </div>
                        )}
                        
                        <TextArea
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            placeholder="Add your personal notes about this content"
                            label="Notes"
                            fullWidth
                            rows={6}
                            maxLength={500}
                            helperText="These notes are private to you"
                        />
                    </div>
                    
                    {/* Modal footer */}
                    <div className="flex justify-end gap-3 p-4 border-t bg-gray-50 rounded-b-lg">
                        <Button 
                            text="Cancel" 
                            variant="text" 
                            onClick={onClose}
                        />
                        <Button 
                            text="Save Notes" 
                            variant="primary"
                            onClick={saveNotes}
                            loading={loading}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}