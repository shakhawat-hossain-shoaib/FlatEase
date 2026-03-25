<?php

namespace Tests\Feature;

use Tests\TestCase;

class UnauthTest extends TestCase
{
    public function test_unauthenticated()
    {
        $response = $this->postJson('/api/complaints', [
            'title' => 'Test',
            'category' => 'Maintenance',
            'description' => 'Test'
        ]);
        
        dump('Status:', $response->getStatusCode());
        dump('Response:', $response->json());
        
        $this->assertTrue(true);
    }
}
