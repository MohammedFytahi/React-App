<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreTaskRequest;
use Illuminate\Http\Request;
use App\Models\Task;
use App\Models\Project;
use App\Http\Resources\TaskResource;
use App\Http\Requests\UpdateTaskRequest;
use App\Models\User;
use Illuminate\Support\Facades\DB;

class TaskController extends Controller
{
    public function index()
    {
        $tasks = Task::all();
        return TaskResource::collection($tasks);
    }

    public function store(StoreTaskRequest $request)
    {
        $task = Task::create($request->validated());

        $this->updateProjectStatus($task->project);

        return new TaskResource($task);
    }

    public function show(string $id)
    {
        $task = Task::findOrFail($id);
        return new TaskResource($task);
    }

    public function update(UpdateTaskRequest $request, string $id)
    {
        $task = Task::findOrFail($id);
        $task->update($request->validated());

        $this->updateProjectStatus($task->project);

        return new TaskResource($task);
    }

    public function destroy(string $id)
    {
        $task = Task::findOrFail($id);
        $project = $task->project;
        $task->delete();

        
        $this->updateProjectStatus($project);

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
    
            $tasks = Task::whereIn('id', $taskIds)->get();
            $tasks->load('users');
    
            return TaskResource::collection($tasks);
        } catch (\Exception $e) {
            return response()->json(['error' => 'Failed to fetch user tasks', 'message' => $e->getMessage()], 500);
        }
    }

    public function updateTaskProgress(Request $request, $taskId)
    {
        try {
            $task = Task::findOrFail($taskId);
            $progress = $task->progress ? json_decode($task->progress, true) : [];
            $progress[$request->weekIndex] = $request->value;
    
            $task->progress = json_encode($progress);
            $task->save();
    
            return response()->json(['message' => 'Progress updated successfully', 'progress' => $progress]);
        } catch (\Exception $e) {
            return response()->json(['error' => 'Failed to update progress', 'message' => $e->getMessage()], 500);
        }
    }

    public function getStatTasks()
    {
        try {
            $as400UsersWithTasks = DB::table('users')
                ->join('task_user', 'users.id', '=', 'task_user.as400_user_id')
                ->join('tasks', 'task_user.task_id', '=', 'tasks.id')
                ->select('users.id as user_id', 'users.name as user_name', 'tasks.id as task_id', 'tasks.name as task_name', 'tasks.as400_status as task_status')
                ->get()
                ->groupBy('user_id');
    
            $webUsersWithTasks = DB::table('users')
                ->join('task_user', 'users.id', '=', 'task_user.web_user_id')
                ->join('tasks', 'task_user.task_id', '=', 'tasks.id')
                ->select('users.id as user_id', 'users.name as user_name', 'tasks.id as task_id', 'tasks.name as task_name', 'tasks.status as task_status')
                ->get()
                ->groupBy('user_id');
    
            $formattedAs400Data = [];
            foreach ($as400UsersWithTasks as $userId => $tasks) {
                $userName = $tasks->first()->user_name;
                $taskList = $tasks->map(function ($task) {
                    return ['id' => $task->task_id, 'name' => $task->task_name, 'status' => $task->task_status];
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
                $taskList = $tasks->map(function ($task) {
                    return ['id' => $task->task_id, 'name' => $task->task_name, 'status' => $task->task_status];
                })->toArray();
    
                $formattedWebData[] = [
                    'id' => $userId,
                    'name' => $userName,
                    'tasks' => $taskList
                ];
            }
    
            return response()->json(['as400Users' => $formattedAs400Data, 'webUsers' => $formattedWebData], 200);
        } catch (\Exception $e) {
            return response()->json(['error' => 'Failed to fetch user tasks', 'message'  => $e->getMessage()], 500);
        }
    }
    

    public function updateStatus(Request $request, $id)
    {
        $request->validate([
            'status' => 'required|in:pending,in_progress,completed',
        ]);

        $task = Task::findOrFail($id);
        $task->status = $request->status;
        $task->save();

        $this->updateProjectStatus($task->project);

        return response()->json(['message' => 'Status updated successfully']);
    }

    private function updateProjectStatus(Project $project)
    {
        $allTasksCompleted = $project->tasks->every(function ($task) {
            return $task->status === 'completed';
        });

        if ($allTasksCompleted) {
            $project->update(['status' => 'completed']);
        } else {
            $hasInProgress = $project->tasks->contains(function ($task) {
                return $task->status === 'in_progress';
            });

            $project->update(['status' => $hasInProgress ? 'in_progress' : 'pending']);
        }
    }


    public function updateAS400Status(Request $request, $id){
     $request->validate([
        'as400_status' => 'required|in:pending,in_progress,completed',
     ]);
     $task = Task::findOrFail($id);
     $task->as400_status = $request->as400_status;
     $task->save();

     $this->updateProjectAS400Status($task->project);

     return response()->json(['message' => 'status updated successfully']);
    }

    public function updateProjectAS400Status(Project $project){
        $allTasksCompleted = $project->tasks->every(function ($task) {
            return $task->as400_status === 'completed';
        });

        if ($allTasksCompleted) {
            $project->update(['as400_status' => 'completed']);
        } else {
            $hasInProgress = $project->tasks->contains(function ($task) {
                return $task->as400_status === 'in_progress';
            });

            $project->update(['as400_status' => $hasInProgress ? 'in_progress' : 'pending']);
        }
    }


    public function getStatuses()
    {
        $statuses = DB::table('tasks')
            ->select('status')
            ->distinct()
            ->pluck('status');
        
        return response()->json($statuses);
    }


    public function getCollaboratorStats()
    {
        try {
      
            $collaborators = User::where('role', 'collaborator')->get();
    
           
            $collaboratorStats = $collaborators->map(function ($collaborator) {
                $taskCount = DB::table('task_user')
                    ->where(function ($query) use ($collaborator) {
                        $query->where('web_user_id', $collaborator->id)
                              ->orWhere('as400_user_id', $collaborator->id);
                    })
                    ->count();
    

                $projectCount = Project::whereHas('tasks', function ($query) use ($collaborator) {
                    $query->where('user_id', $collaborator->id);
                })->count();
    
                return [
                    'id' => $collaborator->id,
                    'name' => $collaborator->name,
                    'taskCount' => $taskCount,
                    'projectCount' => $projectCount,
                ];
            });
    

            return response()->json($collaboratorStats);
        } catch (\Exception $e) {
            return response()->json(['error' => 'Failed to fetch collaborator stats', 'message' => $e->getMessage()], 500);
        }
    }
    


    
}