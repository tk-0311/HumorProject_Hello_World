import { createClient } from '@/utils/supabase/server'
import { cookies } from 'next/headers'
import PostCard from './components/PostCard'
import { ReactElement } from 'react';
import NavBar from "./components/NavBar";

export default async function Page() {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)

  const cards: ReactElement[] = await supabase.from('posts').select(`
    *,
    profiles (
      username,
      profile_image
    )
  `).then(({data: posts, error}) => {
    if (error) {
      console.error('Supabase error:', error)
      throw new Error(`Error fetching posts: ${error.message}`)
    }
    return (posts ?? []).map((post) => (
      <PostCard
        key={post.id}
        name={post.profiles?.username ?? "Anonymous"}
        profileImage={post.profiles?.profile_image ?? undefined}
        content={post.content}
        imageSrc={post.image_src}
        imageAlt={post.image_alt}
        initialLikes={post.likes}
      />
    ))
  });
  return (
    <>
    <NavBar />
    <div className="flex flex-col gap-4"> 
    {cards}
    </div>
    </>
  )
}