<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Course extends Model
{
    use HasFactory;

    protected $fillable = ['title', 'description', 'created_by'];

    // Relationships
    public function quizzes()
    {
        return $this->hasMany(Quiz::class);
    }

    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by');
    }
}
