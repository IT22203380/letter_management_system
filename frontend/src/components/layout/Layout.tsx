import { useState } from "react";
import Footer from './Footer';
import Sidebar from './Sidebar';
import AppBar from './AppBar';


// Import pages
import DataEntryDashboard from '../../pages/DataEntryDashboard';
import DataEntryPage from '../../pages/DataEntryPage';

// Sidebar components for Data Entry Operator
const sidebarComponents: { linkName: string; icon: string; component: React.ReactNode }[] = [
    { linkName: 'Dashboard', icon: 'Dashboard', component: <DataEntryDashboard /> },
    { linkName: 'Data Entry', icon: 'Assignment', component: <DataEntryPage /> },
];

const Layout = () => {
    const [isSidebarOpen, setSidebarOpen] = useState(true);
    const toggleSidebar = () => setSidebarOpen(prev => !prev);

    const [selectedIndex, setSelectedIndex] = useState(0); // Default to Dashboard

    return (
        <div className="flex flex-col h-screen">
            {/* Header with Sidebar Toggle */}
            <AppBar title={sidebarComponents[selectedIndex].linkName} setSidebarOpen={toggleSidebar} />

            <div className="flex flex-grow w-full">
                {/* Sidebar */}
                <Sidebar 
                    bgColor="#FFFFFF" 
                    textColor="#3B0044" 
                    links={sidebarComponents.map(({ linkName, icon }) => ({ linkName, icon }))} 
                    onSelect={setSelectedIndex} 
                    isSidebarOpen={isSidebarOpen} 
                />

                {/* Main Content Area */}
                <main
                
                    className="flex-grow mt-16 overflow-auto transition-all duration-300 bg-gray-50"
                    style={{
                        marginLeft: isSidebarOpen ? "250px" : "70px",
                    }}
                >
                    {sidebarComponents[selectedIndex].component}
                </main>
            </div>

            {/* Footer */}
            <Footer bgColor="#3B0044" className="border-t-2 border-gray-200" />
        </div>
    );
};

export default Layout;