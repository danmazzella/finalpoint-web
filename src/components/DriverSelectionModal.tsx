'use client';

import React from 'react';
import { Driver } from '@/lib/api';

interface DriverSelectionModalProps {
    isOpen: boolean;
    onClose: () => void;
    position: number;
    drivers: Driver[];
    selectedDriverId?: number;
    onDriverSelect: (driver: Driver, eventType: 'race' | 'sprint') => void;
    disabled?: boolean;
    submitting?: boolean;
    userPicks?: Map<number, number>; // position -> driverId mapping for race
    sprintPicks?: Map<number, number>; // position -> driverId mapping for sprint
    hasSprint?: boolean; // whether this is a sprint weekend
    eventType: 'race' | 'sprint'; // which event type this modal is for
}

export const DriverSelectionModal: React.FC<DriverSelectionModalProps> = ({
    isOpen,
    onClose,
    position,
    drivers,
    selectedDriverId,
    onDriverSelect,
    disabled = false,
    submitting = false,
    userPicks,
    sprintPicks,
    hasSprint = false,
    eventType,
}) => {
    if (!isOpen) return null;

    const handleDriverClick = (driver: Driver, eventType: 'race' | 'sprint') => {
        if (disabled || submitting) return;
        onDriverSelect(driver, eventType);
        onClose();
    };

    const getPositionLabel = (position: number) => {
        return `P${position}`;
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={onClose}></div>

            {/* Modal */}
            <div className="relative w-full max-w-4xl max-h-[90vh] bg-white rounded-lg shadow-xl overflow-hidden mx-4">
                {/* Header */}
                <div className="bg-white px-6 py-6 border-b border-gray-200">
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="text-xl font-semibold text-gray-900">
                                Select Driver for {getPositionLabel(position)} ({eventType === 'sprint' ? 'Sprint Race' : 'Main Race'})
                            </h3>
                            <p className="mt-1 text-sm text-gray-500">
                                Choose a driver for this position
                            </p>
                        </div>
                        <button
                            type="button"
                            className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
                            onClick={onClose}
                            disabled={submitting}
                            aria-label="Close modal"
                        >
                            <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                </div>

                {/* Drivers Grid */}
                <div className="px-6 py-6 bg-white max-h-[70vh] overflow-y-auto">
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                        {drivers.map((driver) => {
                            const isSelected = selectedDriverId === driver.id;
                            const currentPicks = eventType === 'race' ? userPicks : sprintPicks;
                            const isAlreadyPicked = currentPicks ? Array.from(currentPicks.entries()).some(([pos, driverId]) =>
                                pos !== position && driverId === driver.id
                            ) : false;
                            const isDisabled = disabled || submitting || isAlreadyPicked;

                            return (
                                <button
                                    key={driver.id}
                                    onClick={() => handleDriverClick(driver, eventType)}
                                    disabled={isDisabled}
                                    className={`p-4 border-2 rounded-xl text-left transition-all duration-200 ${isSelected
                                            ? 'border-blue-500 bg-blue-50 shadow-md'
                                            : isAlreadyPicked
                                                ? 'border-gray-300 bg-gray-100 opacity-60'
                                                : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50 hover:shadow-sm'
                                        } ${isDisabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                                >
                                    <div className="flex items-center justify-between mb-3">
                                        <span className="text-lg font-bold text-gray-600">#{driver.driverNumber}</span>
                                        <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">{driver.country}</span>
                                    </div>
                                    <h3 className="font-semibold text-gray-900 mb-2 text-base">{driver.name}</h3>
                                    <p className="text-sm text-gray-600 font-medium mb-3">{driver.team}</p>

                                    {isSelected && (
                                        <div className="mt-3 flex justify-center">
                                            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-blue-500 text-white">
                                                ✓ Selected
                                            </span>
                                        </div>
                                    )}
                                    {isAlreadyPicked && !isSelected && (
                                        <div className="mt-3 flex justify-center">
                                            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-gray-500 text-white">
                                                Already Picked
                                            </span>
                                        </div>
                                    )}
                                </button>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DriverSelectionModal;
