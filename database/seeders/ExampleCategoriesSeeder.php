<?php

namespace Database\Seeders;

use App\Models\Category;
use App\Models\User;
use Illuminate\Database\Seeder;

class ExampleCategoriesSeeder extends Seeder
{
    public function run(): void
    {
        $user = User::first();

        if (!$user) {
            return;
        }

        $categories = [
            'Alimentação',
            'Transporte',
            'Moradia',
            'Lazer',
            'Saúde',
            'Educação',
            'Assinaturas',
        ];

        foreach ($categories as $name) {
            Category::firstOrCreate([
                'user_id' => $user->id,
                'name' => $name,
            ]);
        }
    }
}
