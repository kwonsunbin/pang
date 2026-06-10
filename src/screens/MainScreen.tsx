import { useState } from 'react'
import { mission1, mission2 } from '../missions'
import type { MissionConfig } from '../missions'

interface Props {
  onSelectMission: (mission: MissionConfig) => void
}

const MISSIONS = [
  { config: mission1, difficulty: 'EASY',   desc: 'Large ×2  /  속도 70%',  color: 'text-green-400',  border: 'border-green-700 hover:border-green-400' },
  { config: mission2, difficulty: 'NORMAL', desc: 'Large ×3  /  속도 100%', color: 'text-yellow-400', border: 'border-yellow-700 hover:border-yellow-400' },
]

export default function MainScreen({ onSelectMission }: Props) {
  const [showOverlay, setShowOverlay] = useState(false)

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center bg-gray-900 text-white select-none">
      <h1 className="text-8xl font-extrabold tracking-widest text-yellow-400 drop-shadow-lg mb-2">
        PANG
      </h1>
      <p className="text-lg text-gray-300 mb-12">모든 방울을 터뜨려라!</p>

      {/* Mission Select */}
      <div className="flex flex-col gap-4 w-64 mb-6">
        {MISSIONS.map(({ config, difficulty, desc, color, border }) => (
          <button
            key={config.id}
            onClick={() => onSelectMission(config)}
            className={`py-4 px-5 text-left border-2 rounded-lg active:scale-95 transition-all ${border}`}
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-lg font-bold text-white">{config.name}</span>
              <span className={`text-xs font-bold tracking-widest ${color}`}>{difficulty}</span>
            </div>
            <span className="text-sm text-gray-400">{desc}</span>
          </button>
        ))}
      </div>

      <button
        onClick={() => setShowOverlay(true)}
        className="text-sm text-gray-500 hover:text-gray-300 transition-colors"
      >
        조작 방법
      </button>

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

      {showOverlay && <EscListener onEsc={() => setShowOverlay(false)} />}
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
