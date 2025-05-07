import { useState, useEffect, useRef } from "react";
import { generateClient } from "aws-amplify/data";
import type { Schema } from "@/amplify/data/resource";
import Link from "next/link";
import Image from "next/image";
import { Space_Grotesk } from "next/font/google";
import {
  Route
} from "lucide-react";



const spaceGrotesk = Space_Grotesk({ subsets: ["latin"] });
const client = generateClient<Schema>();

export default function App() {



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

      // Update the word index immediately when the flip starts
      setCurrentWordIndex((prev) => {
        let next;
        do {
          next = Math.floor(Math.random() * words.length);
        } while (next === prev);
        return next;
      });

      // Reset isFlipping after the animation duration
      setTimeout(() => {
        setIsFlipping(false);
      }, 1000); // Match this with your CSS animation duration
    }, 2000); // Interval for flipping every 2 seconds

    return () => clearInterval(interval);
  }, [words.length]);
  // const [todos, setTodos] = useState<Array<Schema["Todo"]["type"]>>([]);

  // function listTodos() {
  //   client.models.Todo.observeQuery().subscribe({
  //     next: (data) => setTodos([...data.items]),
  //   });
  // }

  // useEffect(() => {
  //   listTodos();
  // }, []);

  // function createTodo() {
  //   client.models.Todo.create({
  //     content: window.prompt("Todo content"),
  //   });
  // }

  // return (
  //   <main>
  //     <h1>My todos</h1>
  //     <button onClick={createTodo}>+ new</button>
  //     <ul>
  //       {todos.map((todo) => (
  //         <li key={todo.id}>{todo.content}</li>
  //       ))}
  //     </ul>
  //     <div>
  //       🥳 App successfully hosted. Try creating a new todo.
  //       <br />
  //       <a href="https://docs.amplify.aws/gen2/start/quickstart/nextjs-pages-router/">
  //         Review next steps of this tutorial.
  //       </a>
  //     </div>
  //   </main>
  // );

  return (
    <div className={`${spaceGrotesk.className} text-gray-900`}>
      {/* Hero Section */}
      {/* <section className="hero">
        <h1 className="flex items-center justify-center gap-4">
          Fluo OS <Zap size={57} className="h-12 w-12 text-[#6C3BFF]" />
        </h1>
        <p className="flex items-center justify-center gap-2">
          Work flows effortlessly. Redefine time attendance and rostering with AI.
          
        </p>
      </section> */}


     <section className="hero py-12">
      <h1 className="fluo-heading">
        Fluo OS{" "}
        {/* <Route
          size={57}
          className="h-8 w-8 text-[#6C3BFF] sm:h-12 sm:w-12"
        /> */}
  
      </h1>
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
      {/* Features Section */}
      {/* <section className="features">
        <div className="feature">
          <ArrowRight className="h-8 w-8 text-[#6C3BFF] mb-4" />
          <h3>Seamless Flow</h3>
          <p>
            Intuitive shifts and schedules, no friction—just clarity.
          </p>
        </div>
        <div className="feature">
          <BarChart3 className="h-8 w-8 text-[#6C3BFF] mb-4" />
          <h3>Smart Analytics</h3>
          <p>
            Instant insights into patterns and performance.
          </p>
        </div>
        <div className="feature">

          <CheckCircle2 className="h-8 w-8 text-[#6C3BFF] mb-4 justify-center" />
          <h3>Built-In Compliance</h3>
          <p>
            Stay ahead with effortless regulation tracking.
          </p>

        </div>
      </section> */}

      {/* AI Agent Section */}
      {/* <section className="ai-brain">
        <h2 className="flex items-center justify-center gap-2">Meet Your AI Brain <Bot className="h-12 w-12 text-[#6C3BFF]" /></h2>
        <p>
          Powered by advanced AI, Fluo learns your preferences and adapts to your
          workflow, making shift management more intuitive than ever before. 🚀
        </p>
        <div className="ai-brain-top-padding">
          <Link href="/how-it-works" className="button button-secondary">
            <span className="flex items-center justify-center gap-2">
              How it Works
            </span>
          </Link>
        </div>
      </section> */}

     
    </div>
  );
}
