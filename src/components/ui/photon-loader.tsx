"use client";

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface PhotonLoaderProps {
  isLoading: boolean;
}

export default function PhotonLoader({ isLoading }: PhotonLoaderProps) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (isLoading) {
      setShow(true);
    } else {
      // Small delay before hiding to ensure smooth transition
      const timer = setTimeout(() => setShow(false), 300);
      return () => clearTimeout(timer);
    }
  }, [isLoading]);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-white/90 backdrop-blur-sm"
        >
          <div className="relative">
            {/* Rotating wave circle */}
            <motion.div
              animate={{ rotate: 360 }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "linear"
              }}
              className="absolute inset-0 w-32 h-32"
            >
              <svg
                viewBox="0 0 100 100"
                className="w-full h-full"
              >
                <defs>
                  <linearGradient id="waveGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#3B82F6" stopOpacity="0.8" />
                    <stop offset="50%" stopColor="#8B5CF6" stopOpacity="0.6" />
                    <stop offset="100%" stopColor="#EC4899" stopOpacity="0.4" />
                  </linearGradient>
                </defs>
                <path
                  d="M 50,10 Q 70,25 85,50 T 50,90 Q 30,75 15,50 T 50,10"
                  fill="none"
                  stroke="url(#waveGradient)"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
                <path
                  d="M 50,15 Q 65,30 75,50 T 50,85 Q 35,70 25,50 T 50,15"
                  fill="none"
                  stroke="url(#waveGradient)"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  opacity="0.6"
                />
              </svg>
            </motion.div>

            {/* Triangle with P */}
            <motion.div
              initial={{ scale: 0.8 }}
              animate={{ scale: [0.8, 1, 0.8] }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut"
              }}
              className="relative w-32 h-32 flex items-center justify-center"
            >
              <svg
                viewBox="0 0 100 100"
                className="w-full h-full"
              >
                {/* Triangle */}
                <path
                  d="M 50,20 L 80,70 L 20,70 Z"
                  fill="none"
                  stroke="#1F2937"
                  strokeWidth="2"
                  strokeLinejoin="round"
                />
                
                {/* Letter P */}
                <text
                  x="50"
                  y="55"
                  textAnchor="middle"
                  className="fill-gray-800 font-bold text-2xl font-sans"
                >
                  P
                </text>
              </svg>
            </motion.div>

            {/* Pulsing dots */}
            <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 flex gap-2">
              {[0, 1, 2].map((index) => (
                <motion.div
                  key={index}
                  animate={{
                    scale: [1, 1.5, 1],
                    opacity: [0.3, 1, 0.3]
                  }}
                  transition={{
                    duration: 1.5,
                    repeat: Infinity,
                    delay: index * 0.2,
                    ease: "easeInOut"
                  }}
                  className="w-2 h-2 bg-blue-500 rounded-full"
                />
              ))}
            </div>
          </div>

          {/* Loading text */}
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="absolute bottom-20 text-gray-600 text-sm font-medium"
          >
            Loading...
          </motion.p>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
