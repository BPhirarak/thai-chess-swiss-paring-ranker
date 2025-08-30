import React, { useState, useCallback, useEffect } from 'react';
import { Player, Round, Ranking, BuchholzMethod } from '../types';
import { calculateRankings } from '../services/rankingService';
import { ChartBarIcon, DocumentArrowDownIcon, PrinterIcon } from './icons';

interface RankingTableProps {
    players: Player[];
    rounds: Round[];
}

const RankingTable: React.FC<RankingTableProps> = ({ players, rounds }) => {
    const [rankings, setRankings] = useState<Ranking[]>([]);
    const [lastRound, setLastRound] = useState<number>(0);
    const [buchholzMethod, setBuchholzMethod] = useState<BuchholzMethod>('cut-1');
    
    const maxRound = rounds.length > 0 ? Math.max(...rounds.map(r => r.roundNumber)) : 0;
    const [selectedRound, setSelectedRound] = useState<string>(String(maxRound));

    useEffect(() => {
        const newMaxRound = rounds.length > 0 ? Math.max(...rounds.map(r => r.roundNumber)) : 0;
        if (newMaxRound > 0) {
            setSelectedRound(String(newMaxRound));
        }
    }, [rounds]);

    const handleProcess = useCallback(() => {
        const roundLimit = parseInt(selectedRound, 10);
        if (isNaN(roundLimit) || roundLimit <= 0) {
            alert('กรุณาเลือกรอบที่ถูกต้อง');
            return;
        }

        const roundsToProcess = rounds.filter(r => r.roundNumber <= roundLimit);
        
        if (roundsToProcess.length === 0) {
            alert(`ไม่มีข้อมูลการแข่งขันให้ประมวลผลถึงรอบที่ ${roundLimit}`);
            setRankings([]);
            setLastRound(0);
            return;
        }

        const calculatedRankings = calculateRankings(players, roundsToProcess, buchholzMethod);
        setRankings(calculatedRankings);
        setLastRound(roundLimit);
    }, [players, rounds, buchholzMethod, selectedRound]);

    const downloadCSV = () => {
        if (rankings.length === 0) return;
        const headers = ['Position', 'Name', 'School', 'Score', 'DE', 'Buchholz', 'SBgr', 'W', 'DrH'];
        const csvContent = [
            headers.join(','),
            ...rankings.map(r => [
                r.position,
                `"${r.name.replace(/"/g, '""')}"`,
                `"${r.school.replace(/"/g, '""')}"`,
                r.score,
                r.de.toFixed(2),
                r.buchholz.toFixed(2),
                r.sbgr.toFixed(2),
                r.wins,
                '' // DrH is left blank
            ].join(','))
        ].join('\n');
        
        const bom = new Uint8Array([0xEF, 0xBB, 0xBF]); // UTF-8 BOM for Excel compatibility
        const blob = new Blob([bom, csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', `ranking_round_${lastRound}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const triggerPrint = () => {
        if (rankings.length === 0) {
            alert("กรุณากด 'ประมวลผล' ก่อนพิมพ์หรือบันทึกเป็น PDF");
            return;
        }
        window.print();
    };

    if (players.length === 0 || rounds.length === 0) {
         return <div className="text-center p-8 bg-white rounded-lg shadow-lg">
            <h3 className="text-xl font-semibold text-gray-700">ข้อมูลไม่เพียงพอสำหรับสร้างตารางอันดับ</h3>
            <p className="text-gray-500 mt-2">กรุณาเพิ่มผู้แข่งขันและผลการแข่งขันอย่างน้อย 1 รอบ</p>
        </div>
    }

    return (
        <div className="bg-white p-6 rounded-lg shadow-lg printable-area">
            <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4 print:hidden">
                <div className="w-full sm:w-auto">
                     {rankings.length > 0 ? (
                        <h2 className="text-2xl font-bold text-gray-800">Ranking after round {lastRound}</h2>
                    ) : (
                         <h2 className="text-2xl font-bold text-gray-800">พร้อมสำหรับคำนวณอันดับ</h2>
                    )}
                </div>
                <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto items-center">
                    <div className="flex items-center gap-2">
                        <label htmlFor="round-select" className="text-sm font-medium text-gray-700 whitespace-nowrap">ประมวลผลถึงรอบที่:</label>
                        <select
                            id="round-select"
                            value={selectedRound}
                            onChange={(e) => setSelectedRound(e.target.value)}
                            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                            disabled={maxRound === 0}
                        >
                            {maxRound > 0 ? (
                                Array.from({ length: maxRound }, (_, i) => i + 1).map(rNum => (
                                    <option key={rNum} value={String(rNum)}>{rNum}</option>
                                ))
                            ) : (
                                <option>ไม่มีรอบ</option>
                            )}
                        </select>
                    </div>
                     <div className="flex items-center gap-2">
                        <label htmlFor="buchholz-select" className="text-sm font-medium text-gray-700 whitespace-nowrap">Buchholz:</label>
                        <select
                            id="buchholz-select"
                            value={buchholzMethod}
                            onChange={(e) => setBuchholzMethod(e.target.value as BuchholzMethod)}
                            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                        >
                            <option value="cut-1">Buchholz Cut-1</option>
                            <option value="full">Full Buchholz</option>
                        </select>
                    </div>
                     <button onClick={handleProcess} className="w-full sm:w-auto inline-flex justify-center items-center px-6 py-2 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700">
                        <ChartBarIcon className="h-5 w-5 mr-2" />
                        ประมวลผล
                    </button>
                </div>
            </div>
            {rankings.length > 0 && (
                <>
                    <div className="mb-4 flex flex-wrap gap-2 print:hidden">
                        <button onClick={downloadCSV} className="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
                            <DocumentArrowDownIcon className="h-4 w-4 mr-2" /> Download CSV/Excel
                        </button>
                        <button onClick={triggerPrint} className="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
                            <DocumentArrowDownIcon className="h-4 w-4 mr-2" /> Download PDF
                        </button>
                        <button onClick={triggerPrint} className="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
                            <PrinterIcon className="h-4 w-4 mr-2" /> Print
                        </button>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    {['Position', 'Name', 'School', 'Score', 'DE', 'Buchholz', 'SBgr', 'W', 'DrH'].map(header => (
                                        <th key={header} scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{header}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {rankings.map(r => (
                                    <tr key={r.playerId}>
                                        <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{r.position}</td>
                                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-700">{r.name}</td>
                                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">{r.school}</td>
                                        <td className="px-4 py-4 whitespace-nowrap text-sm font-bold text-gray-900">{r.score}</td>
                                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">{r.de.toFixed(2)}</td>
                                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">{r.buchholz.toFixed(2)}</td>
                                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">{r.sbgr.toFixed(2)}</td>
                                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">{r.wins}</td>
                                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500"></td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </>
            )}
        </div>
    );
};

export default RankingTable;