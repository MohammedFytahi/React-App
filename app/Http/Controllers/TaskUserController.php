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
            'user_id' => 'required|exists:users,id',
        ]);

        $task = Task::findOrFail($request->task_id);
        $user = User::findOrFail($request->user_id);

        $task->users()->attach($user);

        return response()->json(['message' => 'Task assigned successfully']);
    }
}

