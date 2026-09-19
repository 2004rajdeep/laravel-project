<?php

namespace App\Http\Controllers;

use App\Models\Link;

use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

class LinkController extends Controller
{

    // Show homepage: form + list of all links

    public function index()

    {

        $links = Link::latest()->get();

        return view('index', compact('links'));

    }

    // Save new link (web form) — deduplicates: reuses existing short code if URL already exists

    public function store(Request $request)

    {

        $data = $request->validate([

            'url' => 'required|url|max:2048',

        ]);

        $originalUrl = $data['url'];

        // Deduplicate: if URL already exists, reuse its short code
        $existingLink = Link::where('original_url', $originalUrl)->first();

        if ($existingLink) {

            return redirect()->route('home')

                ->with('success', url('/') . '/' . $existingLink->short_code);

        }

        // New URL: generate a unique short code
        $shortCode = $this->generateUniqueShortCode();

        Link::create([
            'original_url' => $originalUrl,
            'short_code'   => $shortCode,
            'clicks'       => 0,
        ]);

        return redirect()->route('home')

            ->with('success', url('/') . '/' . $shortCode);

    }

    // API: Create short URL

    public function apiShorten(Request $request): JsonResponse

    {

        try {

            $data = $request->validate([

                'url' => 'required|url|max:2048',

            ]);

        } catch (ValidationException $e) {

            return response()->json([

                'status' => 'error',

                'message' => $e->validator->errors()->first(),

                'errors' => $e->validator->errors()->toArray(),

            ], 422);

        }

        $originalUrl = $data['url'];

        // Check if URL already exists (optional deduplication)

        $existingLink = Link::where('original_url', $originalUrl)->first();

        if ($existingLink) {

            return response()->json([

                'status' => 'success',

                'data' => [

                    'id' => $existingLink->id,

                    'original_url' => $existingLink->original_url,

                    'short_code' => $existingLink->short_code,

                    'short_url' => url('/') . '/' . $existingLink->short_code,

                    'clicks' => $existingLink->clicks,

                    'created_at' => $existingLink->created_at->toIso8601String(),

                ],

            ], 200);

        }

        // Generate unique short code

        $shortCode = $this->generateUniqueShortCode();

        $link = Link::create([

            'original_url' => $originalUrl,

            'short_code' => $shortCode,

            'clicks' => 0,

        ]);

        return response()->json([

            'status' => 'success',

            'data' => [

                'id' => $link->id,

                'original_url' => $link->original_url,

                'short_code' => $link->short_code,

                'short_url' => url('/') . '/' . $link->short_code,

                'clicks' => $link->clicks,

                'created_at' => $link->created_at->toIso8601String(),

            ],

        ], 201);

    }

    private function generateUniqueShortCode(): string

    {

        $maxAttempts = 10;

        for ($i = 0; $i < $maxAttempts; $i++) {

            $code = Str::random(6);

            if (!Link::where('short_code', $code)->exists()) {

                return $code;

            }

        }

        // Fallback: use timestamp-based code if all attempts fail

        return substr(Str::random(8) . time(), 0, 6);

    }

    // Redirect short URL → original URL + count click

    public function redirect($code)

    {

        $link = Link::where('short_code', $code)->firstOrFail();

        $link->increment('clicks');

        return redirect()->away($link->original_url);

    }

}