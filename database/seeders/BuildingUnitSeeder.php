<?php

namespace Database\Seeders;

use App\Models\Building;
use App\Models\Floor;
use App\Models\Unit;
use Illuminate\Database\Seeder;

class BuildingUnitSeeder extends Seeder
{
    /**
     * Seed a starter building with floor/unit layout.
     */
    public function run(): void
    {
        $building = Building::updateOrCreate(
            ['name' => 'Mayder Doa Vila'],
            [
                'code' => 'MDV',
                'address_line' => 'Road 10, Block C',
                'city' => 'Dhaka',
                'state' => 'Dhaka',
                'postal_code' => '1207',
                'country' => 'Bangladesh',
                'total_floors' => 3,
                'is_active' => true,
            ]
        );

        $floors = [
            0 => 'Ground Floor',
            1 => '1st Floor',
            2 => '2nd Floor',
            3 => '3rd Floor',
        ];

        foreach ($floors as $number => $label) {
            $floor = Floor::updateOrCreate(
                [
                    'building_id' => $building->id,
                    'floor_number' => $number,
                ],
                [
                    'floor_label' => $label,
                    'sort_order' => $number,
                ]
            );

            foreach (['A', 'B', 'C', 'D'] as $prefix) {
                $unitNumber = sprintf('%s-%d%02d', $prefix, max($number, 1), count(['A', 'B', 'C', 'D']) === 4 ? array_search($prefix, ['A', 'B', 'C', 'D'], true) + 1 : 1);

                Unit::updateOrCreate(
                    [
                        'building_id' => $building->id,
                        'unit_number' => $unitNumber,
                    ],
                    [
                        'floor_id' => $floor->id,
                        'bedrooms' => 2,
                        'bathrooms' => 2,
                        'area_sqft' => 1100,
                        'occupancy_status' => 'vacant',
                    ]
                );
            }
        }
    }
}
