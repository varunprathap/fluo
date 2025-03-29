import { useState, useEffect } from "react";
import { generateClient } from "aws-amplify/data";
import type { Schema } from "@/amplify/data/resource";
import Link from "next/link";
import { Space_Grotesk } from "next/font/google";

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
        <h1>Fluo OS ⚡️</h1>
        <p>
          Work flows effortlessly. Redefine time attendance and rostering with AI. ✨
        </p>
      </section>

      {/* Features Section */}
      <section className="features">
        <div className="feature">
          <h3>Seamless Flow 🏎️..</h3>
          <p>
            Intuitive shifts and schedules, no friction—just clarity.
          </p>
        </div>
        <div className="feature">
          <h3>Smart Analytics 📊</h3>
          <p>
            Instant insights into patterns and performance.
          </p>
        </div>
        <div className="feature">
          <h3>Built-In Compliance ✅</h3>
          <p>
            Stay ahead with effortless regulation tracking.
          </p>
        </div>
      </section>

      {/* AI Agent Section */}
      <section className="ai-brain">
        <h2>Meet Your AI Brain 🤖</h2>
        <p>
          Fluo's AI agent adapts like water—guiding employees, optimizing rosters, and keeping employers in control. 🚀
        </p>
      </section>

      {/* CTA Section */}
      <section id="get-started" className="cta">
        <h2>Ready to Flow?</h2>
        <p>
          Simplify work for everyone. Join the waitlist today. 🤝
        </p>
        <div className="cta-buttons">
          <Link href="mailto:waitlist@fluo.app" className="button button-primary">
            Join the Flow 
          </Link>
          <Link href="mailto:contact@fluo.app" className="button button-secondary">
            Contact Us 👋
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-6 text-center text-gray-500">
        <p>© 2025 Fluo. All rights reserved. ✨</p>
      </footer>
    </div>
  );
}
