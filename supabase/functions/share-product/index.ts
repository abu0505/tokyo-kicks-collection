// @ts-ignore
// @ts-nocheck
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.0"

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
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

        // Prepare Metadata
        const title = product.name
        const description = `Check out these ${product.name} at Tokyo Shoes!`
        let imageUrl = product.image_url

        // Optimize Image if Supabase Storage
        if (imageUrl && imageUrl.includes('supabase.co')) {
            imageUrl += '?width=1200&height=630&resize=contain&format=webp'
        }

        const redirectUrl = `https://tokyo-shoes-tau.vercel.app/product/${product.id}`

        // Construct HTML
        const html = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <title>${title}</title>
        <meta property="og:title" content="${title}">
        <meta property="og:description" content="${description}">
        <meta property="og:image" content="${imageUrl}">
        <meta name="twitter:card" content="summary_large_image">
      </head>
      <body>
        <p>Redirecting to <a href="${redirectUrl}">Tokyo Shoes</a>...</p>
        <script>window.location.href = "${redirectUrl}";</script>
      </body>
      </html>
    `

        return new Response(html, {
            headers: {
                ...corsHeaders,
                'Content-Type': 'text/html; charset=utf-8',
            },
        })

    } catch (error: any) {
        return new Response(error.message, { status: 500, headers: corsHeaders })
    }
})