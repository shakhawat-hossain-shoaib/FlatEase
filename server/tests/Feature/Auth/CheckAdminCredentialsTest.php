<?php

namespace Tests\Feature\Auth;

use App\Http\Middleware\CheckAdminCredentials;
use Illuminate\Http\Request;
use Tests\TestCase;

class CheckAdminCredentialsTest extends TestCase
{
    public function test_admin_middleware_returns_401_for_unauthenticated_requests()
    {
        $request = Request::create('/api/session', 'POST');
        $middleware = new CheckAdminCredentials();

        $response = $middleware->handle($request, function () {
            return response()->json(['success' => true], 200);
        });

        $this->assertSame(401, $response->getStatusCode());
        $this->assertSame([
            'success' => false,
            'message' => 'Unauthenticated.',
        ], $response->getData(true));
    }

    public function test_admin_middleware_returns_403_for_non_admin_users()
    {
        $request = Request::create('/api/session', 'POST');
        $request->setUserResolver(function () {
            return (object) ['id' => 10, 'role' => 'tenant'];
        });

        $middleware = new CheckAdminCredentials();

        $response = $middleware->handle($request, function () {
            return response()->json(['success' => true], 200);
        });

        $this->assertSame(403, $response->getStatusCode());
        $this->assertSame([
            'success' => false,
            'message' => 'Forbidden. Admin access required.',
        ], $response->getData(true));
    }

    public function test_admin_middleware_allows_admin_users()
    {
        $request = Request::create('/api/session', 'POST');
        $request->setUserResolver(function () {
            return (object) ['id' => 1, 'role' => 'admin'];
        });

        $middleware = new CheckAdminCredentials();

        $response = $middleware->handle($request, function () {
            return response()->json(['success' => true], 200);
        });

        $this->assertSame(200, $response->getStatusCode());
        $this->assertSame([
            'success' => true,
        ], $response->getData(true));
    }
}
