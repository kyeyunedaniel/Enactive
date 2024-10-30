<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use App\Models\Category;

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
    /**
     * Get the user that owns the Course
     *
     * @return \Illuminate\Database\Eloquent\Relations\BelongsTo
     */
    public function category(): BelongsTo
    {
        return $this->belongsTo(Category::class, 'category_id', 'id');
    }
}
