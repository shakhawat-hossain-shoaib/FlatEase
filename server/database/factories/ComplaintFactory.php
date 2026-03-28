<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

class ComplaintFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array
     */
    public function definition()
    {
        return [
            'tenant_id' => \App\Models\User::factory()->create(['role' => 'tenant'])->id,
            'assigned_technician_id' => null,
            'title' => $this->faker->sentence(4),
            'category' => $this->faker->randomElement(['Maintenance', 'Cleaning', 'Repairs', 'Other']),
            'description' => $this->faker->paragraph(),
            'priority' => $this->faker->randomElement(['low', 'medium', 'high']),
            'status' => 'pending',
            'resolved_at' => null,
        ];
    }
}
