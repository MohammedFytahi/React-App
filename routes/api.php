    <?php

    use App\Http\Controllers\Api\AuthController;
    use App\Http\Controllers\Api\ProjectController;
    use App\Http\Controllers\Api\UserController;
    use App\Http\Controllers\Api\TaskController;
    use App\Http\Controllers\Api\TaskUserController;
    use Illuminate\Http\Request;
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

        // Route::get('/users/{userType?}', [UserController::class, 'index']);
        // Route::get('/users/AS400', [UserController::class, 'index']);
        // Route::get('/users/WEB', [UserController::class, 'index']);
        Route::get('/users/as400', [UserController::class, 'as400Users']);
        Route::get('/users/web', [UserController::class, 'webUsers']);
        Route::get('/users/{userType}', [UserController::class, 'getUsersByType']);

        
    


    });

    Route::post('/signup', [AuthController::class, 'signup']);
    Route::post('/login', [AuthController::class, 'login']);