import type { Metadata } from "next";

type Props = {
  params: { slug: string };
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const title = `Blog Post: ${params.slug.replace(/-/g, ' ').replace(/\b\w/g, (char) => char.toUpperCase())} | PHOTON Coaching Varanasi`;
  const description = `Read the full article on ${params.slug.replace(/-/g, ' ').replace(/\b\w/g, (char) => char.toUpperCase())} from PHOTON Coaching.`;

  return {
    title,
    description,
  };
}

export async function generateStaticParams() {
  // For static export, you need to provide a list of all possible slugs
  // In a real application, you would fetch this from your CMS or markdown files
  return [
    { slug: 'first-blog-post' },
    { slug: 'second-blog-post' },
    // Add more slugs as needed
  ];
}

export default function BlogPostPage({ params }: Props) {
  return (
    <div className="min-h-screen bg-blue-50 py-12 md:py-24">
      <section className="container mx-auto px-4 md:px-6 text-center">
        <h1 className="font-headline text-4xl md:text-5xl lg:text-6xl font-black text-blue-600 tracking-tighter mb-4">
          {params.slug.replace(/-/g, ' ').replace(/\b\w/g, (char) => char.toUpperCase())}
        </h1>
        <p className="max-w-3xl mx-auto text-lg text-muted-foreground mb-8">
          This is a placeholder for the content of the blog post with slug: <strong>{params.slug}</strong>
        </p>
        {/* Blog post content will go here */}
      </section>
    </div>
  );
}
