<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class UserProgress extends Model
{
    use HasFactory;

    protected $table = 'user_progress';

    // Specify fillable columns for mass assignment
    protected $fillable = [
        'user_id',
        'course_id',
        'last_module_id',
        'progress_percentage'
    ];

    /**
     * Get the user associated with this progress.
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get the course associated with this progress.
     */
    public function course()
    {
        return $this->belongsTo(Course::class);
    }

    /**
     * Get the module where the user last stopped.
     */
    public function lastModule()
    {
        return $this->belongsTo(Module::class, 'last_module_id');
    }
}
