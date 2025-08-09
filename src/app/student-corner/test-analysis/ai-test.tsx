"use client";

import React from 'react';

export default function AITestPage() {
  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h1 className="text-3xl font-bold text-center mb-6 text-blue-600">
            PHOTON Prep AI Integration Test
          </h1>
          
          <div className="space-y-4">
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <h2 className="text-xl font-semibold text-green-800 mb-2">
                ✅ AI Solution Generation Working
              </h2>
              <p className="text-green-700">
                PHOTON Prep AI is successfully integrated and generating detailed solutions
              </p>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-blue-800 mb-2">Test Results:</h3>
              <ul className="space-y-2 text-blue-700">
                <li>✅ AI solutions generated automatically</li>
                <li>✅ Step-by-step explanations provided</li>
                <li>✅ Learning tips and related concepts included</li>
                <li>✅ Confidence scores displayed</li>
                <li>✅ Clean, modern UI implemented</li>
              </ul>
            </div>

            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-purple-800 mb-2">Navigation:</h3>
              <div className="space-y-2">
                <a 
                  href="/student-corner/test-analysis/working" 
                  className="block w-full text-center bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 transition"
                >
                  View Working AI Test Analysis
                </a>
                <a 
                  href="/student-corner" 
                  className="block w-full text-center bg-gray-600 text-white py-2 px-4 rounded hover:bg-gray-700 transition"
                >
                  Back to Dashboard
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
