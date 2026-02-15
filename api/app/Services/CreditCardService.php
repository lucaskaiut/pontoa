<?php 

namespace App\Services;

use App\Models\Card;
use App\Services\Payments\PaymentService;
use Illuminate\Database\Eloquent\Model;

final class CreditCardService 
{
    public function create(array $data, Model $owner): Card
    {
        $creditCard = (new PaymentService())->createCreditCard($data, $owner);
        
        $cardData = $creditCard->toArray();
        
        if (isset($data['number'])) {
            $cardNumber = preg_replace('/\D/', '', $data['number']);
            if (strlen($cardNumber) >= 10) {
                $cardData['first_six_digits'] = substr($cardNumber, 0, 6);
                $cardData['last_four_digits'] = substr($cardNumber, -4);
            }
        }

        return $owner->cards()->create($cardData);
    }
}