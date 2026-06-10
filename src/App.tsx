import { useState } from 'react'
import MainScreen from './screens/MainScreen'
import GameScreen from './screens/GameScreen'
import { mission1 } from './missions'
import type { MissionConfig } from './missions'

type Screen = 'main' | 'game'

export default function App() {
  const [screen, setScreen] = useState<Screen>('main')
  const [mission, setMission] = useState<MissionConfig>(mission1)

  function startMission(m: MissionConfig) {
    setMission(m)
    setScreen('game')
  }

  if (screen === 'game') return <GameScreen mission={mission} onBack={() => setScreen('main')} />
  return <MainScreen onSelectMission={startMission} />
}
