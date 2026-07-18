<?php

use Sentry\State\HubInterface;
use Sentry\State\Scope;

return [
    'dsn' => env('SENTRY_DSN'),
    'environment' => env('SENTRY_ENVIRONMENT', env('APP_ENV', 'production')),
    'release' => env('SENTRY_RELEASE'),
    'enabled' => env('SENTRY_ENABLED', false),
    'traces_sample_rate' => env('SENTRY_TRACES_SAMPLE_RATE', 0.1),
    'profiles_sample_rate' => env('SENTRY_PROFILES_SAMPLE_RATE', 0.1),
    'send_default_pii' => env('SENTRY_SEND_DEFAULT_PII', false),
    'server_name' => env('SENTRY_SERVER_NAME', gethostname()),
];