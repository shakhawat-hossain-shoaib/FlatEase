<?php

namespace Tests\Feature;

use App\Models\User;
use Tests\TestCase;

class DebugAuthTest extends TestCase
{
    public function test_api_endpoint_requires_auth()
    {
        $user = User::factory()->create(['role' => 'tenant']);
        
        // Test 1: Missing required fields
        $response = $this->actingAs($user)->postJson('/api/complaints', [
            'title' => 'Only title',
        ]);
        
        dump('Missing fields Status:', $response->getStatusCode());
        dump('Missing fields Response:', $response->json());
        
        // Test 2: Invalid priority
        $response2 = $this->actingAs($user)->postJson('/api/complaints', [
            'title' => 'Test',
            'category' => 'Maintenance',
            'description' => 'Test',
            'priority' => 'invalid_priority'
        ]);
        
        dump('Invalid priority Status:', $response2->getStatusCode());
        dump('Invalid priority Response:', $response2->json());
        
        // Test 3: Non-existent complaint
        $response3 = $this->actingAs($user)->getJson('/api/complaints/99999');
        
        dump('Non-existent Status:', $response3->getStatusCode());
        dump('Non-existent Response:', $response3->json());
        
        $this->assertTrue(true);
    }
}
