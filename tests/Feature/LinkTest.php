<?php

namespace Tests\Feature;

use App\Models\Link;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class LinkTest extends TestCase
{
    use RefreshDatabase;

    /**
     * Test that the homepage loads successfully.
     */
    public function test_homepage_can_be_rendered(): void
    {
        $response = $this->get('/');

        $response->assertStatus(200);
        $response->assertSee('URL Shortener');
    }

    /**
     * Test that a valid URL can be shortened.
     */
    public function test_can_shorten_a_valid_url(): void
    {
        $response = $this->post('/shorten', [
            'url' => 'https://example.com/some/very/long/url',
        ]);

        $response->assertRedirect(route('home'));
        $response->assertSessionHas('success');

        $this->assertDatabaseHas('links', [
            'original_url' => 'https://example.com/some/very/long/url',
        ]);

        $link = Link::first();
        $this->assertNotNull($link);
        $this->assertEquals(6, strlen($link->short_code));
    }

    /**
     * Test validation failure when providing invalid URL.
     */
    public function test_shorten_requires_valid_url(): void
    {
        $response = $this->post('/shorten', [
            'url' => 'not-a-valid-url',
        ]);

        $response->assertSessionHasErrors('url');
        $this->assertDatabaseCount('links', 0);
    }

    /**
     * Test redirection from short code to original URL and click counter increment.
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
     * Test that the React movie app page can be rendered.
     */
    public function test_react_app_page_can_be_rendered(): void
    {
        $response = $this->get('/react-app');

        $response->assertStatus(200);
        $response->assertSee('Movie Search & Favorites', false);
    }

    /**
     * Test that the homepage contains the shared navigation bar with links to both apps.
     */
    public function test_homepage_has_shared_navigation_bar(): void
    {
        $response = $this->get('/');

        $response->assertStatus(200);
        $response->assertSee('ShortURL Suite');
        $response->assertSee(route('home'));
        $response->assertSee(route('react-app'));
        $response->assertSee('Movie Search');
    }

    /**
     * Test that the React app page contains the shared navigation bar with links to both apps.
     */
    public function test_react_app_has_shared_navigation_bar(): void
    {
        $response = $this->get('/react-app');

        $response->assertStatus(200);
        $response->assertSee('ShortURL Suite');
        $response->assertSee(route('home'));
        $response->assertSee(route('react-app'));
        $response->assertSee('URL Shortener');
    }
}



