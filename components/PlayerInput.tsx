import React, { useState, useRef } from 'react';
import { Player } from '../types';
import { UserPlusIcon, TrashIcon, DocumentArrowDownIcon, DocumentArrowUpIcon } from './icons';

interface PlayerInputProps {
    players: Player[];
    setPlayers: React.Dispatch<React.SetStateAction<Player[]>>;
}

const PlayerInput: React.FC<PlayerInputProps> = ({ players, setPlayers }) => {
    const [name, setName] = useState('');
    const [school, setSchool] = useState('');
    const [editId, setEditId] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);


    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim()) return;

        if (editId) {
            setPlayers(players.map(p => p.id === editId ? { ...p, name, school } : p));
            setEditId(null);
        } else {
            const newPlayer: Player = {
                id: new Date().getTime().toString(),
                name,
                school,
            };
            setPlayers([...players, newPlayer]);
        }
        
        setName('');
        setSchool('');
    };

    const handleEdit = (player: Player) => {
        setEditId(player.id);
        setName(player.name);
        setSchool(player.school);
    };

    const handleDelete = (id: string) => {
        if (window.confirm('คุณแน่ใจหรือไม่ว่าต้องการลบผู้แข่งขันคนนี้?')) {
            setPlayers(players.filter(p => p.id !== id));
        }
    };
    
    const cancelEdit = () => {
        setEditId(null);
        setName('');
        setSchool('');
    }

    const handleSaveToFile = () => {
        if (players.length === 0) {
            alert("ไม่มีรายชื่อผู้แข่งขันให้บันทึก");
            return;
        }
        const dataStr = JSON.stringify(players, null, 2);
        const blob = new Blob([dataStr], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.download = "chess-players.json";
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

        // Helper to reset the file input's value.
        // This is important to allow the user to select the same file again.
        const cleanup = () => {
            if (fileInputRef.current) {
                fileInputRef.current.value = "";
            }
        };

        if (!file) {
            cleanup();
            return;
        }

        try {
            const text = await file.text();
            const importedPlayers = JSON.parse(text);

            // Stronger validation: check array structure and object property types
            if (!Array.isArray(importedPlayers) || !importedPlayers.every(p => 
                p && typeof p === 'object' &&
                typeof p.id === 'string' &&
                typeof p.name === 'string' &&
                typeof p.school === 'string'
            )) {
                throw new Error("ไฟล์ไม่ถูกต้องหรือมีรูปแบบข้อมูลที่ไม่ตรงกัน");
            }
            
            // Only ask for confirmation if there's existing data to overwrite
            if (players.length > 0) {
                if (!window.confirm("การนำเข้าจะเขียนทับรายชื่อผู้แข่งขันที่มีอยู่ คุณต้องการดำเนินการต่อหรือไม่?")) {
                    cleanup();
                    return; // User cancelled
                }
            }

            setPlayers(importedPlayers);
            alert(`นำเข้าข้อมูลผู้แข่งขัน ${importedPlayers.length} คนสำเร็จ`);

        } catch (error) {
            alert(`เกิดข้อผิดพลาดในการนำเข้าไฟล์: ${error instanceof Error ? error.message : 'Unknown error'}`);
        } finally {
            cleanup();
        }
    };


    return (
        <div className="bg-white p-6 rounded-lg shadow-lg">
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