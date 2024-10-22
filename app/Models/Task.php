<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Task extends Model
{
    use HasFactory;

    protected $fillable = ['name', 'description', 'start_date', 'end_date', 'project_id', 'user_id', 'progress', 'status', 'as400_status'];

    public function project()
    {   
        return $this->belongsTo(Project::class);
    }

    public function users()
    {
        return $this->belongsToMany(User::class, 'task_user', 'task_id', 'as400_user_id')
                    ->withPivot('web_user_id');
    }

    protected $casts = [
        'progress' => 'array',
    ];

    
public function user()
{
    return $this->belongsTo(User::class);
}



}
