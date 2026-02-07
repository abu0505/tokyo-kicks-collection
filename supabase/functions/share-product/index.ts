// @ts-ignore
// @ts-nocheck
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.0"

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
}

// List of known social media and crawler bots
const CRAWLER_USER_AGENTS = [
    'facebookexternalhit',
    'Facebot',
    'Twitterbot',
    'WhatsApp',
    'LinkedInBot',
    'Pinterest',
    'Slackbot',
    'TelegramBot',
    'Discordbot',
    'Googlebot',
    'bingbot',
    'Applebot',
]

function isCrawler(userAgent: string | null): boolean {
    if (!userAgent) return false
    return CRAWLER_USER_AGENTS.some(bot => userAgent.toLowerCase().includes(bot.toLowerCase()))
}

serve(async (req: Request) => {
    // Handle CORS
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders })
    }

    try {
        const url = new URL(req.url)
        const id = url.searchParams.get('id') // Get ID from query param

        if (!id) {
            throw new Error('Product ID is required')
        }

        // Initialize Supabase
        // @ts-ignore
        const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? ''
        // @ts-ignore
        const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
        const supabase = createClient(supabaseUrl, supabaseKey)

        // Fetch Product
        const { data: product, error } = await supabase
            .from('shoes')
            .select('*')
            .eq('id', id)
            .single()

        if (error || !product) {
            return new Response('Product not found', { status: 404, headers: corsHeaders })
        }

        const redirectUrl = `https://tokyo-shoes.vercel.app/product/${product.id}`
        const userAgent = req.headers.get('user-agent')

        // For regular browsers: Direct 302 redirect (fast, always works)
        if (!isCrawler(userAgent)) {
            return new Response(null, {
                status: 302,
                headers: {
                    ...corsHeaders,
                    'Location': redirectUrl,
                },
            })
        }

        // For crawlers: Return HTML with OG meta tags for link previews
        const title = product.name
        const description = `Check out these ${product.name} at Tokyo Shoes!`
        let imageUrl = product.image_url

        // Optimize Image if Supabase Storage
        if (imageUrl && imageUrl.includes('supabase.co')) {
            // Force JPEG for better compatibility with WhatsApp/iOS
            // Add quality parameter to keep size down
            imageUrl += '?width=1200&height=630&resize=contain&format=jpeg&quality=80'
        }

        // Escape quotes in title for meta tags
        const escapedTitle = title.replace(/"/g, '&quot;')
        const escapedDescription = description.replace(/"/g, '&quot;')

        const html = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta http-equiv="refresh" content="0;url=${redirectUrl}">
    <title>${escapedTitle}</title>
    <meta property="og:title" content="${escapedTitle}">
    <meta property="og:description" content="${escapedDescription}">
    <meta property="og:image" content="${imageUrl}">
    <meta property="og:image:width" content="1200">
    <meta property="og:image:height" content="630">
    <meta property="og:image:type" content="image/jpeg">
    <meta property="og:url" content="${redirectUrl}">
    <meta property="og:type" content="product">
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:title" content="${escapedTitle}">
    <meta name="twitter:description" content="${escapedDescription}">
    <meta name="twitter:image" content="${imageUrl}">
</head>
<body>
    <p>Redirecting to <a href="${redirectUrl}">Tokyo Shoes</a>...</p>
</body>
</html>`

        return new Response(html, {
            status: 200,
            headers: {
                'Content-Type': 'text/html; charset=utf-8',
                'Cache-Control': 'no-cache',
            },
        })

    } catch (error: any) {
        return new Response(error.message, { status: 500, headers: corsHeaders })
    }
})