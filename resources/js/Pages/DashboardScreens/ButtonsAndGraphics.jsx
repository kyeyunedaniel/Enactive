// resources/js/Pages/ButtonsAndGraphics.jsx

import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';
import { 
    QuestionMarkCircleIcon,
    ArrowDownTrayIcon
} from '@heroicons/react/24/outline';

// --- Reusable Components for this page ---

// A generic container card (can be reused from other pages)
const Card = ({ children, className = '' }) => (
    <div className={`bg-white rounded-xl shadow-sm p-6 sm:p-8 ${className}`}>
        {children}
    </div>
);

// Custom SVG component for the Stream Alert preview
const StreamAlertPreview = () => (
    <div className="relative h-40 w-full bg-gray-50 rounded-lg flex items-center justify-center p-4 overflow-hidden">
        <div className="relative w-64 h-20">
            {/* Black background part */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-40 h-8 bg-gray-900 flex items-center justify-center transform -skew-x-[20deg]">
                <p className="text-white text-xs font-bold tracking-wider transform skew-x-[20deg]">NEW SUPPORTER</p>
            </div>
            {/* Yellow banner part */}
            <div className="absolute top-5 left-0 right-0 h-12 bg-yellow-400 flex items-center justify-center">
                 <svg className="absolute left-0 top-0 h-full w-4 text-yellow-400" viewBox="0 0 16 48" fill="currentColor" preserveAspectRatio="none"><path d="M0 0 L16 24 L0 48 Z"></path></svg>
                 <svg className="absolute right-0 top-0 h-full w-4 text-yellow-400" viewBox="0 0 16 48" fill="currentColor" preserveAspectRatio="none"><path d="M16 0 L0 24 L16 48 Z"></path></svg>
                <p className="font-semibold text-gray-800">John bought you 4 coffees</p>
            </div>
        </div>
    </div>
);

// Custom SVG component for the QR Code with a logo
const QrCodeWithLogo = () => (
    <div className="relative h-40 w-full bg-gray-50 rounded-lg flex items-center justify-center p-4">
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
                <div className="w-10 h-10 bg-yellow-400 rounded-md flex items-center justify-center p-1">
                    <svg className="w-full h-full text-gray-800" viewBox="0 0 24 24" fill="currentColor"><path d="M18.5 3H6c-1.93 0-3.5 1.57-3.5 3.5V11c0 1.93 1.57 3.5 3.5 3.5h7c1.93 0 3.5-1.57 3.5-3.5V9h2.5c1.38 0 2.5-1.12 2.5-2.5S23.38 4 22 4h-2.5V3.5C19.5 3.22 18.78 3 18.5 3zM16.5 11c0 .83-.67 1.5-1.5 1.5h-7c-.83 0-1.5-.67-1.5-1.5V6.5C6.5 5.67 7.17 5 8 5h7c.83 0 1.5.67 1.5 1.5V11zM20 16h-2v4h2c1.1 0 2-.9 2-2s-.9-2-2-2z"/></svg>
                </div>
            </div>
        </div>
    </div>
);


export default function ButtonsAndGraphics({ auth }) {
    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                <h1 className="text-2xl font-bold text-gray-800">
                    Buttons & Graphics
                </h1>
            }
        >
            <Head title="Buttons & Graphics" />
            
            {/* Floating Help Button */}
            <button className="fixed bottom-6 right-6 bg-gray-900 text-white w-12 h-12 rounded-full flex items-center justify-center shadow-lg hover:bg-gray-800 transition-colors z-50">
                <QuestionMarkCircleIcon className="w-7 h-7" />
            </button>

            <div className="space-y-12">
                {/* Top Section: Stream Alerts & QR Code */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Stream Alerts Card */}
                    <Card className="flex flex-col text-center">
                        <StreamAlertPreview />
                        <h3 className="text-xl font-bold text-gray-800 mt-6">Stream alerts</h3>
                        <p className="text-sm text-gray-600 mt-2 flex-grow">
                            Accept support while you're streaming. Create stream alerts that pop up with your supporter's name and their thank you message.
                        </p>
                        <div className="mt-6">
                            <Link href="#" className="inline-block font-semibold text-gray-700 border border-gray-300 rounded-full px-8 py-2.5 hover:bg-gray-100 transition-colors">
                                Enable
                            </Link>
                        </div>
                    </Card>

                    {/* QR Code Card */}
                     <Card className="flex flex-col text-center">
                        <QrCodeWithLogo />
                        <h3 className="text-xl font-bold text-gray-800 mt-6">QR code</h3>
                        <p className="text-sm text-gray-600 mt-2 flex-grow">
                            Generate a fancy QR code for your page and give your audience a quick, simple way to make a support.
                        </p>
                        <div className="mt-6">
                            <Link href="#" className="inline-flex items-center gap-2 font-semibold text-gray-700 border border-gray-300 rounded-full px-8 py-2.5 hover:bg-gray-100 transition-colors">
                                <ArrowDownTrayIcon className="w-5 h-5"/>
                                Download
                            </Link>
                        </div>
                    </Card>
                </div>

                {/* Images & Shareables Section */}
                <div>
                    <h2 className="text-2xl font-bold text-gray-800 mb-4">Images & Shareables</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Placeholder for "Buymeacoffee" graphic */}
                        <div className="bg-yellow-300 aspect-video rounded-xl flex items-center justify-center p-4">
                           <p className="text-yellow-800 font-bold text-lg text-center">Social Media Shareable Graphic</p>
                        </div>
                        {/* Placeholder for "Thanks" graphic with checkerboard bg */}
                        <div
                            className="aspect-video rounded-xl flex items-center justify-center p-4"
                            style={{ 
                                backgroundImage: 'linear-gradient(45deg, #e5e7eb 25%, transparent 25%), linear-gradient(-45deg, #e5e7eb 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #e5e7eb 75%), linear-gradient(-45deg, transparent 75%, #e5e7eb 75%)',
                                backgroundSize: '20px 20px',
                                backgroundPosition: '0 0, 0 10px, 10px -10px, -10px 0px'
                             }}
                        >
                             <p className="text-white font-bold text-xl text-center bg-black/50 px-4 py-2 rounded-md">"Thanks for your support" Graphic</p>
                        </div>
                    </div>
                </div>
            </div>

        </AuthenticatedLayout>
    );
}