<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class ActivityController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $logs = DB::table('admin_activity_logs')->leftJoin('users', 'users.id', '=', 'admin_activity_logs.user_id')->select(['admin_activity_logs.id', 'users.name as user', 'admin_activity_logs.action', 'admin_activity_logs.entity_type', 'admin_activity_logs.entity_id', 'admin_activity_logs.context', 'admin_activity_logs.created_at'])->orderByDesc('admin_activity_logs.id')->paginate(min(max($request->integer('per_page', 50), 1), 100));

        return response()->json(['data' => $logs->items(), 'meta' => ['total' => $logs->total(), 'current_page' => $logs->currentPage(), 'last_page' => $logs->lastPage()]]);
    }
}
