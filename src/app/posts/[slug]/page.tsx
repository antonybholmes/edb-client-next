// app/posts/[slug]/page.js
import { getAllPosts, getPostBySlug } from '@/lib/markdown/posts'

export function generateStaticParams() {
  return getAllPosts().map((post) => ({
    slug: post.slug,
  }))
}

export default async function Page({ params }: PageProps<'/posts/[slug]'>) {
  const { slug } = await params

  const post = await getPostBySlug(slug)

  return (
    <article>
      <h1>{post.frontmatter.title}</h1>
      <div dangerouslySetInnerHTML={{ __html: post.content }} />
    </article>
  )
}
