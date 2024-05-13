<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class AddAs400AndWebUsersToTaskUserTable extends Migration
{
    public function up()
    {
        Schema::table('task_user', function (Blueprint $table) {
            $table->unsignedBigInteger('as400_user_id')->nullable();
            $table->unsignedBigInteger('web_user_id')->nullable();

            $table->foreign('as400_user_id')->references('id')->on('users')->onDelete('cascade');
            $table->foreign('web_user_id')->references('id')->on('users')->onDelete('cascade');
        });
    }

    public function down()
    {
        Schema::table('task_user', function (Blueprint $table) {
            $table->dropForeign(['as400_user_id']);
            $table->dropForeign(['web_user_id']);

            $table->dropColumn('as400_user_id');
            $table->dropColumn('web_user_id');
        });
    }
}
