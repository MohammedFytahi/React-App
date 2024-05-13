<?php

namespace App\Http\Controllers;

use App\Models\Task;
use App\Models\User;
use Illuminate\Http\Request;

class TaskUserController extends Controller
{
    public function assignTask(Request $request)
    {
        $request->validate([
            'task_id' => 'required|exists:tasks,id',
            'as400_user_id' => 'required|exists:users,id',
            'web_user_id' => 'required|exists:users,id',
        ]);

        $task = Task::findOrFail($request->task_id);
        $as400User = User::findOrFail($request->as400_user_id);
        $webUser = User::findOrFail($request->web_user_id);

        $task->users()->attach([$as400User->id, $webUser->id], ['as400_user_id' => $as400User->id, 'web_user_id' => $webUser->id]);

        return response()->json(['message' => 'Task assigned successfully']);
    }
}
