<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class PesapalService
{
    protected $baseUrl;
    protected $consumerKey;
    protected $consumerSecret;
    protected $callbackUrl;
    protected $ipnId;

    public function __construct()
    {
        $this->baseUrl = config('pesapal.base_url', 'https://pay.pesapal.com/v3');
        $this->consumerKey = config('pesapal.consumer_key');
        $this->consumerSecret = config('pesapal.consumer_secret');
        $this->callbackUrl = config('pesapal.callback_url');
        $this->ipnId = config('pesapal.ipn_id');
    }

    /**
     * Get authentication token from Pesapal
     */
    public function getAuthToken()
    {
        // dd($this->consumerKey); 
        // dd($this->consumerSecret); 
        try {
            $response = Http::withHeaders([
                'Accept' => 'application/json',
                'Content-Type' => 'application/json',
            ])->post($this->baseUrl . '/api/Auth/RequestToken', [
                'consumer_key' => $this->consumerKey,
                'consumer_secret' => $this->consumerSecret,
            ]);

            if ($response->successful()) {
                return $response->json()['token'];
            }

            Log::error('Pesapal Auth Failed', [
                'status' => $response->status(),
                'response' => $response->body()
            ]);
            return null;

        } catch (\Exception $e) {
            Log::error('Pesapal Auth Exception', ['error' => $e->getMessage()]);
            return null;
        }
    }

    /**
     * Submit payment order to Pesapal
     */
    public function submitOrder(array $orderData)
    {
        $token = $this->getAuthToken();
        if (!$token) {
            return [
                'success' => false,
                'message' => 'Failed to authenticate with Pesapal'
            ];
        }

        try {
            $payload = [
                'id' => $orderData['unique_id_reference'],
                'currency' => 'UGX',
                'amount' => $orderData['amount'],
                'description' => $orderData['description'] ?? 'Wallet Deposit',
                'callback_url' => $this->callbackUrl,
                'notification_id' => $this->ipnId,
                'billing_address' => [
                    'email_address' => $orderData['email'] ?? '',
                    'phone_number' => $orderData['phone_number'],
                    'country_code' => 'UG',
                ]
            ];

            $response = Http::withHeaders([
                'Accept' => 'application/json',
                'Content-Type' => 'application/json',
                'Authorization' => 'Bearer ' . $token,
            ])->post($this->baseUrl . '/api/Transactions/SubmitOrderRequest', $payload);

            if ($response->successful()) {
                $data = $response->json();
                
                Log::info('Pesapal Order Submitted', [
                    'merchant_reference' => $data['merchant_reference'],
                    'order_tracking_id' => $data['order_tracking_id'],
                    'redirect_url' => $data['redirect_url']
                ]);


                // you neeed to save the merchant_reference,order_tracking_id and redirect_url alongside using the unique_id_reference in the pesapal_transactions table 
                return [
                    'success' => true,
                    'order_tracking_id' => $data['order_tracking_id'],
                    'merchant_reference' => $data['merchant_reference'],
                    'redirect_url' => $data['redirect_url']
                ];
            }

            Log::error('Pesapal Order Submission Failed', [
                'status' => $response->status(),
                'response' => $response->body()
            ]);
            return [
                'success' => false,
                'message' => 'Failed to submit order to Pesapal',
                'response' => $response->body()
            ];

        } catch (\Exception $e) {
            Log::error('Pesapal Order Exception', ['error' => $e->getMessage()]);
            return [
                'success' => false,
                'message' => 'Exception occurred while submitting order'
            ];
        }
    }


    public function checkTransactionStatus($orderTrackingId)
{
    try{
    // dd('we get here 2 '); 
    $token = $this->getAuthToken();
    if (!$token) {
        return ['success' => false, 'message' => 'Authentication failed'];
    }


    $response = Http::withHeaders([
        'Accept' => 'application/json',
        'Authorization' => 'Bearer ' . $token,
    ])->get("https://pay.pesapal.com/v3/api/Transactions/GetTransactionStatus", [
        'orderTrackingId' => $orderTrackingId, 
    ]);

    
    if ($response->successful()) {
        return [
            'success' => true,
            'status' => $response->json(), // COMPLETED, PENDING, etc.
            'details' => $response->json()
        ];
    }

    return [
        'success' => false,
        'message' => 'Status check failed',
        'response' => $response->body()
    ];
    }catch(\Exception){
        return response()->json([
            'status'=>0, 
            'message'=>$error->getMessage()
        ],500);
    }
}


}