<?php
namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

class TaskAssigned extends Mailable
{
    use Queueable, SerializesModels;

    public $task;
    public $user;

    public function __construct($task, $user)
    {
        $this->task = $task;
        $this->user = $user;
    }

    public function build()
    {
        return $this->view('emails.taskAssigned')
                    ->with([
                        'taskName' => $this->task->name,
                        'userName' => $this->user->name,
                    ]);
    }
}
