"use client";

import { Clock, PlayCircle, Calendar, Users, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Link from "next/link";

export default function LiveClassesPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full">
        <Card className="border-0 shadow-2xl bg-white/80 backdrop-blur-sm">
          <CardContent className="p-8 md:p-12 text-center">
            {/* Animated Icon */}
            <div className="relative mb-8">
              <div className="w-24 h-24 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full flex items-center justify-center mx-auto animate-pulse">
                <Clock className="h-12 w-12 text-white" />
              </div>
              <div className="absolute -top-2 -right-2">
                <Sparkles className="h-8 w-8 text-yellow-400 animate-bounce" />
              </div>
            </div>

            {/* Title */}
            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent mb-4">
              Live Classes
            </h1>
            
            {/* Coming Soon Message */}
            <div className="space-y-4 mb-8">
              <p className="text-2xl font-semibold text-gray-700">
                🚀 Feature Coming Soon! 🚀
              </p>
              <p className="text-lg text-gray-600 leading-relaxed">
                Get ready for an amazing learning experience with our interactive live classes!
              </p>
              <p className="text-gray-500">
                Stay connected for real-time doubt solving, expert faculty sessions, and collaborative learning with your peers.
              </p>
            </div>

            {/* Features Preview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              <div className="bg-purple-50 p-4 rounded-lg">
                <PlayCircle className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                <h3 className="font-semibold text-purple-700">Live Sessions</h3>
                <p className="text-sm text-purple-600">Real-time classes</p>
              </div>
              <div className="bg-blue-50 p-4 rounded-lg">
                <Calendar className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                <h3 className="font-semibold text-blue-700">Flexible Schedule</h3>
                <p className="text-sm text-blue-600">Choose your time</p>
              </div>
              <div className="bg-green-50 p-4 rounded-lg">
                <Users className="h-8 w-8 text-green-600 mx-auto mb-2" />
                <h3 className="font-semibold text-green-700">Peer Learning</h3>
                <p className="text-sm text-green-600">Study together</p>
              </div>
            </div>

            {/* CTA Section */}
            <div className="space-y-4">
              <div className="flex items-center justify-center space-x-2 text-gray-600">
                <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse"></div>
                <span className="text-sm">Stay Connected</span>
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
              </div>
              
              <Link href="/student-corner">
                <Button 
                  size="lg" 
                  className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-8 py-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  Back to Student Corner
                </Button>
              </Link>
            </div>

            {/* Emoji Footer */}
            <div className="mt-8 text-4xl animate-bounce">
              📚✨🎯
            </div>
          </CardContent>
        </Card>

        {/* Background decorative elements */}
        <div className="absolute top-1/4 left-1/4 w-20 h-20 bg-purple-200 rounded-full opacity-20 animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-16 h-16 bg-blue-200 rounded-full opacity-20 animate-pulse delay-1000"></div>
      </div>
    </div>
  );
}
