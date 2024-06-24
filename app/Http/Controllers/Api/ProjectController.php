<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreProjectRequest;
use App\Http\Requests\UpdateProjectRequest;
use App\Http\Resources\ProjectResource;
use App\Models\Project;
use App\Models\Task;
use App\Models\User;

class ProjectController extends Controller
{
    /**
     * Display a listing of the resource.
     *
     * @return \Illuminate\Http\Resources\Json\AnonymousResourceCollection
     */
    public function index()
    {
        $projects = Project::all();
        return ProjectResource::collection($projects);
    }

    /**
     * Store a newly created resource in storage.
     *
     * @param  \App\Http\Requests\StoreProjectRequest  $request
     * @return \Illuminate\Http\Response
     */
    public function store(StoreProjectRequest $request)
    {
        $data = $request->validated();
        $project = Project::create($data);
        return response(new ProjectResource($project), 201);
    }

    /**
     * Display the specified resource.
     *
     * @param  \App\Models\Project  $project
     * @return \Illuminate\Http\Response
     */
    public function show(Project $project)
    {
        return new ProjectResource($project);
    }

    /**
     * Update the specified resource in storage.
     *
     * @param  \App\Http\Requests\UpdateProjectRequest  $request
     * @param  \App\Models\Project  $project
     * @return \Illuminate\Http\Response
     */
    public function update(UpdateProjectRequest $request, Project $project)
    {
        $data = $request->validated();
        $project->update($data);

        // Update project status based on tasks
        $this->updateProjectStatus($project);

        return new ProjectResource($project);
    }

    /**
     * Display the tasks associated with the specified project.
     *
     * @param  \App\Models\Project  $project
     * @return \Illuminate\Http\Resources\Json\AnonymousResourceCollection
     */
    public function tasks(Project $project)
    {
        return $project->tasks;
    }

    /**
     * Remove the specified resource from storage.
     *
     * @param  \App\Models\Project  $project
     * @return \Illuminate\Http\Response
     */
    public function destroy(Project $project)
    {
        $project->delete();

        return response("", 204);
    }

    public function getProjectStats()
    {
        $totalProjects = Project::count();
        $totalTasks = Task::count();
        $totalUsers = User::where('user_type', 'AS400')->count();
        $totalWeb = User::where('user_type', 'WEB')->where('role', 'collaborator')->count();

        return response()->json([
            'totalProjects' => $totalProjects,
            'totalTasks' => $totalTasks,
            'totalUsers' => $totalUsers,
            'totalWeb' => $totalWeb,
        ]);
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
    
}
