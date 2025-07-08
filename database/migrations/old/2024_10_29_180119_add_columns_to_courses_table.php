<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('courses', function (Blueprint $table) {
            //
            $table->text('image_url')->nullable()->after('description');
            $table->text('video_url')->nullable()->after('image_url'); 
            $table->integer('course_price')->unsigned()->nullable()->after('video_url'); 
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('courses', function (Blueprint $table) {
            //
            $table->dropColumn('image_url', 'video_url','course_price' );
        });
    }
};
