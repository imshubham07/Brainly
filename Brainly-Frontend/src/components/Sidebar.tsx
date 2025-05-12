import { Logo } from "../icons/Logo";
import { TwitterIcon } from "../icons/TwitterIcon";
import { YoutubeIcon } from "../icons/YoutubeIcon";
import { SidebarItem } from "./SidebarItem";
import { LogOut, Instagram, Linkedin, Github, LayoutGrid } from "lucide-react";

interface SidebarProps {
    collapsed?: boolean;
    onToggleCollapse?: () => void;
    activeItem: string;
    setActiveItem: (item: string) => void;
}

export function Sidebar({ collapsed = false, onToggleCollapse, activeItem, setActiveItem }: SidebarProps) {
    // Function to handle item click efficiently
    const handleItemClick = (itemValue: string) => {
        setActiveItem(itemValue);
    };
    
    // Function to handle logout
    const handleLogout = () => {
        // Remove the token from local storage using the correct token name
        localStorage.removeItem("token");
        // Redirect to signin page after logout
        window.location.href = "/";
    };
    
    return (
        <div 
            className={`h-screen bg-white border-r border-gray-200 shadow-sm fixed left-0 top-0 transition-all duration-300 z-10
                ${collapsed ? "w-16" : "w-64"}`
            }
        >
            <div className="flex flex-col h-full">
                {/* Logo and header section */}
                <div className={`flex items-center ${collapsed ? "justify-center py-6" : "px-6 py-5"}`}>
                    <div className="text-purple-600">
                        <Logo />
                    </div>
                    {!collapsed && (
                        <h1 className="text-xl font-semibold text-gray-800 ml-2">
                            Brainly
                        </h1>
                    )}
                    
                    {/* Collapse toggle button - could use your custom icon here */}
                    {onToggleCollapse && (
                        <button 
                            onClick={onToggleCollapse}
                            className={`p-1 rounded-full hover:bg-gray-100 text-gray-500 ml-auto ${collapsed ? "hidden" : ""}`}
                            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
                        >
                            {/* This is where you'd use your custom icon */}
                            <span className="text-xs">⇄</span>
                        </button>
                    )}
                </div>
                
                {/* Navigation section */}
                <nav className={`flex-1 pt-5 ${collapsed ? "px-2" : "px-3"}`}>
                    <div className="space-y-1">
                        <SidebarItem 
                            text="All" 
                            icon={<LayoutGrid size={20} />}
                            active={activeItem === "All"}
                            collapsed={collapsed}
                            onClick={() => handleItemClick("All")}
                        />
                        <SidebarItem 
                            text="Twitter" 
                            icon={<TwitterIcon />} 
                            active={activeItem === "x"}
                            collapsed={collapsed}
                            onClick={() => handleItemClick("x")}
                        />
                        <SidebarItem 
                            text="YouTube" 
                            icon={<YoutubeIcon />} 
                            active={activeItem === "youtube"}
                            collapsed={collapsed}
                            onClick={() => handleItemClick("youtube")}
                        />
                        <SidebarItem 
                            text="Instagram" 
                            icon={<Instagram size={20} />}
                            active={activeItem === "Instagram"}
                            collapsed={collapsed}
                            onClick={() => handleItemClick("Instagram")}
                        />
                        <SidebarItem 
                            text="LinkedIn" 
                            icon={<Linkedin size={20} />}
                            active={activeItem === "LinkedIn"}
                            collapsed={collapsed}
                            onClick={() => handleItemClick("LinkedIn")}
                        />
                        <SidebarItem 
                            text="GitHub" 
                            icon={<Github size={20} />}
                            active={activeItem === "GitHub"}
                            collapsed={collapsed}
                            onClick={() => handleItemClick("GitHub")}
                        />
                    </div>
                </nav>
                
                {/* Footer section with logout button */}
                <div className={`mt-auto border-t border-gray-200 py-4 ${collapsed ? "px-2" : "px-3"}`}>
                    {!collapsed && (
                        <div className="text-xs text-gray-500 mb-2 px-3">
                            Brainly v1.0
                        </div>
                    )}
                    
                    {/* Logout button using SidebarItem component */}
                    <SidebarItem 
                        text="Logout" 
                        icon={<LogOut size={20} />} 
                        collapsed={collapsed}
                        onClick={handleLogout}
                    />
                </div>
            </div>
        </div>
    );
}