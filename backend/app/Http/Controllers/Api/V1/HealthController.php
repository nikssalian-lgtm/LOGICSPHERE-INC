<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;
use Throwable;

class HealthController extends Controller
{
    public function __invoke(): JsonResponse
    {
        try {
            DB::select('SELECT 1');

            return response()->json(['data' => ['status' => 'ok']]);
        } catch (Throwable $exception) {
            report($exception);

            return response()->json(['message' => 'The platform is temporarily unavailable.'], 503);
        }
    }
}
