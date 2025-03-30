import { useState, useEffect } from "react";
import { generateClient } from "aws-amplify/data";
import type { Schema } from "@/amplify/data/resource";
import Link from "next/link";
import { Space_Grotesk } from "next/font/google";
import { 
  Zap, 
  ArrowRight, 
  BarChart3, 
  CheckCircle2, 
  Bot, 
  Rocket,
  HandshakeIcon,
  Mail,
  Sparkles
} from "lucide-react";

const spaceGrotesk = Space_Grotesk({ subsets: ["latin"] });
const client = generateClient<Schema>();

export default function App() {
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
    <div className={`${spaceGrotesk.className} min-h-screen bg-white text-gray-900`}>
      {/* Hero Section */}
      <section className="hero">
        <h1 className="flex items-center justify-center gap-4">
          Fluo OS <Zap size={57} className="h-12 w-12 text-[#6C3BFF]" />
        </h1>
        <p className="flex items-center justify-center gap-2">
          Work flows effortlessly. Redefine time attendance and rostering with AI.
        </p>
      </section>

      {/* Features Section */}
      <section className="features">
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
      </section>

      {/* AI Agent Section */}
      <section className="ai-brain">
        <h2 className="flex items-center justify-center gap-2">Meet Your AI Brain <Bot className="h-12 w-12 text-[#6C3BFF]" /></h2>
        <p>
          Powered by advanced AI, Fluo learns your preferences and adapts to your
          workflow, making shift management more intuitive than ever before. 🚀
        </p>
        <div className="ai-brain-top-padding">
          <Link href="/how-it-works" className="button button-secondary">
          <span className="flex items-center justify-center gap-2">
            Learn More 
          </span>
          </Link>
        </div>
      </section>


      {/* CTA Section */}
      <section id="get-started" className="cta">
        <h2>Ready to Flow?</h2>
        <p className="flex items-center justify-center gap-2">
          Simplify work for everyone. Join the waitlist today.
        </p>
        <div className="cta-buttons">
          <Link href="mailto:varun@vibing.com.au" className="button button-primary">
            <span className="flex items-center justify-center gap-2">
              Join the Flow 
            </span>
          </Link>
          
        </div>
      </section>

      {/* Footer */}
      <footer className="py-6 text-center text-gray-500">
        <p className="flex items-center justify-center gap-2">
          © 2025 Fluo. All rights reserved.
        </p>
      </footer>
    </div>
  );
}
