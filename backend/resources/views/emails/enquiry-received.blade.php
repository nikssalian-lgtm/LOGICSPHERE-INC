<h1>New project enquiry</h1>
<p><strong>Reference:</strong> {{ $enquiry->reference }}</p>
<p><strong>From:</strong> {{ $enquiry->name }} ({{ $enquiry->email }})</p>
@if($enquiry->company)<p><strong>Company:</strong> {{ $enquiry->company }}</p>@endif
@if($enquiry->phone)<p><strong>Phone:</strong> {{ $enquiry->phone }}</p>@endif
<p><strong>Project:</strong> {{ $enquiry->project_type }}</p>
<p>{{ $enquiry->message }}</p>
