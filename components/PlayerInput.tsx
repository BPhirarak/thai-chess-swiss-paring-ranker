import React, { useState, useRef } from 'react';
import { Player, Tournament, Division, TournamentData } from '../types';
import { UserPlusIcon, TrashIcon, DocumentArrowDownIcon, DocumentArrowUpIcon, PlusIcon, SaveIcon } from './icons';

interface PlayerInputProps {
    tournamentData: TournamentData;
    setTournamentData: React.Dispatch<React.SetStateAction<TournamentData>>;
}

const PlayerInput: React.FC<PlayerInputProps> = ({ tournamentData, setTournamentData }) => {
    const [name, setName] = useState('');
    const [school, setSchool] = useState('');
    const [editId, setEditId] = useState<string | null>(null);
    const [tournamentName, setTournamentName] = useState('');
    const [divisionName, setDivisionName] = useState('');
    const [showTournamentForm, setShowTournamentForm] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const currentTournament = tournamentData.tournaments.find(t => t.id === tournamentData.currentTournamentId);
    const currentDivision = currentTournament?.divisions.find(d => d.id === tournamentData.currentDivisionId);
    const players = currentDivision?.players || [];


    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim() || !currentDivision) return;

        const updatedData = { ...tournamentData };
        const tournamentIndex = updatedData.tournaments.findIndex(t => t.id === tournamentData.currentTournamentId);
        const divisionIndex = updatedData.tournaments[tournamentIndex].divisions.findIndex(d => d.id === tournamentData.currentDivisionId);

        if (editId) {
            const playerIndex = updatedData.tournaments[tournamentIndex].divisions[divisionIndex].players.findIndex(p => p.id === editId);
            updatedData.tournaments[tournamentIndex].divisions[divisionIndex].players[playerIndex] = { ...updatedData.tournaments[tournamentIndex].divisions[divisionIndex].players[playerIndex], name, school };
            setEditId(null);
        } else {
            const newPlayer: Player = {
                id: new Date().getTime().toString(),
                name,
                school,
            };
            updatedData.tournaments[tournamentIndex].divisions[divisionIndex].players.push(newPlayer);
        }
        
        updatedData.tournaments[tournamentIndex].divisions[divisionIndex].updatedAt = new Date().toISOString();
        updatedData.tournaments[tournamentIndex].updatedAt = new Date().toISOString();
        setTournamentData(updatedData);
        
        setName('');
        setSchool('');
    };

    const handleEdit = (player: Player) => {
        setEditId(player.id);
        setName(player.name);
        setSchool(player.school);
    };

    const handleDelete = (id: string) => {
        if (window.confirm('คุณแน่ใจหรือไม่ว่าต้องการลบผู้แข่งขันคนนี้?') && currentDivision) {
            const updatedData = { ...tournamentData };
            const tournamentIndex = updatedData.tournaments.findIndex(t => t.id === tournamentData.currentTournamentId);
            const divisionIndex = updatedData.tournaments[tournamentIndex].divisions.findIndex(d => d.id === tournamentData.currentDivisionId);
            
            updatedData.tournaments[tournamentIndex].divisions[divisionIndex].players = 
                updatedData.tournaments[tournamentIndex].divisions[divisionIndex].players.filter(p => p.id !== id);
            
            updatedData.tournaments[tournamentIndex].divisions[divisionIndex].updatedAt = new Date().toISOString();
            updatedData.tournaments[tournamentIndex].updatedAt = new Date().toISOString();
            setTournamentData(updatedData);
        }
    };
    
    const cancelEdit = () => {
        setEditId(null);
        setName('');
        setSchool('');
    }

    const handleSaveDivisionToFile = () => {
        if (!currentDivision || currentDivision.players.length === 0) {
            alert("ไม่มีรายชื่อผู้แข่งขันให้บันทึก");
            return;
        }
        const dataStr = JSON.stringify(currentDivision, null, 2);
        const blob = new Blob([dataStr], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.download = `${currentTournament?.name}-${currentDivision.name}-division.json`;
        link.href = url;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    };

    const handleSaveTournamentToFile = () => {
        if (!currentTournament || currentTournament.divisions.length === 0) {
            alert("ไม่มีข้อมูลการแข่งขันให้บันทึก");
            return;
        }
        const dataStr = JSON.stringify(currentTournament, null, 2);
        const blob = new Blob([dataStr], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.download = `${currentTournament.name}-tournament.json`;
        link.href = url;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    };

    const handleImportClick = () => {
        fileInputRef.current?.click();
    };

    const handleCreateTournament = (e: React.FormEvent) => {
        e.preventDefault();
        if (!tournamentName.trim() || !divisionName.trim()) return;

        const newTournament: Tournament = {
            id: new Date().getTime().toString(),
            name: tournamentName,
            divisions: [],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };

        const newDivision: Division = {
            id: new Date().getTime().toString() + '_div',
            name: divisionName,
            players: [],
            rounds: [],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };

        newTournament.divisions.push(newDivision);

        const updatedData = {
            ...tournamentData,
            tournaments: [...tournamentData.tournaments, newTournament],
            currentTournamentId: newTournament.id,
            currentDivisionId: newDivision.id
        };

        setTournamentData(updatedData);
        setTournamentName('');
        setDivisionName('');
        setShowTournamentForm(false);
        alert(`สร้างการแข่งขัน "${tournamentName}" รุ่น "${divisionName}" เรียบร้อย`);
    };

    const handleCreateDivision = () => {
        if (!currentTournament) {
            alert('กรุณาเลือกการแข่งขันก่อน');
            return;
        }

        const newDivisionName = prompt('ชื่อรุ่นใหม่:');
        if (!newDivisionName?.trim()) return;

        const newDivision: Division = {
            id: new Date().getTime().toString(),
            name: newDivisionName,
            players: [],
            rounds: [],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };

        const updatedData = { ...tournamentData };
        const tournamentIndex = updatedData.tournaments.findIndex(t => t.id === tournamentData.currentTournamentId);
        updatedData.tournaments[tournamentIndex].divisions.push(newDivision);
        updatedData.tournaments[tournamentIndex].updatedAt = new Date().toISOString();
        updatedData.currentDivisionId = newDivision.id;

        setTournamentData(updatedData);
        alert(`เพิ่มรุ่น "${newDivisionName}" เรียบร้อย`);
    };

    const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        const cleanup = () => {
            if (fileInputRef.current) fileInputRef.current.value = "";
        };

        if (!file) {
            cleanup();
            return;
        }

        try {
            const text = await file.text();
            const importedData = JSON.parse(text);

            // Check if it's a tournament or division file
            if (importedData.divisions && Array.isArray(importedData.divisions)) {
                // Tournament file
                const updatedData = {
                    ...tournamentData,
                    tournaments: [...tournamentData.tournaments, importedData],
                    currentTournamentId: importedData.id,
                    currentDivisionId: importedData.divisions[0]?.id || null
                };
                setTournamentData(updatedData);
                alert(`นำเข้าการแข่งขัน "${importedData.name}" สำเร็จ`);
            } else if (importedData.players && Array.isArray(importedData.players)) {
                // Division file - need current tournament
                if (!currentTournament) {
                    alert('กรุณาสร้างการแข่งขันก่อนนำเข้ารุ่น');
                    cleanup();
                    return;
                }
                
                const updatedData = { ...tournamentData };
                const tournamentIndex = updatedData.tournaments.findIndex(t => t.id === tournamentData.currentTournamentId);
                updatedData.tournaments[tournamentIndex].divisions.push(importedData);
                updatedData.tournaments[tournamentIndex].updatedAt = new Date().toISOString();
                updatedData.currentDivisionId = importedData.id;

                setTournamentData(updatedData);
                alert(`นำเข้ารุ่น "${importedData.name}" สำเร็จ`);
            } else {
                throw new Error("ไฟล์ไม่ถูกต้องหรือมีรูปแบบข้อมูลที่ไม่ตรงกัน");
            }

        } catch (error) {
            alert(`เกิดข้อผิดพลาดในการนำเข้าไฟล์: ${error instanceof Error ? error.message : 'Unknown error'}`);
        } finally {
            cleanup();
        }
    };


    if (tournamentData.tournaments.length === 0 || !currentTournament || !currentDivision) {
        return (
            <div className="bg-white p-6 rounded-lg shadow-lg">
                <div className="text-center mb-6">
                    <h3 className="text-xl font-semibold text-gray-700 mb-4">จัดการการแข่งขันหมากรุกไทย</h3>
                    {!showTournamentForm ? (
                        <button 
                            onClick={() => setShowTournamentForm(true)}
                            className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700"
                        >
                            <PlusIcon className="h-5 w-5 mr-2" />
                            สร้างการแข่งขันใหม่
                        </button>
                    ) : (
                        <form onSubmit={handleCreateTournament} className="max-w-md mx-auto space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">ชื่อการแข่งขัน</label>
                                <input
                                    type="text"
                                    value={tournamentName}
                                    onChange={(e) => setTournamentName(e.target.value)}
                                    placeholder="เช่น การแข่งขันหมากรุกไทยชิงแชมป์ประเทศไทย"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">ชื่อรุ่นแรก</label>
                                <input
                                    type="text"
                                    value={divisionName}
                                    onChange={(e) => setDivisionName(e.target.value)}
                                    placeholder="เช่น รุ่นเยาวชน, รุ่นบุคคลทั่วไป"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                                    required
                                />
                            </div>
                            <div className="flex space-x-3">
                                <button
                                    type="submit"
                                    className="flex-1 inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700"
                                >
                                    <SaveIcon className="h-4 w-4 mr-2" />
                                    สร้าง
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setShowTournamentForm(false)}
                                    className="flex-1 inline-flex justify-center items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50"
                                >
                                    ยกเลิก
                                </button>
                            </div>
                        </form>
                    )}
                    
                    {tournamentData.tournaments.length > 0 && (
                        <div className="mt-6 pt-6 border-t border-gray-200">
                            <p className="text-sm text-gray-600 mb-4">หรือเลือกการแข่งขันที่มีอยู่:</p>
                            <div className="space-y-2">
                                {tournamentData.tournaments.map(tournament => (
                                    <div key={tournament.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50">
                                        <div>
                                            <h4 className="font-medium text-gray-900">{tournament.name}</h4>
                                            <p className="text-sm text-gray-500">{tournament.divisions.length} รุ่น</p>
                                        </div>
                                        <div className="space-x-2">
                                            {tournament.divisions.map(division => (
                                                <button
                                                    key={division.id}
                                                    onClick={() => setTournamentData({
                                                        ...tournamentData,
                                                        currentTournamentId: tournament.id,
                                                        currentDivisionId: division.id
                                                    })}
                                                    className="px-3 py-1 text-xs bg-blue-100 text-blue-800 rounded-full hover:bg-blue-200"
                                                >
                                                    {division.name}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white p-6 rounded-lg shadow-lg">
            <div className="mb-6 p-4 bg-blue-50 rounded-lg">
                <div className="flex items-center justify-between">
                    <div>
                        <h3 className="text-lg font-semibold text-blue-900">{currentTournament.name}</h3>
                        <p className="text-blue-700">รุ่น: {currentDivision.name} ({players.length} คน)</p>
                    </div>
                    <div className="flex space-x-2">
                        <button
                            onClick={handleCreateDivision}
                            className="px-3 py-2 text-sm bg-green-600 text-white rounded-md hover:bg-green-700"
                        >
                            + รุ่นใหม่
                        </button>
                        <select
                            value={currentDivision.id}
                            onChange={(e) => setTournamentData({
                                ...tournamentData,
                                currentDivisionId: e.target.value
                            })}
                            className="text-sm border-gray-300 rounded-md"
                        >
                            {currentTournament.divisions.map(div => (
                                <option key={div.id} value={div.id}>{div.name} ({div.players.length})</option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>
            <form onSubmit={handleSubmit} className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                <div className="col-span-1">
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700">ชื่อ-สกุล</label>
                    <input
                        type="text"
                        id="name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="เช่น สมชาย ใจดี"
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                        required
                    />
                </div>
                <div className="col-span-1">
                    <label htmlFor="school" className="block text-sm font-medium text-gray-700">โรงเรียน</label>
                    <input
                        type="text"
                        id="school"
                        value={school}
                        onChange={(e) => setSchool(e.target.value)}
                        placeholder="เช่น โรงเรียนวิทยานุสรณ์"
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    />
                </div>
                <div className="col-span-1 flex space-x-2">
                     <button
                        type="submit"
                        className="w-full inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                        <UserPlusIcon className="h-5 w-5 mr-2" />
                        {editId ? 'อัปเดตข้อมูล' : 'เพิ่มผู้แข่งขัน'}
                    </button>
                    {editId && (
                         <button type="button" onClick={cancelEdit} className="w-full inline-flex justify-center items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50">
                             ยกเลิก
                         </button>
                    )}
                </div>
            </form>

            <div className="border-t border-gray-200 my-6"></div>

            <div className="mb-4 flex flex-col sm:flex-row gap-2">
                <button
                    onClick={handleSaveDivisionToFile}
                    className="inline-flex items-center justify-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                >
                    <DocumentArrowDownIcon className="h-5 w-5 mr-2" />
                    บันทึกรุ่นนี้
                </button>
                <button
                    onClick={handleSaveTournamentToFile}
                    className="inline-flex items-center justify-center px-4 py-2 border border-orange-300 shadow-sm text-sm font-medium rounded-md text-orange-700 bg-orange-50 hover:bg-orange-100"
                >
                    <DocumentArrowDownIcon className="h-5 w-5 mr-2" />
                    บันทึกทั้งการแข่งขัน
                </button>
                <button
                    onClick={handleImportClick}
                    className="inline-flex items-center justify-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                >
                    <DocumentArrowUpIcon className="h-5 w-5 mr-2" />
                    นำเข้าไฟล์
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
            
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ลำดับ</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ชื่อ-สกุล</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">โรงเรียน</th>
                            <th scope="col" className="relative px-6 py-3"><span className="sr-only">Actions</span></th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {players.map((player, index) => (
                            <tr key={player.id}>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{index + 1}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{player.name}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{player.school}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                                     <button onClick={() => handleEdit(player)} className="text-indigo-600 hover:text-indigo-900">แก้ไข</button>
                                     <button onClick={() => handleDelete(player.id)} className="text-red-600 hover:text-red-900">ลบ</button>
                                </td>
                            </tr>
                        ))}
                         {players.length === 0 && (
                            <tr>
                                <td colSpan={4} className="text-center py-4 text-gray-500">ยังไม่มีผู้แข่งขัน</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};
export default PlayerInput;