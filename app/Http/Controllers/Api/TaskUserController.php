<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Mail\TaskAssigned;
use App\Models\Task;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Log;

class TaskUserController extends Controller
{
    public function assignTask(Request $request)
    {
        Log::info('Received request to assign task', ['data' => $request->all()]);

        $request->validate([
            'task_id' => 'required|exists:tasks,id',
            'as400_user_id' => 'required|exists:users,id',
            'web_user_id' => 'required|exists:users,id',
        ]);

        $task = Task::findOrFail($request->task_id);
        $as400User = User::findOrFail($request->as400_user_id);
        $webUser = User::findOrFail($request->web_user_id);

        Log::info('Assigning task', ['task' => $task, 'as400User' => $as400User, 'webUser' => $webUser]);

        $task->users()->syncWithoutDetaching([$as400User->id => ['web_user_id' => $webUser->id]]);

        if ($task) {
            try {
                Mail::to($as400User->email)->send(new TaskAssigned($task, $as400User));
                Log::info('Email sent to', ['email' => $as400User->email]);
            } catch (\Exception $e) {
                Log::error('Failed to send email', ['error' => $e->getMessage()]);
                return response()->json(['message' => 'Task assigned but email failed to send', 'error' => $e->getMessage()], 500);
            }
        }

        return response()->json(['message' => 'Task assigned successfully']);
    }
}
