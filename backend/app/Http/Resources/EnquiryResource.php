<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class EnquiryResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id, 'reference' => $this->reference, 'name' => $this->name,
            'email' => $this->email, 'phone' => $this->phone, 'company' => $this->company,
            'project_type' => $this->project_type, 'budget' => $this->budget, 'message' => $this->message,
            'status' => $this->status, 'assignee' => $this->whenLoaded('assignee', fn () => $this->assignee ? ['id' => $this->assignee->id, 'name' => $this->assignee->name] : null),
            'notes' => $this->whenLoaded('notes', fn () => $this->notes->map(fn ($note) => ['id' => $note->id, 'note' => $note->note, 'author' => $note->author?->name, 'created_at' => $note->created_at])),
            'events' => $this->whenLoaded('events', fn () => $this->events->map(fn ($event) => ['event' => $event->event, 'from' => $event->previous_value, 'to' => $event->new_value, 'author' => $event->author?->name, 'created_at' => $event->created_at])),
            'created_at' => $this->created_at, 'updated_at' => $this->updated_at,
        ];
    }
}
