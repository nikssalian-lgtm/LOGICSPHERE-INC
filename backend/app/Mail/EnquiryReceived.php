<?php

namespace App\Mail;

use App\Models\Enquiry;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;

class EnquiryReceived extends Mailable implements ShouldQueue
{
    use Queueable;

    public function __construct(public readonly Enquiry $enquiry) {}

    public function envelope(): Envelope
    {
        return new Envelope(subject: 'New LogicSphere project enquiry · '.$this->enquiry->reference);
    }

    public function content(): Content
    {
        return new Content(view: 'emails.enquiry-received');
    }

    public function attachments(): array
    {
        return [];
    }
}
