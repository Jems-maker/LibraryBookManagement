<?php

namespace App\Http\Middleware;

use Illuminate\Routing\Middleware\ThrottleRequests;

class ThrottleApi extends ThrottleRequests
{
    /**
     * The maximum number of requests allowed per minute.
     *
     * @var int
     */
    protected $maxAttempts = 60;

    /**
     * The number of minutes before throttling resets.
     *
     * @var int
     */
    protected $decayMinutes = 1;
}