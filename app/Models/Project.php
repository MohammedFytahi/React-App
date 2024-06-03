<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Project extends Model
{
    use HasFactory;

    protected $fillable = ['name', 'description', 'techno', 'start_date', 'end_date', 'status','as400_status', 'user_id'];

    public function tasks()
    {
        return $this->hasMany(Task::class);
    }
}
