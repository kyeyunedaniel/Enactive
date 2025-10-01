<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use SimpleSoftwareIO\QrCode\Facades\QrCode;
use App\Models\User; 
use Auth; 
use Inertia\Inertia; 
// use App\Models\;

class QrCodeController extends Controller
{
    //
//     public function viewRiderQRCode()
// {
//     try {
//         $public_url = Auth::user()->public_url_name; 
//         $user_public_url_final = config('app.url') . '/' . $public_url . '.app'; 
//         $code = $user_public_url_final; 

//         // Generate the QR code as SVG
//         $qrCode = QrCode::size(300)->generate($code);

//         // Return both the QR code and user data to the frontend
//         return Inertia::render('DashboardScreens/ButtonsAndGraphics', [
//             'auth' => [
//                 'user' => Auth::user() ? Auth::user()->only('id', 'public_url_name') : null
//             ],
//             'qrCode' => $qrCode,
//             'qrCodeUrl' => $code
//         ]);

//     } catch (\Exception $error) {
//         return response()->json([
//             'message' => 'An error occurred while generating QR code',
//             'error' => $error->getMessage()
//         ], 500);
//     }
// }

public function viewRiderQRCode()
{
    try {
        $public_url = Auth::user()->public_url_name; 
        $user_public_url_final = config('app.url') . '/' . $public_url . '.app'; 
        $code = $user_public_url_final; 

        // Generate the QR code as SVG
        $svg = QrCode::size(300)->generate($code);
        
        // Convert SVG to data URI (like in the working example)
        $svgDataUri = 'data:image/svg+xml;base64,' . base64_encode($svg);

        // dd( $svgDataUri);
        // Return both the QR code and user data to the frontend
        return Inertia::render('DashboardScreens/ButtonsAndGraphics', [
            'auth' => [
                'user' => Auth::user() ? Auth::user()->only('id', 'public_url_name') : null
            ],
            'qrCode' => $svgDataUri, // Use data URI like in working example
            'qrCodeUrl' => $code
        ]);

    } catch (\Exception $error) {
        return response()->json([
            'message' => 'An error occurred while generating QR code',
            'error' => $error->getMessage()
        ], 500);
    }
}

}
