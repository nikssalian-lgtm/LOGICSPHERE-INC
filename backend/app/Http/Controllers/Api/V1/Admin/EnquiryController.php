<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use App\Http\Resources\EnquiryResource;
use App\Mail\EnquiryReceived;
use App\Models\Enquiry;
use App\Models\EnquiryEvent;
use App\Models\User;
use App\Services\ActivityLogger;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;

class EnquiryController extends Controller
{
    private const STATUSES = ['new', 'contacted', 'qualified', 'proposal', 'won', 'lost'];

    public function submit(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'name' => ['required', 'string', 'min:2', 'max:120'], 'email' => ['required', 'email', 'max:254'],
            'phone' => ['nullable', 'string', 'max:40', 'regex:/^[+()0-9.\\-\\s]*$/'], 'company' => ['nullable', 'string', 'max:160'],
            'project_type' => ['nullable', 'string', 'max:80'], 'budget' => ['nullable', 'string', 'max:80'],
            'message' => ['required', 'string', 'min:20', 'max:10000'], 'privacy_consent' => ['accepted'], 'website' => ['prohibited'],
        ]);
        if ($validator->fails()) {
            throw new ValidationException($validator);
        }
        $data = $validator->validated();
        $enquiry = Enquiry::create([
            ...collect($data)->except(['privacy_consent', 'website'])->all(),
            'reference' => 'LS-'.Str::upper(Str::random(10)),
            'ip_hash' => hash_hmac('sha256', (string) $request->ip(), (string) config('app.key')),
            'source' => mb_substr((string) $request->headers->get('referer'), 0, 120), 'consented_at' => now(),
        ]);
        DB::table('enquiry_events')->insert(['enquiry_id' => $enquiry->id, 'event' => 'created', 'new_value' => 'new', 'created_at' => now()]);
        $recipient = config('services.enquiries.notification_to');
        if (is_string($recipient) && filter_var($recipient, FILTER_VALIDATE_EMAIL)) {
            Mail::to($recipient)->queue(new EnquiryReceived($enquiry));
        }

        return response()->json(['data' => ['reference' => $enquiry->reference], 'message' => 'Thank you. Your enquiry has been received.'], 201);
    }

    public function index(Request $request): JsonResponse
    {
        $query = Enquiry::with(['assignee'])->withCount('notes');
        if (in_array($request->query('status'), self::STATUSES, true)) {
            $query->where('status', $request->query('status'));
        }
        if ($request->boolean('archived')) {
            $query->onlyTrashed();
        }
        if ($request->filled('assignee_id')) {
            $query->where('assigned_to', $request->integer('assignee_id'));
        }
        if ($request->filled('search')) {
            $term = mb_substr(trim((string) $request->query('search')), 0, 100);
            $query->where(fn ($q) => $q->where('reference', 'like', "%$term%")->orWhere('name', 'like', "%$term%")->orWhere('email', 'like', "%$term%")->orWhere('company', 'like', "%$term%"));
        }
        $items = $query->orderByDesc('created_at')->paginate(min(max($request->integer('per_page', 20), 1), 100));

        return response()->json(['data' => EnquiryResource::collection($items)->resolve(), 'meta' => ['total' => $items->total(), 'current_page' => $items->currentPage(), 'last_page' => $items->lastPage()], 'assignees' => User::where('is_active', true)->orderBy('name')->get(['id', 'name'])]);
    }

    public function show(Enquiry $enquiry): EnquiryResource
    {
        return new EnquiryResource($enquiry->load(['assignee', 'notes.author', 'events.author']));
    }

    public function update(Request $request, Enquiry $enquiry, ActivityLogger $activity): EnquiryResource
    {
        $validator = Validator::make($request->all(), [
            'status' => ['sometimes', Rule::in(self::STATUSES)],
            'assigned_to' => ['sometimes', 'nullable', 'integer', Rule::exists('users', 'id')->where('is_active', true)],
        ]);
        if ($validator->fails()) {
            throw new ValidationException($validator);
        }
        $data = $validator->validated();
        if (array_key_exists('assigned_to', $data) && ! $request->user()->hasPermission('enquiries.assign')) {
            abort(403);
        }
        DB::transaction(function () use ($data, $enquiry, $request): void {
            if (isset($data['status']) && $data['status'] !== $enquiry->status) {
                $old = $enquiry->status;
                $enquiry->status = $data['status'];
                $enquiry->contacted_at = $data['status'] === 'contacted' ? ($enquiry->contacted_at ?? now()) : $enquiry->contacted_at;
                $enquiry->won_at = $data['status'] === 'won' ? now() : null;
                $enquiry->lost_at = $data['status'] === 'lost' ? now() : null;
                EnquiryEvent::create(['enquiry_id' => $enquiry->id, 'user_id' => $request->user()->id, 'event' => 'status_changed', 'previous_value' => $old, 'new_value' => $data['status'], 'created_at' => now()]);
            }
            if (array_key_exists('assigned_to', $data) && $data['assigned_to'] !== $enquiry->assigned_to) {
                EnquiryEvent::create(['enquiry_id' => $enquiry->id, 'user_id' => $request->user()->id, 'event' => 'assignment_changed', 'previous_value' => $enquiry->assigned_to ? (string) $enquiry->assigned_to : null, 'new_value' => $data['assigned_to'] ? (string) $data['assigned_to'] : null, 'created_at' => now()]);
                $enquiry->assigned_to = $data['assigned_to'];
            }
            $enquiry->save();
        });
        $activity->record($request->user()->id, 'updated', 'enquiry', $enquiry->id, array_intersect_key($data, array_flip(['status'])));

        return new EnquiryResource($enquiry->fresh()->load(['assignee', 'notes.author', 'events.author']));
    }

    public function note(Request $request, Enquiry $enquiry, ActivityLogger $activity): JsonResponse
    {
        $data = $request->validate(['note' => ['required', 'string', 'min:2', 'max:5000']]);
        $note = $enquiry->notes()->create(['user_id' => $request->user()->id, 'note' => $data['note']]);
        $activity->record($request->user()->id, 'note_added', 'enquiry', $enquiry->id);

        return response()->json(['data' => ['id' => $note->id, 'note' => $note->note, 'author' => $request->user()->name, 'created_at' => $note->created_at]], 201);
    }

    public function archive(Request $request, Enquiry $enquiry, ActivityLogger $activity): JsonResponse
    {
        $enquiry->delete();
        $activity->record($request->user()->id, 'archived', 'enquiry', $enquiry->id);

        return response()->json(['message' => 'Enquiry archived.']);
    }

    public function restore(Request $request, Enquiry $enquiry, ActivityLogger $activity): JsonResponse
    {
        abort_unless($enquiry->trashed(), 409, 'This enquiry is already active.');
        $enquiry->restore();
        $activity->record($request->user()->id, 'restored', 'enquiry', $enquiry->id);

        return response()->json(['message' => 'Enquiry restored.']);
    }

    public function export(Request $request)
    {
        $query = Enquiry::query()->orderByDesc('created_at');
        if ($request->filled('status') && in_array($request->query('status'), self::STATUSES, true)) {
            $query->where('status', $request->query('status'));
        }
        $filename = 'logicsphere-enquiries-'.now()->format('Y-m-d').'.csv';

        return response()->streamDownload(function () use ($query): void {
            $output = fopen('php://output', 'w');
            fwrite($output, "\xEF\xBB\xBF");
            fputcsv($output, ['Reference', 'Name', 'Email', 'Phone', 'Company', 'Project type', 'Budget', 'Status', 'Message', 'Created at']);
            $query->chunk(500, function ($rows) use ($output): void {
                foreach ($rows as $row) {
                    $values = [$row->reference, $row->name, $row->email, $row->phone, $row->company, $row->project_type, $row->budget, $row->status, $row->message, $row->created_at?->toIso8601String()];
                    fputcsv($output, array_map(fn ($value) => is_string($value) && preg_match('/^[\\s]*[=+\\-@]/u', $value) ? "'".$value : $value, $values));
                }
            });
            fclose($output);
        }, $filename, ['Content-Type' => 'text/csv; charset=UTF-8', 'Cache-Control' => 'no-store, private']);
    }
}
