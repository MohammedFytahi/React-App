<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Task extends Model
{
    use HasFactory;

    protected $fillable = ['name', 'description', 'start_date', 'end_date', 'project_id','user_id'];

    public function project()
    {
        return $this->belongsTo(Project::class);
    }

    public function users()
{
    return $this->belongsToMany(User::class);
}

}
