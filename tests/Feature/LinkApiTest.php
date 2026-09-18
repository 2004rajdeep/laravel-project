<?php

namespace Tests\Feature;

use App\Models\Link;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class LinkApiTest extends TestCase
{
    use RefreshDatabase;

    /**
     * Test successful short URL creation via API.
     */
    public function test_api_can_create_short_url(): void
    {
        $url = 'https://example.com/very-long-url-to-shorten';

        $response = $this->postJson('/api/shorten', [
            'url' => $url,
        ]);

        $response->assertStatus(201)
            ->assertJsonStructure([
                'status',
                'data' => [
                    'id',
                    'original_url',
                    'short_code',
                    'short_url',
                    'clicks',
                    'created_at',
                ],
            ]);

        $this->assertEquals('success', $response->json('status'));
        $this->assertEquals($url, $response->json('data.original_url'));
        $this->assertEquals(6, strlen($response->json('data.short_code')));
        $this->assertEquals(0, $response->json('data.clicks'));
        $this->assertStringContainsString($response->json('data.short_code'), $response->json('data.short_url'));

        $this->assertDatabaseHas('links', [
            'original_url' => $url,
            'short_code' => $response->json('data.short_code'),
            'clicks' => 0,
        ]);
    }

    /**
     * Test validation failure when URL is missing.
     */
    public function test_api_returns_422_when_url_is_missing(): void
    {
        $response = $this->postJson('/api/shorten', []);

        $response->assertStatus(422)
            ->assertJsonStructure([
                'status',
                'message',
                'errors' => [
                    'url',
                ],
            ]);

        $this->assertEquals('error', $response->json('status'));
        $this->assertStringContainsString('url', $response->json('message'));

        $this->assertDatabaseCount('links', 0);
    }

    /**
     * Test validation failure when URL format is invalid.
     */
    public function test_api_returns_422_when_url_format_is_invalid(): void
    {
        $response = $this->postJson('/api/shorten', [
            'url' => 'not-a-valid-http-url',
        ]);

        $response->assertStatus(422)
            ->assertJsonStructure([
                'status',
                'message',
                'errors' => [
                    'url',
                ],
            ]);

        $this->assertEquals('error', $response->json('status'));
        $this->assertDatabaseCount('links', 0);
    }

    /**
     * Test validation failure when URL exceeds max length.
     */
    public function test_api_returns_422_when_url_exceeds_max_length(): void
    {
        $longUrl = 'https://example.com/' . str_repeat('a', 2050);

        $response = $this->postJson('/api/shorten', [
            'url' => $longUrl,
        ]);

        $response->assertStatus(422)
            ->assertJsonStructure([
                'status',
                'message',
                'errors' => [
                    'url',
                ],
            ]);

        $this->assertEquals('error', $response->json('status'));
        $this->assertDatabaseCount('links', 0);
    }

    /**
     * Test redirection and click increment via web route.
     */
    public function test_short_url_redirects_and_increments_clicks(): void
    {
        $link = Link::create([
            'original_url' => 'https://laravel.com',
            'short_code'   => 'lrv123',
            'clicks'       => 0,
        ]);

        $response = $this->get('/lrv123');

        $response->assertRedirect('https://laravel.com');
        $this->assertEquals(1, $link->fresh()->clicks);
    }

    /**
     * Test API returns existing link when URL already exists (deduplication).
     */
    public function test_api_returns_existing_link_when_url_already_exists(): void
    {
        $url = 'https://example.com/duplicate-url';
        $existingLink = Link::create([
            'original_url' => $url,
            'short_code'   => 'exist1',
            'clicks'       => 5,
        ]);

        $response = $this->postJson('/api/shorten', [
            'url' => $url,
        ]);

        $response->assertStatus(200)
            ->assertJsonStructure([
                'status',
                'data' => [
                    'id',
                    'original_url',
                    'short_code',
                    'short_url',
                    'clicks',
                    'created_at',
                ],
            ]);

        $this->assertEquals('success', $response->json('status'));
        $this->assertEquals($existingLink->id, $response->json('data.id'));
        $this->assertEquals($existingLink->short_code, $response->json('data.short_code'));
        $this->assertEquals(5, $response->json('data.clicks'));
    }

    /**
     * Test API generates unique short codes.
     */
    public function test_api_generates_unique_short_codes(): void
    {
        $urls = [
            'https://example.com/url-1',
            'https://example.com/url-2',
            'https://example.com/url-3',
        ];

        $codes = [];

        foreach ($urls as $url) {
            $response = $this->postJson('/api/shorten', ['url' => $url]);
            $response->assertStatus(201);
            $codes[] = $response->json('data.short_code');
        }

        $this->assertCount(3, array_unique($codes));
        $this->assertDatabaseCount('links', 3);
    }

    /**
     * Test API rate limiting is applied.
     */
    public function test_api_rate_limiting_is_applied(): void
    {
        $url = 'https://example.com/rate-limit-test';

        // Make 61 requests (limit is 60 per minute)
        for ($i = 0; $i < 61; $i++) {
            $response = $this->postJson('/api/shorten', ['url' => $url . '?v=' . $i]);
            if ($i < 60) {
                $this->assertEquals(201, $response->status(), "Request $i should succeed");
            } else {
                $this->assertEquals(429, $response->status(), "Request $i should be rate limited");
            }
        }
    }
}