<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class CompanyRecurrencyResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return array|\Illuminate\Contracts\Support\Arrayable|\JsonSerializable
     */
    public function toArray($request)
    {
        $planLabels = [
            'monthly' => 'Mensal',
            'quarterly' => 'Trimestral',
            'yearly' => 'Anual',
        ];

        $paymentMethodLabels = [
            'pagarmeCreditCard' => 'Cartão de Crédito',
            'pagarmePix' => 'PIX',
            'mercadopagoCreditCard' => 'Cartão de Crédito',
        ];

        return [
            'id' => $this->id,
            'company_id' => $this->company_id,
            'amount' => (float) $this->amount,
            'plan' => $this->plan,
            'plan_label' => $planLabels[$this->plan] ?? $this->plan,
            'payment_method' => $this->payment_method,
            'payment_method_label' => $paymentMethodLabels[$this->payment_method] ?? $this->payment_method,
            'billed_at' => $this->billed_at,
            'external_id' => $this->external_id,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}
