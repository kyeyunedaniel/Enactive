// resources/js/Pages/ButtonsAndGraphics.jsx

import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';
import { 
    QuestionMarkCircleIcon,
    ArrowDownTrayIcon,
    SparklesIcon,
    ShareIcon,
    QrCodeIcon
} from '@heroicons/react/24/outline';

// --- Reusable Components for this page ---

// Enhanced Card component with hover effects
const Card = ({ children, className = '', title, description, actionText, actionIcon, actionHref = "#" }) => (
    <div className={`bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow p-6 sm:p-8 ${className}`}>
        {children}
        <h3 className="text-xl font-bold text-gray-800 mt-6">{title}</h3>
        <p className="text-sm text-gray-600 mt-2 flex-grow">
            {description}
        </p>
        <div className="mt-6">
            <Link 
                href={actionHref} 
                className={`inline-flex items-center gap-2 font-medium ${actionIcon ? 'px-6' : 'px-8'} py-2.5 rounded-full transition-colors
                    border border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400`}
            >
                {actionIcon && <actionIcon className="w-5 h-5"/>}
                {actionText}
            </Link>
        </div>
    </div>
);

// Enhanced Stream Alert preview with animation and green accents
const StreamAlertPreview = () => (
    <div className="relative h-40 w-full bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg flex items-center justify-center p-4 overflow-hidden group">
        <div className="relative w-64 h-20 animate-pulse-once">
            {/* Green background part */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-40 h-8 bg-green-700 flex items-center justify-center transform -skew-x-[20deg] animate-slide-in">
                <p className="text-white text-xs font-bold tracking-wider transform skew-x-[20deg]">NEW SUPPORTER</p>
            </div>
            {/* White banner part */}
            <div className="absolute top-5 left-0 right-0 h-12 bg-white flex items-center justify-center animate-expand-width border border-gray-200">
                <svg className="absolute left-0 top-0 h-full w-4 text-white" viewBox="0 0 16 48" fill="currentColor" preserveAspectRatio="none"><path d="M0 0 L16 24 L0 48 Z"></path></svg>
                <svg className="absolute right-0 top-0 h-full w-4 text-white" viewBox="0 0 16 48" fill="currentColor" preserveAspectRatio="none"><path d="M16 0 L0 24 L16 48 Z"></path></svg>
                <p className="font-semibold text-gray-800 truncate px-2">John bought you 4 coffees</p>
            </div>
        </div>
    </div>
);

// Enhanced QR Code with green accents
const QrCodeWithLogo = () => (
    <div className="relative h-40 w-full bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg flex items-center justify-center p-4 group">
        <div className="relative w-32 h-32">
            {/* QR Code SVG background */}
            <svg viewBox="0 0 140 140" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path fillRule="evenodd" clipRule="evenodd" d="M0 0H50V50H0V0ZM10 10V40H40V10H10Z" fill="#111827"/>
                <path d="M60 10H70V20H60V10ZM60 30H70V40H60V30ZM60 60H70V70H60V60ZM80 40H90V50H80V40ZM80 60H90V70H80V60ZM100 10H110V20H100V10ZM100 40H110V50H100V40ZM100 60H110V70H100V60ZM120 0H130V20H120V0ZM120 30H130V50H120V30ZM120 60H130V70H120V60ZM10 60H20V70H10V60ZM30 60H40V70H30V60ZM10 80H20V90H10V80ZM10 100H20V110H10V100ZM10 120H20V130H10V120ZM30 80H40V90H30V80ZM30 100H40V110H30V100ZM30 120H40V130H30V120ZM60 80H70V90H60V80ZM60 100H70V110H60V100ZM60 120H70V130H60V120ZM80 80H90V90H80V80ZM80 100H90V110H80V100ZM80 120H90V130H80V120ZM100 80H110V90H100V80ZM100 100H110V110H100V100ZM100 120H110V130H100V120ZM120 80H130V90H120V80ZM120 100H130V110H120V100ZM120 120H130V130H120V120Z" fill="#111827"/>
                <path fillRule="evenodd" clipRule="evenodd" d="M90 0H140V50H90V0ZM100 10V40H130V10H100Z" fill="#111827"/>
                <path fillRule="evenodd" clipRule="evenodd" d="M0 90H50V140H0V90ZM10 100V130H40V100H10Z" fill="#111827"/>
            </svg>
            {/* Centered Logo */}
            <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-10 h-10 bg-green-600 rounded-md flex items-center justify-center p-1 group-hover:rotate-6 transition-transform">
                    <svg className="w-full h-full text-white" viewBox="0 0 24 24" fill="currentColor"><path d="M18.5 3H6c-1.93 0-3.5 1.57-3.5 3.5V11c0 1.93 1.57 3.5 3.5 3.5h7c1.93 0 3.5-1.57 3.5-3.5V9h2.5c1.38 0 2.5-1.12 2.5-2.5S23.38 4 22 4h-2.5V3.5C19.5 3.22 18.78 3 18.5 3zM16.5 11c0 .83-.67 1.5-1.5 1.5h-7c-.83 0-1.5-.67-1.5-1.5V6.5C6.5 5.67 7.17 5 8 5h7c.83 0 1.5.67 1.5 1.5V11zM20 16h-2v4h2c1.1 0 2-.9 2-2s-.9-2-2-2z"/></svg>
                </div>
            </div>
        </div>
    </div>
);

// Shareable Graphic Component with green accents
const ShareableGraphic = ({ title, bgColor, textColor, pattern = false }) => (
    <div className={`aspect-video rounded-xl flex flex-col items-center justify-center p-6 relative overflow-hidden ${bgColor}`}>
        {pattern && (
            <div className="absolute inset-0 opacity-10" style={{ 
                backgroundImage: 'linear-gradient(45deg, currentColor 25%, transparent 25%), linear-gradient(-45deg, currentColor 25%, transparent 25%), linear-gradient(45deg, transparent 75%, currentColor 75%), linear-gradient(-45deg, transparent 75%, currentColor 75%)',
                backgroundSize: '20px 20px',
                backgroundPosition: '0 0, 0 10px, 10px -10px, -10px 0px'
            }}></div>
        )}
        <div className="relative z-10 text-center">
            <SparklesIcon className="w-8 h-8 mx-auto mb-3" />
            <p className={`font-bold text-lg ${textColor}`}>{title}</p>
            <div className="mt-4 flex gap-2">
                <button className={`flex items-center gap-1 ${textColor} text-sm bg-black/10 hover:bg-black/20 px-3 py-1 rounded-full transition-colors`}>
                    <ArrowDownTrayIcon className="w-4 h-4" />
                    Download
                </button>
                <button className={`flex items-center gap-1 ${textColor} text-sm bg-black/10 hover:bg-black/20 px-3 py-1 rounded-full transition-colors`}>
                    <ShareIcon className="w-4 h-4" />
                    Share
                </button>
            </div>
        </div>
    </div>
);

export default function ButtonsAndGraphics({ auth }) {
    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <h1 className="text-2xl font-bold text-gray-800">
                        Buttons & Graphics
                    </h1>
                    <Link 
                        href="#" 
                        className="flex items-center gap-2 text-sm font-medium text-gray-700 hover:text-gray-900"
                    >
                        <QrCodeIcon className="w-4 h-4" />
                        Embed options
                    </Link>
                </div>
            }
        >
            <Head title="Buttons & Graphics" />
            
            {/* Floating Help Button */}
            <button 
                className="fixed bottom-6 right-6 bg-green-600 text-white w-12 h-12 rounded-full flex items-center justify-center shadow-lg hover:bg-green-700 transition-colors z-50 group"
                aria-label="Help"
            >
                <QuestionMarkCircleIcon className="w-7 h-7 group-hover:scale-110 transition-transform" />
            </button>

            <div className="space-y-12">
                {/* Top Section: Stream Alerts & QR Code */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Stream Alerts Card */}
                    <Card 
                        title="Stream alerts"
                        description="Accept support while you're streaming. Create stream alerts that pop up with your supporter's name and their thank you message."
                        actionText="Enable"
                        actionIcon={SparklesIcon}
                    >
                        <StreamAlertPreview />
                    </Card>

                    {/* QR Code Card */}
                    <Card 
                        title="QR code"
                        description="Generate a fancy QR code for your page and give your audience a quick, simple way to make a support."
                        actionText="Download"
                        actionIcon={ArrowDownTrayIcon}
                    >
                        <QrCodeWithLogo />
                    </Card>
                </div>

                {/* Images & Shareables Section */}
                <div>
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-2xl font-bold text-gray-800">Images & Shareables</h2>
                        <Link href="#" className="text-sm font-medium text-gray-600 hover:text-gray-900">
                            View all templates →
                        </Link>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Social Media Shareable Graphic */}
                        <ShareableGraphic 
                            title="Support me on" 
                            bgColor="bg-green-100" 
                            textColor="text-green-800"
                        />
                        
                        {/* Thanks Graphic */}
                        <ShareableGraphic 
                            title="Thanks for your support!" 
                            bgColor="bg-green-800" 
                            textColor="text-white"
                            pattern={true}
                        />
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}