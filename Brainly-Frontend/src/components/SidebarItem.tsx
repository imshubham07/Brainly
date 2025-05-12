import { ReactElement } from "react";

interface SidebarItemProps {
    text: string;
    icon: ReactElement;
    active?: boolean;
    collapsed?: boolean;
    onClick?: () => void;
    badge?: number | string;
}

export function SidebarItem({
    text,
    icon,
    active = false,
    collapsed = false,
    onClick,
    badge
}: SidebarItemProps) {
    return (
        <div
            onClick={onClick}
            className={`
                flex items-center px-3 py-2.5 rounded-lg cursor-pointer transition-all duration-200
                ${active 
                    ? "bg-purple-100 text-purple-700" 
                    : "text-gray-700 hover:bg-gray-100"
                }
                ${collapsed ? "justify-center" : ""}
            `}
        >
            {/* Icon with consistent sizing */}
            <div className={`
                flex items-center justify-center text-lg
                ${active ? "text-purple-600" : "text-gray-500"}
            `}>
                {icon}
            </div>
            
            {/* Text - hidden when sidebar is collapsed */}
            {!collapsed && (
                <span className={`
                    ml-3 font-medium text-sm
                    ${active ? "text-purple-700" : "text-gray-700"}
                `}>
                    {text}
                </span>
            )}
            
            {/* Optional badge - hidden when sidebar is collapsed */}
            {!collapsed && badge && (
                <div className="ml-auto bg-purple-100 text-purple-600 text-xs font-medium px-2 py-0.5 rounded-full">
                    {badge}
                </div>
            )}
        </div>
    );
}