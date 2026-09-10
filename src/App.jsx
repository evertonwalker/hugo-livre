import { useState } from 'react'

function App() {
  const [count, setCount] = useState(0)

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
      <main className="w-full max-w-md rounded-2xl bg-white p-8 shadow-lg ring-1 ring-slate-200">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">
          hugo-livre
        </h1>
        <p className="mt-2 text-slate-600">
          React + Vite + Tailwind CSS prontos para usar.
        </p>

        <button
          onClick={() => setCount((c) => c + 1)}
          className="mt-6 w-full rounded-lg bg-indigo-600 px-4 py-2.5 font-medium text-white transition hover:bg-indigo-500 active:bg-indigo-700"
        >
          Contador: {count}
        </button>

        <p className="mt-6 text-sm text-slate-500">
          Edite <code className="rounded bg-slate-100 px-1.5 py-0.5 font-mono text-slate-700">src/App.jsx</code> e salve para ver o hot reload.
        </p>
      </main>
    </div>
  )
}

export default App
