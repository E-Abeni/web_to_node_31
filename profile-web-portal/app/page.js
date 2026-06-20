"use client";

import {useRouter} from "next/navigation";

export default function Home() {
  const router = useRouter();

  function handleGetStarted() {
    router.push("/dashboard");
  }

  return (
    <div className="flex flex-col flex-1 items-center justify-center font-sans bg-[#09141f] min-h-screen">
      <main className="flex flex-col items-center justify-center max-w-4xl px-4 py-16 gap-10">
          <h1 className="text-6xl font-bold text-center text-white dark:text-white"> Welcome to the Behavior Profile Web Portal</h1>
          <p className="mt-3 text-2xl text-center text-white dark:text-gray-400"> Explore and manage your behavior profiles with ease.</p>
          <button className="w-fit mt-10 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition duration-300" onClick={handleGetStarted}>
            Get Started
          </button>
      </main>
    </div>
  );
}
