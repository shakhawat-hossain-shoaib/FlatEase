<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Stateful Domains
    |--------------------------------------------------------------------------
    |
    | Requests from the following domains / hosts will receive stateful API
    | authentication cookies. Typically, these should include your local
    | and production domains which access your API via a frontend SPA.
    |
    */

    'stateful' => explode(',', env('SANCTUM_STATEFUL_DOMAINS', (function () {
        $defaults = [
            'localhost',
            'localhost:3000',
            '127.0.0.1',
            '127.0.0.1:8000',
            '::1',
        ];

        $appUrl = env('APP_URL');
        if ($appUrl) {
            $appHost = parse_url($appUrl, PHP_URL_HOST);
            if (is_string($appHost) && $appHost !== '') {
                $defaults[] = $appHost;
            }
        }

        $frontendUrl = env('FRONTEND_URL');
        if ($frontendUrl) {
            $frontendHost = parse_url($frontendUrl, PHP_URL_HOST);
            $frontendPort = parse_url($frontendUrl, PHP_URL_PORT);

            if (is_string($frontendHost) && $frontendHost !== '') {
                $defaults[] = $frontendHost;

                if (is_int($frontendPort)) {
                    $defaults[] = $frontendHost.':'.$frontendPort;
                }
            }
        }

        return implode(',', array_values(array_unique($defaults)));
    })())),

    /*
    |--------------------------------------------------------------------------
    | Expiration Minutes
    |--------------------------------------------------------------------------
    |
    | This value controls the number of minutes until an issued token will be
    | considered expired. If this value is null, personal access tokens do
    | not expire. This won't tweak the lifetime of first-party sessions.
    |
    */

    'expiration' => null,

    /*
    |--------------------------------------------------------------------------
    | Sanctum Middleware
    |--------------------------------------------------------------------------
    |
    | When authenticating your first-party SPA with Sanctum you may need to
    | customize some of the middleware Sanctum uses while processing the
    | request. You may change the middleware listed below as required.
    |
    */

    'middleware' => [
        'verify_csrf_token' => App\Http\Middleware\VerifyCsrfToken::class,
        'encrypt_cookies' => App\Http\Middleware\EncryptCookies::class,
    ],

];
