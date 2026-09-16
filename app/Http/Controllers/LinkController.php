<?php

namespace App\Http\Controllers;

use App\Models\Link;

use Illuminate\Http\Request;

use Illuminate\Support\Str;

class LinkController extends Controller

{

    // Show homepage: form + list of all links

    public function index()

    {

        $links = Link::latest()->get();

        return view('index', compact('links'));

    }

    // Save new link

    public function store(Request $request)

    {

        $data = $request->validate([

            'url' => 'required|url|max:2048',

        ]);

        $data['original_url'] = $data['url'];

        $data['short_code']   = Str::random(6);

        Link::create($data);

        return redirect()->route('home')

            ->with('success', url('/') . '/' . $data['short_code']);

    }

    // Redirect short URL → original URL + count click

    public function redirect($code)

    {

        $link = Link::where('short_code', $code)->firstOrFail();

        $link->increment('clicks');

        return redirect()->away($link->original_url);

    }

}