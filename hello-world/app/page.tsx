import { createClient } from '@/utils/supabase/server'
import { cookies } from 'next/headers'
import Home from './index'
import PostCard from './component/PostCard'
import { ReactElement } from 'react';

type user = {
  id: number;
  name: string;
  email_prefix: string;
  email_domain: string;
};

export default async function Page() {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)

  const cards: ReactElement[] = await supabase.from('posts').select(`
    *,
    users (
      user_name:name
    )
  `).then(({data: posts, error}) => {
    if (error) {
      console.error('Supabase error:', error)
      throw new Error(`Error fetching posts: ${error.message}`)
    }
    console.log('Fetched posts:', posts)
    return (posts ?? []).map((post) => (
      <PostCard
        key={post.id}
        name={post.users.user_name ?? "Unknown user"}
        profileImage={post.profile_image}
        content={post.content}
        imageSrc={post.image_src}
        imageAlt={post.image_alt}
        initialLikes={post.likes}
      />
    ))
  });
  return (
    <>
    <Home/>
    <div className="flex flex-col gap-4"> 
    {cards}
    </div>
    </>
  )
}