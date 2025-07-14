import type { Metadata } from "next";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const metadata: Metadata = {
  title: "Results | PHOTON Coaching Varanasi",
  description: "Our success stories – top ranks secured by PHOTON students in JEE & NEET.",
};

export default function ResultsPage() {
  return (
    <div className="container mx-auto px-4 py-12 md:px-6 md:py-20">
      <Card>
        <CardHeader>
          <CardTitle className="font-headline text-3xl">Student Achievements</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-muted-foreground text-lg">
          <p>Result gallery coming soon. Stay tuned!</p>
        </CardContent>
      </Card>
    </div>
  );
}
