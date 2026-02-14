'use client';

import Link from 'next/link';

export default function Page() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-md">
        <nav className="flex items-center justify-between px-4 py-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
          <h1 className="text-2xl font-bold text-indigo-600">Talvio</h1>
          <div className="flex gap-4">
            <Link href="/login">
              <button className="px-6 py-2 font-semibold text-indigo-600 transition border-2 border-indigo-600 rounded-lg hover:bg-indigo-50">
                Log in
              </button>
            </Link>
            <Link href="/register">
              <button className="px-6 py-2 font-semibold text-white transition bg-indigo-600 rounded-lg hover:bg-indigo-700">
                Sign up
              </button>
            </Link>
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <main className="px-4 py-20 mx-auto text-center max-w-7xl sm:px-6 lg:px-8">
        <h2 className="mb-6 text-4xl font-bold text-gray-900 md:text-5xl">Landing Page Comming soon...</h2>
        <p className="mb-8 text-lg text-gray-600"></p>
      </main>
    </div>
  );
}
