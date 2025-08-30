import React, { useState, useEffect, useRef } from 'react';
import { Player, Round, Match, MatchResult } from '../types';
import { PlusIcon, SaveIcon, TrashIcon, DocumentArrowDownIcon, DocumentArrowUpIcon } from './icons';

interface MatchInputProps {
    players: Player[];
    rounds: Round[];
    setRounds: React.Dispatch<React.SetStateAction<Round[]>>;
}

const MatchInput: React.FC<MatchInputProps> = ({ players, rounds, setRounds }) => {
    const nextRoundNumber = rounds.length > 0 ? Math.max(...rounds.map(r => r.roundNumber)) + 1 : 1;
    const [roundNumber, setRoundNumber] = useState(nextRoundNumber);
    const initialMatchState = [{ pair: 1, whitePlayerId: null, blackPlayerId: null, whiteResult: '' as MatchResult, blackResult: '' as MatchResult }];
    const [matches, setMatches] = useState<Match[]>(initialMatchState);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        setRoundNumber(nextRoundNumber);
    }, [rounds, nextRoundNumber]);
    
    const getAvailablePlayers = (currentMatchIndex: number, color: 'white' | 'black') => {
        const selectedInOtherMatches = new Set<string>();
        matches.forEach((m, idx) => {
            if (idx === currentMatchIndex) return;
            if (m.whitePlayerId) selectedInOtherMatches.add(m.whitePlayerId);
            if (m.blackPlayerId) selectedInOtherMatches.add(m.blackPlayerId);
        });

        const opponentId = color === 'white' ? matches[currentMatchIndex].blackPlayerId : matches[currentMatchIndex].whitePlayerId;
        if(opponentId) selectedInOtherMatches.add(opponentId);

        return players.filter(p => !selectedInOtherMatches.has(p.id));
    };

    const handleMatchChange = <K extends keyof Match>(index: number, field: K, value: Match[K]) => {
        const newMatches = [...matches];
        const match = newMatches[index];
        match[field] = value;

        if (field === 'whiteResult') {
            if (value === 1) match.blackResult = 0;
            else if (value === 0.5) match.blackResult = 0.5;
            else if (value === 0) match.blackResult = 1;
            else if (value === 'bye') {
                 match.blackPlayerId = null;
                 match.blackResult = '';
            } else {
                 match.blackResult = '';
            }
        }
        
        if (field === 'whitePlayerId' && !value) {
            match.whiteResult = '';
            match.blackResult = '';
        }

        setMatches(newMatches);
    };

    const addMatchRow = () => {
        setMatches([...matches, { pair: matches.length + 1, whitePlayerId: null, blackPlayerId: null, whiteResult: '', blackResult: '' }]);
    };
    
    const removeMatchRow = (index: number) => {
        setMatches(matches.filter((_, i) => i !== index));
    };

    const saveRound = () => {
        const validMatches = matches.filter(m => 
            (m.whitePlayerId && m.whiteResult === 'bye') ||
            (m.whitePlayerId && m.blackPlayerId && m.whiteResult !== '' && m.blackResult !== '')
        ).map((m, index) => ({ ...m, pair: index + 1 }));

        if (validMatches.length === 0 && matches.some(m => m.whitePlayerId)) {
            alert('กรุณากรอกข้อมูลการแข่งขันให้สมบูรณ์');
            return;
        }

        const newRound: Round = { roundNumber, matches: validMatches };
        
        const existingRoundIndex = rounds.findIndex(r => r.roundNumber === roundNumber);
        if (existingRoundIndex > -1) {
            if(window.confirm(`มีข้อมูลของรอบที่ ${roundNumber} อยู่แล้ว ต้องการบันทึกทับหรือไม่?`)){
                const updatedRounds = [...rounds];
                updatedRounds[existingRoundIndex] = newRound;
                setRounds(updatedRounds);
            } else {
                return;
            }
        } else {
            setRounds([...rounds, newRound].sort((a,b) => a.roundNumber - b.roundNumber));
        }

        alert(`บันทึกผลรอบที่ ${roundNumber} เรียบร้อย!`);
        
        const nextNum = Math.max(...rounds.map(r => r.roundNumber), 0, roundNumber) + 1;
        setRoundNumber(nextNum);
        setMatches(initialMatchState);
    };

    const handleSaveToFile = () => {
        if (!matches.some(m => m.whitePlayerId)) {
            alert("ไม่มีข้อมูลการแข่งขันให้บันทึก");
            return;
        }
        const dataStr = JSON.stringify(matches, null, 2);
        const blob = new Blob([dataStr], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.download = `round-${roundNumber}-matches.json`;
        link.href = url;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    };

    const handleImportClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        const cleanup = () => { if (fileInputRef.current) fileInputRef.current.value = ""; };

        if (!file) {
            cleanup();
            return;
        }

        try {
            const text = await file.text();
            const importedMatches = JSON.parse(text);

            if (!Array.isArray(importedMatches) || !importedMatches.every(m => 
                m && typeof m === 'object' &&
                'pair' in m && typeof m.pair === 'number' &&
                'whitePlayerId' in m &&
                'blackPlayerId' in m &&
                'whiteResult' in m &&
                'blackResult' in m
            )) {
                throw new Error("ไฟล์ไม่ถูกต้องหรือมีรูปแบบข้อมูลที่ไม่ตรงกัน");
            }
            
            const hasExistingData = matches.length > 1 || (matches.length === 1 && matches[0].whitePlayerId !== null);
            if (hasExistingData) {
                if (!window.confirm("การนำเข้าจะเขียนทับข้อมูลการแข่งขันที่ยังไม่บันทึก คุณต้องการดำเนินการต่อหรือไม่?")) {
                    cleanup();
                    return;
                }
            }

            setMatches(importedMatches);
            alert(`นำเข้าข้อมูลการแข่งขัน ${importedMatches.length} คู่ สำเร็จ`);

        } catch (error) {
            alert(`เกิดข้อผิดพลาดในการนำเข้าไฟล์: ${error instanceof Error ? error.message : 'Unknown error'}`);
        } finally {
            cleanup();
        }
    };
    
    if (players.length === 0) {
        return <div className="text-center p-8 bg-white rounded-lg shadow-lg">
            <h3 className="text-xl font-semibold text-gray-700">กรุณาเพิ่มผู้แข่งขันก่อน</h3>
            <p className="text-gray-500 mt-2">คุณต้องเพิ่มรายชื่อผู้เข้าแข่งขันในเมนู 'ป้อนรายชื่อผู้แข่งขัน' ก่อนบันทึกผล</p>
        </div>
    }

    return (
        <div className="bg-white p-6 rounded-lg shadow-lg">
             <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
                <div className="flex items-center space-x-2">
                    <label htmlFor="roundNumber" className="text-lg font-semibold text-gray-700">รอบที่:</label>
                    <input
                        type="number"
                        id="roundNumber"
                        value={roundNumber}
                        onChange={(e) => setRoundNumber(parseInt(e.target.value, 10) || 1)}
                        min="1"
                        className="w-20 text-center text-lg font-bold p-2 border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    />
                </div>
                 <button onClick={saveRound} className="w-full sm:w-auto inline-flex justify-center items-center px-6 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700">
                    <SaveIcon className="h-5 w-5 mr-2"/>
                    บันทึกผลรอบที่ {roundNumber}
                </button>
            </div>
            
             <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">คู่ที่</th>
                            <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ผู้แข่งขัน-ขาว</th>
                            <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ผู้แข่งขัน-แดง</th>
                            <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ผลการแข่งขัน-ขาว</th>
                            <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ผลการแข่งขัน-แดง</th>
                            <th className="relative px-3 py-3"><span className="sr-only">Remove</span></th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {matches.map((match, index) => (
                            <tr key={index}>
                                <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500">{index + 1}</td>
                                <td className="px-3 py-2 whitespace-nowrap">
                                    <select value={match.whitePlayerId || ''} onChange={e => handleMatchChange(index, 'whitePlayerId', e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm">
                                        <option value="">-- เลือกฝ่ายขาว --</option>
                                        {getAvailablePlayers(index, 'white').map(p => (<option key={p.id} value={p.id}>{p.name}</option>))}
                                    </select>
                                </td>
                                <td className="px-3 py-2 whitespace-nowrap">
                                     <select value={match.blackPlayerId || ''} onChange={e => handleMatchChange(index, 'blackPlayerId', e.target.value)} disabled={match.whiteResult === 'bye'} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm disabled:bg-gray-100">
                                        <option value="">-- เลือกฝ่ายแดง --</option>
                                         {getAvailablePlayers(index, 'black').map(p => (<option key={p.id} value={p.id}>{p.name}</option>))}
                                    </select>
                                </td>
                                <td className="px-3 py-2 whitespace-nowrap">
                                    <select 
                                        value={match.whiteResult} 
                                        onChange={e => {
                                            const val = e.target.value;
                                            const result = (val === 'bye' ? 'bye' : (val === '' ? '' : parseFloat(val))) as MatchResult;
                                            handleMatchChange(index, 'whiteResult', result);
                                        }} 
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm" disabled={!match.whitePlayerId}>
                                        <option value="">-- ผล --</option>
                                        <option value={1}>ชนะ (1)</option>
                                        <option value={0.5}>เสมอ (1/2)</option>
                                        <option value={0}>แพ้ (0)</option>
                                        <option value="bye">ชนะบาย (Bye)</option>
                                    </select>
                                </td>
                                <td className="px-3 py-2 whitespace-nowrap">
                                     <div className="mt-1 flex items-center justify-center h-full px-3 py-2 bg-gray-100 rounded-md border border-transparent sm:text-sm text-gray-700 font-medium">
                                        <span>{match.blackResult === 0.5 ? '1/2' : (match.blackResult === '' ? '-' : match.blackResult)}</span>
                                    </div>
                                </td>
                                <td className="px-3 py-2 whitespace-nowrap">
                                    {matches.length > 1 && ( <button onClick={() => removeMatchRow(index)} className="text-red-500 hover:text-red-700"><TrashIcon className="h-5 w-5" /></button>)}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
             </div>
             <div className="mt-4 border-t pt-4 flex flex-wrap gap-2">
                <button onClick={addMatchRow} className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
                    <PlusIcon className="h-5 w-5 mr-2"/> เพิ่มคู่แข่งขัน
                </button>
                 <button
                    onClick={handleSaveToFile}
                    className="inline-flex items-center justify-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                >
                    <DocumentArrowDownIcon className="h-5 w-5 mr-2" />
                    Save to File
                </button>
                <button
                    onClick={handleImportClick}
                    className="inline-flex items-center justify-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                >
                    <DocumentArrowUpIcon className="h-5 w-5 mr-2" />
                    Import from File
                </button>
                <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    accept=".json"
                    className="hidden"
                    aria-hidden="true"
                />
            </div>
        </div>
    );
};

export default MatchInput;
