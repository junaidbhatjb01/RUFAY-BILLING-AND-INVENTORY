import React, { useState } from 'react';
import { useData } from '../../contexts/DataContext';
import { Series } from '../../types';
import { PlusIcon, EditIcon, TrashIcon } from '../../components/ui/Icons';
import SeriesModal from '../../components/modals/SeriesModal';
import { getAirlineLogo } from '../../components/ui/AirlineLogos';

const SeriesList: React.FC = () => {
    const { series, addSeries, updateSeries, deleteSeries } = useData();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingSeries, setEditingSeries] = useState<Series | null>(null);

    const handleSaveSeries = async (seriesData: Series) => {
        if (editingSeries) {
            await updateSeries(seriesData);
        } else {
            const { id, ...newSeriesData } = seriesData;
            await addSeries(newSeriesData);
        }
        setEditingSeries(null);
    };

    const handleDelete = (id: string) => {
        if(window.confirm("Are you sure? Deleting a series is permanent.")) {
            deleteSeries(id);
        }
    };
    
    const openEditModal = (seriesData: Series) => {
        setEditingSeries(seriesData);
        setIsModalOpen(true);
    };
    
    const openAddModal = () => {
        setEditingSeries(null);
        setIsModalOpen(true);
    };

    return (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">Series / Ticket Inventory</h1>
                <button onClick={openAddModal} className="bg-teal-600 text-white px-4 py-2 rounded-md hover:bg-teal-700 flex items-center">
                    <PlusIcon className="w-5 h-5 mr-2" />
                    Add Series
                </button>
            </div>

            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead className="bg-gray-50 dark:bg-gray-700">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">PNR</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Airline</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Route</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Departure</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Seats (Avail/Total)</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                        {series.map(s => {
                            const LogoComponent = getAirlineLogo(s.airline);
                            return (
                                <tr key={s.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">{s.pnr}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                                        <div className="flex items-center">
                                            {LogoComponent && <LogoComponent className="h-6 w-8 mr-2 object-contain" />}
                                            <span>{s.airline}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm">{s.route}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm">{new Date(s.departureDate).toLocaleString()}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-bold">{s.availableSeats} / {s.totalSeats}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <button onClick={() => openEditModal(s)} className="text-teal-600 hover:text-teal-900 dark:text-teal-400 dark:hover:text-teal-200 mr-4"><EditIcon className="w-5 h-5 inline" /></button>
                                        <button onClick={() => handleDelete(s.id)} className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-200"><TrashIcon className="w-5 h-5 inline" /></button>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
                 {series.length === 0 && <p className="text-center py-8 text-gray-500">No series found. Add your first ticket series to get started.</p>}
            </div>
            <SeriesModal 
                isOpen={isModalOpen} 
                onClose={() => setIsModalOpen(false)}
                onSave={handleSaveSeries}
                series={editingSeries}
            />
        </div>
    );
};

export default SeriesList;
