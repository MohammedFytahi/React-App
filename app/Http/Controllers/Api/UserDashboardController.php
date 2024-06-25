<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\DB;

class UserDashboardController extends Controller
{
    public function getUserTasks($userId)
    {
        try {
            $usersWithTasks = DB::table('users')
                ->leftJoin('task_user', 'users.id', '=', 'task_user.as400_user_id')
                ->leftJoin('tasks', 'task_user.task_id', '=', 'tasks.id')
                ->where('users.id', $userId)
                ->select('users.id as user_id', 'users.name as user_name', DB::raw('count(tasks.id) as task_count'))
                ->groupBy('users.id', 'users.name')
                ->get();

            return response()->json($usersWithTasks, 200);
        } catch (\Exception $e) {
            return response()->json(['error' => 'Failed to fetch user tasks', 'message' => $e->getMessage()], 500);
        }
    }
}
