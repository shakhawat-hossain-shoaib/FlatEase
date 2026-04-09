<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class OtpChallengeNotification extends Notification
{
    use Queueable;

    private string $purpose;
    private string $otp;
    private int $minutesUntilExpiry;

    public function __construct(string $purpose, string $otp, int $minutesUntilExpiry)
    {
        $this->purpose = $purpose;
        $this->otp = $otp;
        $this->minutesUntilExpiry = $minutesUntilExpiry;
    }

    public function via($notifiable)
    {
        return ['mail'];
    }

    public function toMail($notifiable)
    {
        $subject = $this->purpose === 'password_reset'
            ? 'Your FlatEase password reset code'
            : 'Your FlatEase verification code';

        return (new MailMessage())
            ->subject($subject)
            ->line('Use this one-time code to complete your request:')
            ->line($this->otp)
            ->line('This code expires in ' . $this->minutesUntilExpiry . ' minutes.')
            ->line('If you did not request this code, you can ignore this message.');
    }
}
