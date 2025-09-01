import React, { useState } from 'react';
import Header from './components/Header';
import PlayerInput from './components/PlayerInput';
import MatchInput from './components/MatchInput';
import RankingTable from './components/RankingTable';
import { TournamentData, View } from './types';
import { TrophyIcon, UserGroupIcon, ClipboardDocumentListIcon } from './components/icons';

const App: React.FC = () => {
    const [view, setView] = useState<View>('players');
    const [tournamentData, setTournamentData] = useState<TournamentData>({
        tournaments: [],
        currentTournamentId: null,
        currentDivisionId: null
    });

    const renderView = () => {
        switch (view) {
            case 'players':
                return <PlayerInput tournamentData={tournamentData} setTournamentData={setTournamentData} />;
            case 'matches':
                return <MatchInput tournamentData={tournamentData} setTournamentData={setTournamentData} />;
            case 'ranking':
                return <RankingTable tournamentData={tournamentData} />;
            default:
                return <PlayerInput tournamentData={tournamentData} setTournamentData={setTournamentData} />;
        }
    };
    
    const currentTournament = tournamentData.tournaments.find(t => t.id === tournamentData.currentTournamentId);
    const currentDivision = currentTournament?.divisions.find(d => d.id === tournamentData.currentDivisionId);

    const getHeading = () => {
        const baseTitle = currentTournament && currentDivision ? 
            `${currentTournament.name} - ${currentDivision.name}` : 
            'จัดการการแข่งขันหมากรุกไทย';
        
        switch (view) {
            case 'players':
                return { 
                    title: 'ป้อนรายชื่อผู้แข่งขัน', 
                    subtitle: baseTitle,
                    description: currentTournament && currentDivision ? 
                        `จัดการผู้แข่งขันในรุ่น ${currentDivision.name}` : 
                        'สร้างและจัดการการแข่งขันและรุ่นการแข่งขัน', 
                    icon: <UserGroupIcon className="h-8 w-8 text-white" /> 
                };
            case 'matches':
                return { 
                    title: 'บันทึกผลการแข่งขัน', 
                    subtitle: baseTitle,
                    description: currentTournament && currentDivision ? 
                        `บันทึกผลการแข่งขันในรุ่น ${currentDivision.name}` : 
                        'เลือกการแข่งขันและรุ่นการแข่งขันก่อน', 
                    icon: <ClipboardDocumentListIcon className="h-8 w-8 text-white" /> 
                };
            case 'ranking':
                return { 
                    title: 'ตารางอันดับและคะแนน', 
                    subtitle: baseTitle,
                    description: currentTournament && currentDivision ? 
                        `ดูอันดับและคะแนนของรุ่น ${currentDivision.name}` : 
                        'เลือกการแข่งขันและรุ่นการแข่งขันเพื่อดูอันดับ', 
                    icon: <TrophyIcon className="h-8 w-8 text-white" /> 
                };
        }
    };
    
    const { title, subtitle, description, icon } = getHeading();

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
                            {subtitle && <h2 className="text-xl font-medium text-indigo-100 mb-1">{subtitle}</h2>}
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