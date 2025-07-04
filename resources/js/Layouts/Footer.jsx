// resources/js/Components/Footer.jsx

import React from 'react';
import { Link } from '@inertiajs/react';

export default function Footer() {
    return (
        <footer className="mt-12 pt-8 border-t border-gray-200">
            <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 text-sm text-gray-500">
                <Link href="#" className="hover:underline">Help Center</Link>
                <Link href="#" className="hover:underline">FAQ</Link>
                <Link href="#" className="hover:underline">Contact</Link>
                <Link href="#" className="hover:underline">Refer a Creator</Link>
            </div>
        </footer>
    );
}