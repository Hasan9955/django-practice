import { useGetPlatformDataForUserSupportQuery } from '@/redux/features/banner/bannerSlice';
import { Skeleton } from 'antd';
import React from 'react';

const ShippingPolicy = () => {
    const { data, isLoading } = useGetPlatformDataForUserSupportQuery({});
    
    // Adjusted skeleton height to match the new compact card
    if (isLoading) {
        return (
            <div className="max-w-2xl mx-auto p-4 mt-4 bg-white rounded-xl shadow-sm border border-gray-100">
                <Skeleton active paragraph={{ rows: 2 }} />
            </div>
        );
    }

    const shippingPolicy = data?.result?.shippingPolicy || [];

    return (
        <div className="max-w-2xl mx-auto p-4 md:p-5 mt-4 bg-white rounded-xl shadow-sm border border-gray-100">
            
            {/* Header Section (Smaller text and icon) */}
            <div className="flex items-center gap-2 mb-4 pb-3 border-b border-gray-100">
                <div className="p-1.5 bg-indigo-50 rounded-md text-indigo-600">
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                    </svg>
                </div>
                <h3 className="text-lg md:text-xl font-bold text-gray-900">
                    Shipping Policy
                </h3>
            </div>
            
            {/* Policy List (Tighter spacing and smaller padding) */}
            {shippingPolicy.length > 0 ? (
                <ul className="space-y-2">
                    {shippingPolicy.map((policy : string, index : number) => (
                        <li 
                            key={index} 
                            className="flex items-start gap-2.5 p-2.5 md:p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors duration-200"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-green-500 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <span className="text-gray-700 text-sm md:text-base leading-snug">
                                {policy}
                            </span>
                        </li>
                    ))}
                </ul>
            ) : (
                <div className="text-center py-4 bg-gray-50 rounded-lg">
                    <p className="text-gray-500 text-sm italic">No shipping policy details available.</p>
                </div>
            )}
        </div>
    );
};

export default ShippingPolicy;