<!DOCTYPE html>

<html lang="en">

<head>

    <meta charset="UTF-8">

    <meta name="viewport" content="width=device-width, initial-scale=1.0">

    <title>URL Shortener</title>

    <script src="https://cdn.tailwindcss.com"></script>

</head>

<body class="bg-gray-100 min-h-screen flex flex-col">

@include('partials.navbar')

<div class="max-w-2xl mx-auto px-4 py-10 w-full flex-1">

    <h1 class="text-3xl font-bold text-center mb-8">🔗 URL Shortener</h1>

    @if(session('success'))

        <div class="bg-green-100 border border-green-400 text-green-700 p-4 rounded mb-6 text-center">

            <p class="font-semibold mb-1">✅ Your short URL:</p>

            <a href="{{ session('success') }}" target="_blank"

               class="underline font-mono break-all">{{ session('success') }}</a>

        </div>

    @endif

    <form action="{{ route('shorten') }}" method="POST"

          class="bg-white p-6 rounded-lg shadow flex gap-3">

        @csrf

        <input type="text" name="url" placeholder="Paste a long URL here..."

               value="{{ old('url') }}"

               class="flex-1 border border-gray-300 rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500">

        <button class="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700">

            Shorten

        </button>

    </form>

    @error('url')

        <p class="text-red-500 text-sm mt-2">{{ $message }}</p>

    @enderror

    <h2 class="text-xl font-semibold mt-10 mb-4">All Links</h2>

    <div class="space-y-3">

        @forelse($links as $link)

            <div class="bg-white p-4 rounded-lg shadow flex justify-between items-center">

                <div class="min-w-0">

                    <a href="{{ route('redirect', $link->short_code) }}" target="_blank"

                       class="text-blue-600 font-mono font-semibold hover:underline">

                        {{ url('/') }}/{{ $link->short_code }}

                    </a>

                    <p class="text-gray-500 text-sm truncate">{{ $link->original_url }}</p>

                </div>

                <span class="bg-gray-100 text-gray-700 text-sm px-3 py-1 rounded-full whitespace-nowrap ml-4">

                    {{ $link->clicks }} clicks

                </span>

            </div>

        @empty

            <p class="text-center text-gray-500">No links yet. Create your first one! 🚀</p>

        @endforelse

    </div>

</div>

</body>

</html>


