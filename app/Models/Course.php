<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use App\Models\Category;
use App\Models\Module;

class Course extends Model
{
    use HasFactory;

    protected $fillable = ['title', 'description', 'created_by','introduction', 'objectives', 'duration', 'expected_outcomes'];

    // Relationships
    public function quizzes()
    {
        return $this->hasMany(Quiz::class);
    }

    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by');
    }
    /**
     * Get the user that owns the Course
     *
     * @return \Illuminate\Database\Eloquent\Relations\BelongsTo
     */
    public function category(): BelongsTo
    {
        return $this->belongsTo(Category::class, 'category_id', 'id');
    }

    /**
     * Get the user that owns the Course
     *
     * @return \Illuminate\Database\Eloquent\Relations\BelongsTo
     */
    public function modules()
    {
        return $this->hasMany(Module::class);
    }
    
    public function userProgress()
    {
        return $this->hasMany(UserProgress::class);
    }

   
}
