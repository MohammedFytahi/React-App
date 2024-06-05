<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Question extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'project_id',
        'question',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function responses()
    {
        return $this->hasMany(Response::class);
    }
    // Si vous avez une relation avec les réponses des questions, vous pouvez l'ajouter ici
    // public function answers()
    // {
    //     return $this->hasMany(Answer::class);
    // }
}
