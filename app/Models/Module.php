<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Module extends Model
{
    use HasFactory;
    protected $table = 'modules';

    protected $fillable = [
        'course_id',
        'title',
        'description',
        'order',
        'module_time'
    ];

    /**
     * Get the course that this module belongs to.
     */
    public function course()
    {
        return $this->belongsTo(Course::class);
    }

    /**
     * Get the quizzes associated with this module.
     */
    public function quizzes()
    {
        return $this->hasMany(Quiz::class);
    }
}
