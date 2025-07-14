import type { Metadata } from "next";

const organizationSchema = {
  "@context": "https://schema.org",
  "@type": "EducationalOrganization",
  "name": "PHOTON - IIT JEE & NEET COACHING IN VARANASI",
  "alternateName": "PHOTON Coaching Varanasi",
  "url": "https://photoncoaching.in",
  "logo": "https://photoncoaching.in/icon.svg", 
  "description": "PHOTON is Varanasi's leading coaching institute for IIT-JEE (Main + Advanced) and NEET preparation. Founded by physicist Jai Prakash Mishra, we offer expert faculty, proven results, and affordable fees for classes 11, 12, and droppers.",
  "address": {
    "@type": "PostalAddress",
    "streetAddress": "New Colony Kakarmatta, Sundarpur, Nagwa",
    "addressLocality": "Varanasi",
    "addressRegion": "UP",
    "postalCode": "221004",
    "addressCountry": "IN"
  },
  "contactPoint": {
    "@type": "ContactPoint",
    "telephone": "+91-79059-27527",
    "contactType": "customer service"
  },
  "founder": {
    "@type": "Person",
    "name": "Jai Prakash Mishra"
  },
  "knowsAbout": [
    "IIT-JEE Coaching",
    "NEET Coaching",
    "JEE Main",
    "JEE Advanced",
    "Medical Entrance Exam",
    "Engineering Entrance Exam",
    "Class 11 & 12 Physics",
    "Class 11 & 12 Chemistry",
    "Class 11 & 12 Maths"
  ]
};

export const metadata: Metadata = {
  metadataBase: new URL('https://photoncoaching.in'),
  title: {
    template: "%s | PHOTON - Best Coaching for IIT-JEE & NEET in Varanasi",
    default: "PHOTON - Best Coaching for IIT-JEE & NEET in Varanasi",
  },
  description: "PHOTON is the top coaching institute in Varanasi for JEE Main, JEE Advanced, and NEET-UG preparation. Expert faculty, proven results, and affordable fees. Enroll now!",
  keywords: ["best coaching in varanasi", "jee coaching varanasi", "neet coaching varanasi", "iit coaching in varanasi", "class 11 coaching", "class 12 coaching", "photon varanasi", "jai prakash mishra"],
  alternates: {
    canonical: "https://photoncoaching.in", 
  },
  openGraph: {
    title: "PHOTON - Best Coaching for IIT-JEE & NEET in Varanasi",
    description: "Join Varanasi's leading institute for engineering and medical entrance exams. Get mentored by the best faculty and achieve top ranks.",
    url: "https://photoncoaching.in", 
    siteName: "PHOTON Coaching Varanasi",
    images: [
      {
        url: '/og-image.png', 
        width: 1200,
        height: 630,
      },
    ],
    locale: 'en_IN',
    type: 'website',
  },
};
