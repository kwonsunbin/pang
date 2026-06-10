import { useState } from 'react'
import MainScreen from './screens/MainScreen'
import GameScreen from './screens/GameScreen'
import { mission1 } from './missions'

type Screen = 'main' | 'game'

export default function App() {
  const [screen, setScreen] = useState<Screen>('main')

  if (screen === 'game') return <GameScreen mission={mission1} onBack={() => setScreen('main')} />
  return <MainScreen onStart={() => setScreen('game')} />
}
