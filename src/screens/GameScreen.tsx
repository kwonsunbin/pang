import { GW, GH } from '../game/constants'
import { useGameLoop } from '../game/useGameLoop'
import type { MissionConfig } from '../missions/types'

export default function GameScreen({ mission, onBack }: { mission: MissionConfig; onBack: () => void }) {
  const { canvasRef, overlay, resetGame } = useGameLoop(mission)

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-950 gap-3">
      <div className="relative">
        <canvas
          ref={canvasRef}
          width={GW}
          height={GH}
          className="block border-2 border-gray-700 rounded-sm"
        />
        {overlay !== 'none' && (
          <ResultOverlay
            title={overlay === 'clear' ? 'MISSION CLEAR!' : 'GAME OVER'}
            titleColor={overlay === 'clear' ? 'text-yellow-400' : 'text-red-500'}
            onRetry={resetGame}
            onBack={onBack}
          />
        )}
      </div>
      <button
        onClick={onBack}
        className="text-sm text-gray-500 hover:text-gray-300 transition-colors"
      >
        ← 메인으로
      </button>
    </div>
  )
}

function ResultOverlay({ title, titleColor, onRetry, onBack }: {
  title: string
  titleColor: string
  onRetry: () => void
  onBack: () => void
}) {
  return (
    <div className="absolute inset-0 flex items-center justify-center bg-black/70 rounded-sm">
      <div className="text-center">
        <h2 className={`text-5xl font-extrabold mb-10 tracking-wide ${titleColor}`}>{title}</h2>
        <div className="flex flex-col gap-3 w-48 mx-auto">
          <button
            onClick={onRetry}
            className="py-3 text-lg font-bold bg-yellow-400 text-gray-900 rounded-lg hover:bg-yellow-300 active:scale-95 transition-all"
          >
            다시 시작
          </button>
          <button
            onClick={onBack}
            className="py-3 text-lg font-bold border-2 border-gray-500 text-gray-300 rounded-lg hover:border-gray-300 hover:text-white active:scale-95 transition-all"
          >
            메인으로
          </button>
        </div>
      </div>
    </div>
  )
}
