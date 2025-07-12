<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Services\PesapalService;

class PesapalController extends Controller
{
    //
    protected $PesapalService; 

    public function __construct(PesapalService $pesapalService)
    {
        $this->pesapalService = $pesapalService;
    }

    public function initiatePayment(Request $request)
    {
        // dd("we get here "); 

        try{
        $request->validate([
            'amount' => 'required|numeric|min:1000',
            'phone_number' => 'required|string',
            'unique_id_reference' => 'required|string', 
            'email_address'=>'email|sometimes',
            ''
        ]);

        //save the order data in the wallet transactions table and then use the unique_id_reference which is the id in this table to act as the 
        // unique_id_reference (foreign key in the pesapal_payments_table)
        $orderData = [
            'amount' => $request->amount,
            'phone_number' => $request->phone_number,
            'unique_id_reference' => $request->unique_id_reference,
            'description' => $request->description ?? 'Luseke Wallet Donation',
            'email' => $request->email ?? null,
            'first_name ' =>$request->first_name ?? 'annonymous'
        ];

        // dd("here"); 


        $response = $this->pesapalService->submitOrder($orderData);

        if ($response['success']) {
            return response()->json([
                'success' => true,
                'redirect_url' => $response['redirect_url'],
                'order_tracking_id' => $response['order_tracking_id'],
                'merchant_reference' => $response['merchant_reference']
            ]);
        }

        return response()->json([
            'success' => false,
            'message' => $response['message'] ?? 'Payment initiation failed'
        ], 400);

        }catch(\Exception $error){
            return response()->json([
                'status'=>0,
                'message'=>"an error occured ".$error->getMessage()
            ],500); 
        }
    }



    public function checkStatus(Request $request)
{
    // dd("we get here"); 

    $request->validate([
        'order_tracking_id' => 'required|string',
    ]);

    $result = $this->pesapalService->checkTransactionStatus($request->order_tracking_id);

    if ($result['success']) {
        return response()->json([
            'result' => $result['details'],
            
        ]);
    }

    return response()->json([
        'error' => $result['message']
    ], 400);
}
}
