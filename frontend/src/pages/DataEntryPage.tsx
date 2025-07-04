import React, { useState } from 'react';
import NormalPostForm from '../components/ui/forms/NormalPostForm';
import RegisteredPostForm from '../components/ui/forms/RegisteredPostForm';
import FaxForm from '../components/ui/forms/FaxForm';
import EmailForm from '../components/ui/forms/EmailForm';
import { toast } from 'react-toastify';

const DataEntryPage: React.FC = () => {
    const [activeTab, setActiveTab] = useState('Normal Post');

    const letterTypes = [
        { name: 'Normal Post', icon: 'PostAdd', color: 'bg-blue-500' },
        { name: 'Registered Post', icon: 'Mail', color: 'bg-green-500' },
        { name: 'Fax', icon: 'Fax', color: 'bg-orange-500' },
        { name: 'Email', icon: 'Email', color: 'bg-purple-500' }
    ];

    const handleFormSubmit = (data: any) => {
        console.log('Form submitted:', data);
        //toast.success(`${activeTab} entry submitted successfully!`);
    };

    const handleFormCancel = () => {
        toast.info('Form cancelled');
    };

    const renderForm = () => {
        const commonProps = {
            onSubmit: handleFormSubmit,
            onCancel: handleFormCancel,
            initialData: {},
        };

        switch (activeTab) {
            case 'Normal Post':
                return <NormalPostForm {...commonProps} />;
            case 'Registered Post':
                return <RegisteredPostForm {...commonProps} />;
            case 'Fax':
                return <FaxForm {...commonProps} />;
            case 'Email':
                return <EmailForm {...commonProps} />;
            default:
                return <NormalPostForm {...commonProps} />;
        }
    };

    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-gray-800">Data Entry</h1>
                    <p className="text-gray-600 mt-1">Create and manage letters</p>
                </div>
            </div>

            {/* Tabs */}
            <div className="bg-white rounded-lg shadow-md">
                <div className="border-b border-gray-200">
                    <nav className="flex space-x-8 px-6">
                        {letterTypes.map((type) => (
                            <button
                                key={type.name}
                                onClick={() => setActiveTab(type.name)}
                                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                                    activeTab === type.name
                                        ? 'border-purple-500 text-purple-600'
                                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                }`}
                            >
                                {type.name}
                            </button>
                        ))}
                    </nav>
                </div>

                {/* Tab Content */}
                <div className="p-6">
                    {renderForm()}
                </div>
            </div>
        </div>
    );
};

export default DataEntryPage;