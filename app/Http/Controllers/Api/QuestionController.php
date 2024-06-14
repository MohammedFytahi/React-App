<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Question;
use App\Models\Response;

class QuestionController extends Controller
{
    public function index()
    {
        return Question::with('user')->get();
    }

    public function indexByProject($projectId)
    {
        return Question::where('project_id', $projectId)->with('user')->get();
    }

    public function store(Request $request)
    {
        $request->validate([
            'project_id' => 'required|exists:projects,id',
            'question' => 'required|string',
        ]);

        $question = Question::create([
            'user_id' => auth()->id(),
            'project_id' => $request->project_id,
            'question' => $request->question,
        ]);

        return response()->json($question, 201);
    }

    public function update(Request $request, Question $question)
    {
        if ($question->user_id != auth()->id()) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }
    
        $request->validate([
            'question' => 'required|string',
        ]);
    
        $question->update([
            'question' => $request->question,
        ]);
    
        return response()->json($question, 200);
    }


    public function updateReponse(Request $request, Response $response){
        $request->validate([
            'response' => 'required|string',
        ]);
        $response->update([
            'response'=>$request->response,
        ]);
        return response()->json($response, 200);
    }
    
    public function destroy(Question $question)
    {

        if ($question->user_id != auth()->id()) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $question->delete();

        return response()->json(['message' => 'Question deleted successfully'], 200);
    }

    public function destroyReponse(Response $response){
        if($response->user_id != auth()->id()){
            return response()->json(['error'=> 'Unauthorized'], 403);
        };

        $response->delete();

        return response()->json(['message' => 'Answer deleted successfully']);
    }

    public function addResponse(Request $request, $questionId)
    {
        $request->validate([
            'response' => 'required|string',
        ]);

        $response = Response::create([
            'question_id' => $questionId,
            'user_id' => auth()->id(),
            'response' => $request->input('response'),
        ]);

        return response()->json($response, 201);    
    }   


    public function getResponses(Question $question)
{
    $responses = $question->responses;
    return response()->json($responses);
}

public function show($id)
{
    $question = Question::with('user', 'responses.user')->findOrFail($id);
    return response()->json($question);
}

}
   

