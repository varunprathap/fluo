"use client";

import { useState, useEffect, useRef } from "react";
import { generateClient } from "aws-amplify/data";
import type { Schema } from "@/amplify/data/resource";
import Link from "next/link";
import Image from "next/image";
import { Space_Grotesk } from "next/font/google";
import { Route } from "lucide-react";

const spaceGrotesk = Space_Grotesk({ subsets: ["latin"] });
const client = generateClient<Schema>();

export default function Home() {
  const tickerRefs = [useRef<HTMLDivElement>(null), useRef<HTMLDivElement>(null), useRef<HTMLDivElement>(null)];
  const words = [
    'Payroll',
    'Enterprise agreement',
    'Award interpretation',
    'Time attendance',
    'Rostering',
    'Compliance',
    'Workforce analytics',
  ];
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [isFlipping, setIsFlipping] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setIsFlipping(true);
      setCurrentWordIndex((prev) => {
        let next;
        do {
          next = Math.floor(Math.random() * words.length);
        } while (next === prev);
        return next;
      });
      setTimeout(() => {
        setIsFlipping(false);
      }, 1000);
    }, 2000);
    return () => clearInterval(interval);
  }, [words.length]);

  return (
    <div className={`${spaceGrotesk.className} text-gray-900`}>
      <section className="hero py-12">
        <div className="flex flex-col items-center justify-center gap-4 mt-6 text-lg text-center">
          <p>
            <span className="fluo-ticker animate-ticker">
              {isFlipping ? words[currentWordIndex] : words[currentWordIndex]}
            </span>{' '}
            is <span className="line-through">complex</span>; complicated.
          </p>
        </div>
      </section>
      <section className="features">
        <div className="mt-10 flex justify-center">
          <div>
            <table className="table-auto border-collapse border border-gray-300">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border border-gray-300 px-4 py-2">Word</th>
                  <th className="border border-gray-300 px-4 py-2">Solvability</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="border border-gray-300 px-4 py-2">Complicated</td>
                  <td className="border border-gray-300 px-4 py-2">
                    Can be solved — messy but fixable
                  </td>
                </tr>
                <tr>
                  <td className="border border-gray-300 px-4 py-2">Complex</td>
                  <td className="border border-gray-300 px-4 py-2">
                    Harder to solve — deep, layered, and is dynamic and inherently
                    uncertain.
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </div>
  );
} 