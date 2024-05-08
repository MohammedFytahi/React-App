<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Project extends Model
{
    protected $fillable = ['name', 'description', 'techno', 'start_date', 'end_date', 'user_id'];

   
}
