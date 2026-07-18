<?php

return [
    'enabled' => env('PULSE_ENABLED', false),

    'storage' => [
        'driver' => env('PULSE_STORAGE_DRIVER', 'database'),
        'database' => [
            'connection' => env('PULSE_DB_CONNECTION'),
            'chunk' => 1000,
        ],
    ],

    'cache' => [
        'store' => env('PULSE_CACHE_STORE', env('PULSE_STORE', 'redis')),
    ],

    'store' => env('PULSE_STORE', 'redis'),

    'check' => [
        'interval' => 30,
    ],
];