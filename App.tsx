import React, { useState } from 'react';
import Header from './components/Header';
import PlayerInput from './components/PlayerInput';
import MatchInput from './components/MatchInput';
import RankingTable from './components/RankingTable';
import { Player, Round, View } from './types';
import { TrophyIcon, UserGroupIcon, ClipboardDocumentListIcon } from './components/icons';

const App: React.FC = () => {
    const [view, setView] = useState<View>('players');
    const [players, setPlayers] = useState<Player[]>([]);
    const [rounds, setRounds] = useState<Round[]>([]);

    const renderView = () => {
        switch (view) {
            case 'players':
                return <PlayerInput players={players} setPlayers={setPlayers} />;
            case 'matches':
                return <MatchInput players={players} rounds={rounds} setRounds={setRounds} />;
            case 'ranking':
                return <RankingTable players={players} rounds={rounds} />;
            default:
                return <PlayerInput players={players} setPlayers={setPlayers} />;
        }
    };
    
    const getHeading = () => {
        switch (view) {
            case 'players':
                return { title: 'ป้อนรายชื่อผู้แข่งขัน', description: 'เพิ่มและจัดการรายชื่อผู้เข้าแข่งขันทั้งหมดที่นี่', icon: <UserGroupIcon className="h-8 w-8 text-white" /> };
            case 'matches':
                return { title: 'ป้อนผลการแข่งขัน', description: 'บันทึกผลการแข่งขันในแต่ละรอบ', icon: <ClipboardDocumentListIcon className="h-8 w-8 text-white" /> };
            case 'ranking':
                return { title: 'คำนวณคะแนนและทำตารางอันดับ', description: 'ประมวลผลและดูอันดับคะแนนล่าสุด', icon: <TrophyIcon className="h-8 w-8 text-white" /> };
        }
    };
    
    const { title, description, icon } = getHeading();

    return (
        <div className="min-h-screen bg-gray-50">
            <header className="bg-gradient-to-r from-blue-700 to-indigo-800 shadow-lg print:hidden">
                <div className="container mx-auto px-4 py-6">
                    <div className="flex items-center space-x-4">
                        <div className="bg-white/20 p-3 rounded-full">
                            {icon}
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold text-white">{title}</h1>
                            <p className="text-indigo-200">{description}</p>
                        </div>
                    </div>
                </div>
            </header>
            
            <nav className="bg-white shadow-md sticky top-0 z-10 print:hidden">
                <div className="container mx-auto px-4">
                    <Header activeView={view} setActiveView={setView} />
                </div>
            </nav>

            <main className="container mx-auto p-4 md:p-6">
                {renderView()}
            </main>
            
            <footer className="text-center py-4 text-gray-500 text-sm print:hidden">
                <p>โปรแกรมจัดอันดับการแข่งขันหมากรุกไทย (Swiss Pairing)</p>
            </footer>
        </div>
    );
};

export default App;