
import React from 'react';
import { View } from '../types';
import { UserGroupIcon, ClipboardDocumentListIcon, TrophyIcon } from './icons';

interface HeaderProps {
    activeView: View;
    setActiveView: (view: View) => void;
}

const Header: React.FC<HeaderProps> = ({ activeView, setActiveView }) => {
    const navItems = [
        { id: 'players', label: 'ป้อนรายชื่อผู้แข่งขัน', icon: <UserGroupIcon /> },
        { id: 'matches', label: 'ป้อนผลการแข่งขัน', icon: <ClipboardDocumentListIcon /> },
        { id: 'ranking', label: 'คำนวณคะแนนและทำตารางอันดับ', icon: <TrophyIcon /> },
    ];

    return (
        <div className="flex flex-col sm:flex-row justify-center border-b">
            {navItems.map(item => (
                <button
                    key={item.id}
                    onClick={() => setActiveView(item.id as View)}
                    className={`flex w-full sm:w-auto justify-center items-center space-x-2 px-4 py-3 font-medium text-sm transition-colors duration-200 ${
                        activeView === item.id
                            ? 'border-b-2 border-indigo-600 text-indigo-600'
                            : 'text-gray-500 hover:text-indigo-600'
                    }`}
                >
                    {React.cloneElement(item.icon, { className: 'h-5 w-5' })}
                    <span>{item.label}</span>
                </button>
            ))}
        </div>
    );
};

export default Header;
