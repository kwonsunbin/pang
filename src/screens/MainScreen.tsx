import { useState } from 'react'

interface Props {
  onStart: () => void
}

export default function MainScreen({ onStart }: Props) {
  const [showOverlay, setShowOverlay] = useState(false)

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center bg-gray-900 text-white select-none">
      {/* Title */}
      <h1 className="text-8xl font-extrabold tracking-widest text-yellow-400 drop-shadow-lg mb-2">
        PANG
      </h1>
      <p className="text-lg text-gray-300 mb-16">모든 방울을 터뜨려라!</p>

      {/* Buttons */}
      <div className="flex flex-col gap-4 w-56">
        <button
          onClick={onStart}
          className="py-3 text-xl font-bold bg-yellow-400 text-gray-900 rounded-lg hover:bg-yellow-300 active:scale-95 transition-all"
        >
          게임 시작
        </button>
        <button
          onClick={() => setShowOverlay(true)}
          className="py-3 text-xl font-bold border-2 border-gray-500 text-gray-300 rounded-lg hover:border-gray-300 hover:text-white active:scale-95 transition-all"
        >
          조작 방법
        </button>
      </div>

      {/* How to Play Overlay */}
      {showOverlay && (
        <div
          className="absolute inset-0 bg-black/70 flex items-center justify-center"
          onClick={() => setShowOverlay(false)}
        >
          <div
            className="bg-gray-800 border border-gray-600 rounded-xl p-8 w-80 text-center"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-2xl font-bold text-yellow-400 mb-6">조작 방법</h2>
            <table className="w-full text-left mb-6">
              <tbody className="text-gray-200 text-lg">
                <tr className="border-b border-gray-700">
                  <td className="py-3 pr-4 font-mono text-yellow-300">← →</td>
                  <td className="py-3">플레이어 좌우 이동</td>
                </tr>
                <tr>
                  <td className="py-3 pr-4 font-mono text-yellow-300">Space</td>
                  <td className="py-3">와이어 발사</td>
                </tr>
              </tbody>
            </table>
            <button
              onClick={() => setShowOverlay(false)}
              className="mt-2 px-6 py-2 bg-gray-600 hover:bg-gray-500 rounded-lg text-gray-200 transition-colors"
            >
              닫기
            </button>
            <p className="mt-3 text-xs text-gray-500">ESC 또는 화면 바깥을 클릭해도 닫힙니다</p>
          </div>
        </div>
      )}

      {/* ESC key to close overlay */}
      {showOverlay && (
        <EscListener onEsc={() => setShowOverlay(false)} />
      )}
    </div>
  )
}

function EscListener({ onEsc }: { onEsc: () => void }) {
  useState(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onEsc() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  })
  return null
}
