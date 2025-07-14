import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Blog | PHOTON Coaching Varanasi - JEE, NEET Prep",
  description: "Stay updated with the latest articles, study tips, exam strategies, and news from PHOTON Coaching Varanasi for JEE, NEET, and Board exam preparation.",
};

export default function BlogPage() {
  return (
    <div className="min-h-screen bg-blue-50 py-12 md:py-24">
      <section className="container mx-auto px-4 md:px-6 text-center">
        <h1 className="font-headline text-4xl md:text-5xl lg:text-6xl font-black text-blue-600 tracking-tighter mb-4">
          Our Latest Insights & Articles
        </h1>
        <p className="max-w-3xl mx-auto text-lg text-muted-foreground mb-8">
          Explore valuable resources, study tips, exam strategies, and success stories from PHOTON Coaching.
        </p>
        {/* Placeholder for blog post list */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* Example Blog Card (will be replaced by dynamic content later) */}
          <div className="bg-white p-6 rounded-lg shadow-md border border-blue-100">
            <h2 className="font-headline text-xl font-bold mb-2">Coming Soon: First Blog Post Title</h2>
            <p className="text-muted-foreground text-sm">Date: July 14, 2025</p>
            <p className="mt-4 text-left">This is a placeholder for your first blog post. We'll soon be sharing valuable content on JEE, NEET, and academic excellence.</p>
            <a href="#" className="text-blue-600 hover:underline mt-4 inline-block">Read More &rarr;</a>
          </div>
        </div>
      </section>
    </div>
  );
}
