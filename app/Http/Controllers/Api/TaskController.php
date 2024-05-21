<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreTaskRequest;
use Illuminate\Http\Request;
use App\Models\Task;
use App\Http\Resources\TaskResource;
use App\Http\Requests\TaskRequest;
use App\Http\Requests\UpdateTaskRequest;
use App\Models\User;
use Illuminate\Support\Facades\DB;

class   TaskController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $tasks = Task::all();
        return TaskResource::collection($tasks);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreTaskRequest $request)
    {
        $task = Task::create($request->validated());
        return new TaskResource($task);
    }
    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        $task = Task::findOrFail($id);
        return new TaskResource($task);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateTaskRequest $request, string $id)
    {
        $task = Task::findOrFail($id);
        $task->update($request->validated());
        return new TaskResource($task);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        $task = Task::findOrFail($id);
        $task->delete();
        return response()->json(['message' => 'Task deleted successfully']);
    }

    public function tasksByProject($projectId)
    {
        $tasks = Task::where('project_id', $projectId)->get();
        return response()->json(['data' => $tasks]);
    }

   public function getUserTasks($userId)
    {
        try {
      
            $taskIds = DB::table('task_user')
                ->where('as400_user_id', $userId)
                ->orWhere('web_user_id', $userId)
                ->pluck('task_id');

            $tasks = DB::table('tasks')
                ->whereIn('id', $taskIds)
                ->get();

            return response()->json(['data' => $tasks], 200);
        } catch (\Exception $e) {
            return response()->json(['error' => 'Failed to fetch user tasks', 'message' => $e->getMessage()], 500);
        }
    
    
}

public function getStatTasks()
{
    try {

        $as400UsersWithTasks = DB::table('users')
            ->join('task_user', 'users.id', '=', 'task_user.as400_user_id')
            ->join('tasks', 'task_user.task_id', '=', 'tasks.id')
            ->select('users.id as user_id', 'users.name as user_name', 'tasks.id as task_id', 'tasks.name as task_name')
            ->get()
            ->groupBy('user_id');

    
        $webUsersWithTasks = DB::table('users')
            ->join('task_user', 'users.id', '=', 'task_user.web_user_id')
            ->join('tasks', 'task_user.task_id', '=', 'tasks.id')
            ->select('users.id as user_id', 'users.name as user_name', 'tasks.id as task_id', 'tasks.name as task_name')
            ->get()
            ->groupBy('user_id');

   
        $formattedAs400Data = [];
        foreach ($as400UsersWithTasks as $userId => $tasks) {
            $userName = $tasks->first()->user_name;
            $taskList = $tasks->map(function($task) {
                return ['id' => $task->task_id, 'name' => $task->task_name];
            })->toArray();

            $formattedAs400Data[] = [
                'id' => $userId,
                'name' => $userName,
                'tasks' => $taskList
            ];
        }

      
        $formattedWebData = [];
        foreach ($webUsersWithTasks as $userId => $tasks) {
            $userName = $tasks->first()->user_name;
            $taskList = $tasks->map(function($task) {
                return ['id' => $task->task_id, 'name' => $task->task_name];
            })->toArray();

            $formattedWebData[] = [
                'id' => $userId,
                'name' => $userName,
                'tasks' => $taskList
            ];
        }

        return response()->json(['as400Users' => $formattedAs400Data, 'webUsers' => $formattedWebData], 200);
    } catch (\Exception $e) {
        return response()->json(['error' => 'Failed to fetch user tasks', 'message' => $e->getMessage()], 500);
    }
}


}