import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    // Get the authorization header
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      console.error('No authorization header provided')
      return new Response(
        JSON.stringify({ error: 'No authorization header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Create Supabase client with user's token
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!
    
    const supabaseUser = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } }
    })

    // Get the user from the token
    const { data: { user }, error: userError } = await supabaseUser.auth.getUser()
    
    if (userError || !user) {
      console.error('Failed to get user:', userError)
      return new Response(
        JSON.stringify({ error: 'Invalid token' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    console.log('Deleting account for user:', user.id)

    // Create admin client to delete user
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey)

    // Delete user's avatar from storage if exists
    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('avatar_url')
      .eq('id', user.id)
      .single()

    if (profile?.avatar_url) {
      const avatarPath = profile.avatar_url.split('/').slice(-2).join('/')
      await supabaseAdmin.storage.from('avatars').remove([avatarPath])
      console.log('Deleted avatar:', avatarPath)
    }

    // Delete user's data from related tables
    // Stories
    await supabaseAdmin.from('stories').delete().eq('user_id', user.id)
    console.log('Deleted user stories')

    // Diary entries
    await supabaseAdmin.from('diary_entries').delete().eq('user_id', user.id)
    console.log('Deleted user diary entries')

    // Novels
    const { data: novels } = await supabaseAdmin
      .from('novels')
      .select('id')
      .eq('author_id', user.id)
    
    if (novels && novels.length > 0) {
      const novelIds = novels.map(n => n.id)
      await supabaseAdmin.from('chapters').delete().in('novel_id', novelIds)
      await supabaseAdmin.from('novels').delete().eq('author_id', user.id)
      console.log('Deleted user novels and chapters')
    }

    // User roles
    await supabaseAdmin.from('user_roles').delete().eq('user_id', user.id)
    console.log('Deleted user roles')

    // Profile will be deleted by cascade when user is deleted

    // Finally, delete the user from auth
    const { error: deleteError } = await supabaseAdmin.auth.admin.deleteUser(user.id)

    if (deleteError) {
      console.error('Failed to delete user:', deleteError)
      return new Response(
        JSON.stringify({ error: 'Failed to delete account' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    console.log('Successfully deleted user:', user.id)

    return new Response(
      JSON.stringify({ success: true }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Unexpected error:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
