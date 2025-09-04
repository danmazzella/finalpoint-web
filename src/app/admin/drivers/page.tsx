'use client';

import { useState, useEffect } from 'react';
import { driversAPI } from '@/lib/api';
import { useRouter } from 'next/navigation';
import logger from '@/utils/logger';

interface Driver {
    id: number;
    name: string;
    team: string;
    driverNumber: number;
    country: string;
    isActive: boolean;
    seasonYear: number;
    createdAt: string;
    updatedAt: string;
}

export default function AdminDriversPage() {
    const router = useRouter();
    const [drivers, setDrivers] = useState<Driver[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'inactive'>('all');
    const [editingDriver, setEditingDriver] = useState<Driver | null>(null);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showAddModal, setShowAddModal] = useState(false);

    useEffect(() => {
        loadDrivers();
    }, []);

    const loadDrivers = async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await driversAPI.getAllDriversAdmin();

            if (response.status === 200) {
                setDrivers(response.data.data || []);
            } else {
                setError('Failed to load drivers');
            }
        } catch (error) {
            logger.forceError('Error loading drivers:', error);
            setError('Failed to load drivers');
        } finally {
            setLoading(false);
        }
    };

    const handleStatusToggle = async (driverId: number, currentStatus: boolean) => {
        try {
            setError(null);
            const response = await driversAPI.updateDriverStatusAdmin(driverId, !currentStatus);

            if (response.status === 200) {
                setSuccess(`Driver status updated successfully to ${!currentStatus ? 'active' : 'inactive'}`);
                await loadDrivers(); // Reload the list
                setTimeout(() => setSuccess(null), 3000);
            } else {
                setError('Failed to update driver status');
            }
        } catch (error) {
            logger.forceError('Error updating driver status:', error);
            setError('Failed to update driver status');
        }
    };

    const handleEditDriver = (driver: Driver) => {
        setEditingDriver(driver);
        setShowEditModal(true);
    };

    const handleSaveDriver = async (driverData: Driver) => {
        try {
            setError(null);
            const response = await driversAPI.updateDriverAdmin(driverData.id, {
                name: driverData.name,
                team: driverData.team,
                driverNumber: driverData.driverNumber,
                country: driverData.country,
                isActive: driverData.isActive
            });

            if (response.status === 200) {
                setSuccess('Driver updated successfully');
                setShowEditModal(false);
                setEditingDriver(null);
                await loadDrivers(); // Reload the list
                setTimeout(() => setSuccess(null), 3000);
            } else {
                setError('Failed to update driver');
            }
        } catch (error) {
            logger.forceError('Error updating driver:', error);
            setError('Failed to update driver');
        }
    };

    const handleAddDriver = async (driverData: Omit<Driver, 'id' | 'createdAt' | 'updatedAt'>) => {
        try {
            setError(null);
            const response = await driversAPI.createDriverAdmin(driverData);

            if (response.status === 201) {
                setSuccess('Driver created successfully');
                setShowAddModal(false);
                await loadDrivers(); // Reload the list
                setTimeout(() => setSuccess(null), 3000);
            } else {
                setError('Failed to create driver');
            }
        } catch (error) {
            logger.forceError('Error creating driver:', error);
            setError('Failed to create driver');
        }
    };

    const filteredDrivers = drivers.filter(driver => {
        if (filterStatus === 'all') return true;
        if (filterStatus === 'active') return driver.isActive;
        if (filterStatus === 'inactive') return !driver.isActive;
        return true;
    });

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-green-500"></div>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto space-y-6">
            {/* Header */}
            <div className="bg-white shadow-lg rounded-lg p-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Driver Management</h1>
                        <p className="text-gray-600 mt-1">Manage F1 drivers and their active status</p>
                    </div>
                    <div className="flex space-x-3">
                        <button
                            onClick={() => setShowAddModal(true)}
                            className="px-4 py-2 text-sm font-medium text-white bg-green-600 border border-transparent rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                        >
                            Add New Driver
                        </button>
                        <button
                            onClick={() => router.back()}
                            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                        >
                            Back to Admin
                        </button>
                    </div>
                </div>
            </div>

            {/* Filter Controls */}
            <div className="bg-white shadow-lg rounded-lg p-6">
                <div className="flex items-center space-x-4">
                    <label className="text-sm font-medium text-gray-700">Filter by status:</label>
                    <select
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value as 'all' | 'active' | 'inactive')}
                        className="px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
                    >
                        <option value="all">All Drivers</option>
                        <option value="active">Active Only</option>
                        <option value="inactive">Inactive Only</option>
                    </select>
                    <span className="text-sm text-gray-500">
                        Showing {filteredDrivers.length} of {drivers.length} drivers
                    </span>
                </div>
            </div>

            {/* Error and Success Messages */}
            {error && (
                <div className="bg-red-50 border border-red-200 rounded-md p-4">
                    <div className="flex">
                        <div className="flex-shrink-0">
                            <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                            </svg>
                        </div>
                        <div className="ml-3">
                            <p className="text-sm text-red-800">{error}</p>
                        </div>
                    </div>
                </div>
            )}

            {success && (
                <div className="bg-green-50 border border-green-200 rounded-md p-4">
                    <div className="flex">
                        <div className="flex-shrink-0">
                            <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                        </div>
                        <div className="ml-3">
                            <p className="text-sm text-green-800">{success}</p>
                        </div>
                    </div>
                </div>
            )}

            {/* Drivers Table */}
            <div className="bg-white shadow-lg rounded-lg overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200">
                    <h2 className="text-lg font-medium text-gray-900">Drivers</h2>
                </div>
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Driver
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Team
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Number
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Country
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Status
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {filteredDrivers.map((driver) => (
                                <tr key={driver.id} className={!driver.isActive ? 'bg-gray-50' : ''}>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center">
                                            <div className="text-sm font-medium text-gray-900">
                                                {driver.name}
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                        {driver.team}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                        {driver.driverNumber}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                        {driver.country}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${driver.isActive
                                            ? 'bg-green-100 text-green-800'
                                            : 'bg-red-100 text-red-800'
                                            }`}>
                                            {driver.isActive ? 'Active' : 'Inactive'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                                        <button
                                            onClick={() => handleStatusToggle(driver.id, driver.isActive)}
                                            className={`text-sm px-3 py-1 rounded-md ${driver.isActive
                                                ? 'text-red-600 hover:text-red-900 bg-red-50 hover:bg-red-100'
                                                : 'text-green-600 hover:text-green-900 bg-green-50 hover:bg-green-100'
                                                }`}
                                        >
                                            {driver.isActive ? 'Deactivate' : 'Activate'}
                                        </button>
                                        <button
                                            onClick={() => handleEditDriver(driver)}
                                            className="text-blue-600 hover:text-blue-900 text-sm px-3 py-1 rounded-md bg-blue-50 hover:bg-blue-100"
                                        >
                                            Edit
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Edit Driver Modal */}
            {showEditModal && editingDriver && (
                <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
                    <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
                        <div className="mt-3">
                            <h3 className="text-lg font-medium text-gray-900 mb-4">Edit Driver</h3>
                            <EditDriverForm
                                driver={editingDriver}
                                onSave={handleSaveDriver}
                                onCancel={() => {
                                    setShowEditModal(false);
                                    setEditingDriver(null);
                                }}
                            />
                        </div>
                    </div>
                </div>
            )}

            {/* Add Driver Modal */}
            {showAddModal && (
                <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
                    <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
                        <div className="mt-3">
                            <h3 className="text-lg font-medium text-gray-900 mb-4">Add New Driver</h3>
                            <AddDriverForm
                                onSave={handleAddDriver}
                                onCancel={() => setShowAddModal(false)}
                            />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

interface EditDriverFormProps {
    driver: Driver;
    onSave: (driver: Driver) => void;
    onCancel: () => void;
}

function EditDriverForm({ driver, onSave, onCancel }: EditDriverFormProps) {
    const [formData, setFormData] = useState<Driver>(driver);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        await onSave(formData);
        setLoading(false);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <label className="block text-sm font-medium text-gray-700">Name</label>
                <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
                    required
                />
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700">Team</label>
                <input
                    type="text"
                    value={formData.team}
                    onChange={(e) => setFormData({ ...formData, team: e.target.value })}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
                    required
                />
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700">Driver Number</label>
                <input
                    type="number"
                    value={formData.driverNumber}
                    onChange={(e) => setFormData({ ...formData, driverNumber: parseInt(e.target.value) })}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
                    required
                />
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700">Country</label>
                <input
                    type="text"
                    value={formData.country}
                    onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
                    required
                />
            </div>
            <div>
                <label className="flex items-center">
                    <input
                        type="checkbox"
                        checked={formData.isActive}
                        onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                        className="rounded border-gray-300 text-green-600 shadow-sm focus:border-green-300 focus:ring focus:ring-green-200 focus:ring-opacity-50"
                    />
                    <span className="ml-2 text-sm text-gray-700">Active Driver</span>
                </label>
            </div>
            <div className="flex justify-end space-x-3 pt-4">
                <button
                    type="button"
                    onClick={onCancel}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                >
                    Cancel
                </button>
                <button
                    type="submit"
                    disabled={loading}
                    className="px-4 py-2 text-sm font-medium text-white bg-green-600 border border-transparent rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
                >
                    {loading ? 'Saving...' : 'Save Changes'}
                </button>
            </div>
        </form>
    );
}

interface AddDriverFormProps {
    onSave: (driverData: Omit<Driver, 'id' | 'createdAt' | 'updatedAt'>) => void;
    onCancel: () => void;
}

function AddDriverForm({ onSave, onCancel }: AddDriverFormProps) {
    const [formData, setFormData] = useState({
        name: '',
        team: '',
        driverNumber: 0,
        country: '',
        isActive: true,
        seasonYear: 2025
    });
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (formData.driverNumber <= 0) {
            alert('Driver number must be a positive number');
            return;
        }
        setLoading(true);
        await onSave(formData);
        setLoading(false);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <label className="block text-sm font-medium text-gray-700">Name</label>
                <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
                    required
                />
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700">Team</label>
                <input
                    type="text"
                    value={formData.team}
                    onChange={(e) => setFormData({ ...formData, team: e.target.value })}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
                    required
                />
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700">Driver Number</label>
                <input
                    type="number"
                    value={formData.driverNumber || ''}
                    onChange={(e) => setFormData({ ...formData, driverNumber: parseInt(e.target.value) || 0 })}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
                    required
                    min="1"
                />
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700">Country</label>
                <input
                    type="text"
                    value={formData.country}
                    onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
                    required
                />
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700">Season Year</label>
                <input
                    type="number"
                    value={formData.seasonYear}
                    onChange={(e) => setFormData({ ...formData, seasonYear: parseInt(e.target.value) })}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
                    required
                    min="2020"
                    max="2030"
                />
            </div>
            <div>
                <label className="flex items-center">
                    <input
                        type="checkbox"
                        checked={formData.isActive}
                        onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                        className="rounded border-gray-300 text-green-600 shadow-sm focus:border-green-300 focus:ring focus:ring-green-200 focus:ring-opacity-50"
                    />
                    <span className="ml-2 text-sm text-gray-700">Active Driver</span>
                </label>
            </div>
            <div className="flex justify-end space-x-3 pt-4">
                <button
                    type="button"
                    onClick={onCancel}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                >
                    Cancel
                </button>
                <button
                    type="submit"
                    disabled={loading}
                    className="px-4 py-2 text-sm font-medium text-white bg-green-600 border border-transparent rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
                >
                    {loading ? 'Creating...' : 'Create Driver'}
                </button>
            </div>
        </form>
    );
}
