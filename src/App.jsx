import Comments from './components/Comments'
import Countdown from './components/Countdown'

export default function App() {
  return (
    <div className="min-h-screen bg-black text-white antialiased">
      <main className="w-full px-4 sm:px-8">
        <div className="mx-auto flex min-h-[85vh] max-w-7xl flex-col justify-center py-16">
          <Countdown />
        </div>

        <div className="mx-auto max-w-2xl pb-24">
          <Comments />
        </div>
      </main>
    </div>
  )
}
