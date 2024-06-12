    <?php

    use App\Http\Controllers\Api\AuthController;
    use App\Http\Controllers\Api\ProjectController;
    use App\Http\Controllers\Api\UserController;
    use App\Http\Controllers\Api\TaskController;
    use App\Http\Controllers\Api\TaskUserController;
    use App\Http\Controllers\Api\QuestionController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Route;

    /*
    |--------------------------------------------------------------------------
    | API Routes
    |--------------------------------------------------------------------------
    |
    | Here is where you can register API routes for your application. These
    | routes are loaded by the RouteServiceProvider within a group which
    | is assigned the "api" middleware group. Enjoy building your API!
    |
    */

    Route::middleware('auth:sanctum')->group(function () {
        Route::post('/logout', [AuthController::class, 'logout']);
        Route::get('/user', function (Request $request) {
            return $request->user();
        });

        Route::apiResource('/users', UserController::class);
        Route::apiResource('/projects', ProjectController::class);
        Route::apiResource('/tasks', TaskController::class);
        Route::get('/projects/{projectId}/tasks', [TaskController::class, 'tasksByProject']);
        Route::post('/tasks/{taskId}/assign', [TaskUserController::class, 'assignTask']);

        // Route::get('/users/as400', [UserController::class, 'as400Users']);
        // Route::get('/users/web', [UserController::class, 'webUsers']);
        // Route::get('/users/{userType}', [UserController::class, 'getUsersByType']);
        
        Route::put('/tasks/{id}/status', [TaskController::class, 'updateStatus']);
        Route::put('/tasks/{id}/as400_status', [TaskController::class, 'updateAS400Status']);

         Route::get('/project-stats', [ProjectController::class, 'getProjectStats']);
         Route::get('/user-tasks', [TaskController::class, 'getStatTasks']);
        
        Route::get('/users/{userId}/tasks', [TaskController::class, 'getUserTasks']);
        Route::put('/tasks/{taskId}/progress', [TaskController::class, 'updateTaskProgress']);

        Route::put('/tasks/{id}/web-status', 'TaskController@updateWebStatus');
        Route::put('/tasks/{id}/as400-status', 'TaskController@updateAS400Status'); 

        Route::get('/users/as400', [UserController::class, 'as400Users']);
Route::get('/users/web', [UserController::class, 'webUsers']);
Route::get('/users/{userType}', [UserController::class, 'getUsersByType']);

Route::get('/community/questions', [QuestionController::class, 'index']); 
Route::get('/questions/project/{projectId}', [QuestionController::class, 'indexByProject']); 
Route::post('/questions', [QuestionController::class, 'store']); 
Route::put('/community/questions/{question}', [QuestionController::class, 'update']);
Route::post('/community/questions/{questionId}/responses', [QuestionController::class, 'addResponse']);
Route::delete('/community/questions/{question}', [QuestionController::class, 'destroy']);
Route::get('/tasks/statuses', [TaskController::class, 'getStatuses']);

Route::get('/community/questions/{question}/responses', [QuestionController::class, 'getResponses']);

    });
    Route::get('/test-email', function () {
        try {
            Mail::raw('This is a test email', function ($message) {
                $message->to('your_email@example.com')
                        ->subject('Test Email');
            });
            return 'Email sent successfully';
        } catch (\Exception $e) {
            return 'Failed to send email: ' . $e->getMessage();
        }
    });

    Route::post('/signup', [AuthController::class, 'signup']);
    Route::post('/login', [AuthController::class, 'login']);