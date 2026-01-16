'use client';

interface ActsFilterProps {
    allActs: string[];
    selectedActs: string[];
    onChange: (acts: string[]) => void;
}

export default function ActsFilter({ allActs, selectedActs, onChange }: ActsFilterProps) {
    const handleToggle = (act: string) => {
        if (selectedActs.includes(act)) {
            onChange(selectedActs.filter(a => a !== act));
        } else {
            onChange([...selectedActs, act]);
        }
    };

    const handleSelectAll = () => {
        if (selectedActs.length === allActs.length) {
            onChange([]);
        } else {
            onChange([...allActs]);
        }
    };

    return (
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 mb-6">
            <div className="flex justify-between items-center mb-3">
                <h3 className="font-semibold text-gray-800">เลือก พรบ. ที่ต้องการแสดง</h3>
                <button
                    onClick={handleSelectAll}
                    className="text-sm text-blue-600 hover:text-blue-800 underline"
                >
                    {selectedActs.length === allActs.length ? 'ยกเลิกทั้งหมด' : 'เลือกทั้งหมด'}
                </button>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
                {allActs.map((act) => (
                    <label key={act} className="flex items-center space-x-2 cursor-pointer select-none">
                        <input
                            type="checkbox"
                            checked={selectedActs.includes(act)}
                            onChange={() => handleToggle(act)}
                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 w-4 h-4"
                        />
                        <span className="text-sm text-gray-700">{act}</span>
                    </label>
                ))}
            </div>
        </div>
    );
}
