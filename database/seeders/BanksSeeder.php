<?php

namespace Database\Seeders;

use App\Models\Bank;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class BanksSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $banks = [
            "Nubank",
            "Inter",
            "C6 Bank",
            "Banco do Brasil",
            "Bradesco",
            "Itaú",
            "Santander",
            "PayPal",
            "PicPay",
            "Mercado Pago",
        ];

        foreach ($banks as $bankName) {
            Bank::create(['name' => $bankName]);
        }
    }
}
