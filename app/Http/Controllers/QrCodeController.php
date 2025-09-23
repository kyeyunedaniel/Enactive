<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
// use SimpleSoftwareIO\QrCode\Facades\QrCode;
use App\Models\User; 
use Auth; 
use Inertia\Inertia; 
// use App\Models\;

class QrCodeController extends Controller
{
    //
    public function viewRiderQRCode()
{
    try {
    
        // $user_id = $user->user_id;
        $public_url= Auth::user()->public_url_name; 
        $user_public_url_final= config('app.url'). '/' .$public_url.'.app' ; 
       
        $code =$user_public_url_final; 
        // Generate the QR code as SVG
        // $qrCode = QrCode::size(300)->generate($code);
        $qrCode=''; 

        return response($qrCode)
            ->header('Content-Type', 'image/svg+xml');

        return Inertia::render('DashboardScreens/ButtonsAndGraphics',[
        'auth' => [
            'user' => Auth::user() ? Auth::user()->only('id') : null
        ],
        ''
    ]); //Pages/DashboardScreens/Support.jsx

    } catch (\Exception $error) {
        return response()->json([
            'message' => 'An error occurred while generating QR code',
            'error' => $error->getMessage()
        ], 500);
    }
}
}
