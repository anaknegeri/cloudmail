import Settings from '../screens/Settings'

export default function SettingsPage() {
  // Settings now manages its own theme state internally or via a global store
  // For now, we'll pass dummy props since the original Settings component expects them
  // In a real refactor, Settings would use a theme store instead
  return <Settings theme="light" onThemeChange={() => {}} />
}
