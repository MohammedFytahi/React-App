<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Question;

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
}
