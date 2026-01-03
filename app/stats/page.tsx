import { supabaseServer } from '@/lib/supabaseServer'

export const revalidate = 3600

async function getGlobalStats() {
  const { data: players } = await supabaseServer
    .from('players')
    .select('*')
  
  const { data: rounds } = await supabaseServer
    .from('rounds')
    .select('*')
  
  return {
    totalPlayers: players?.length || 0,
    totalRounds: rounds?.length || 0,
    avgRoundsPerPlayer: players?.length 
      ? ((rounds?.length || 0) / players.length).toFixed(1)
      : '0',
  }
}

export default async function StatsPage() {
  const stats = await getGlobalStats()
  
  return (
    <div className="container mx-auto p-8">
      <h1 className="text-3xl font-bold mb-8">Global Statistics</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="text-4xl font-bold text-blue-600">{stats.totalPlayers}</div>
          <div className="text-gray-600 mt-2">Total Players</div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="text-4xl font-bold text-green-600">{stats.totalRounds}</div>
          <div className="text-gray-600 mt-2">Total Rounds</div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="text-4xl font-bold text-purple-600">{stats.avgRoundsPerPlayer}</div>
          <div className="text-gray-600 mt-2">Avg Rounds/Player</div>
        </div>
      </div>
      
      <div className="mt-8 p-4 bg-blue-50 rounded-lg">
        <p className="text-sm text-gray-700">
          📊 <strong>ISR Enabled:</strong> This page is statically generated and revalidates every hour
        </p>
        <p className="text-sm text-gray-600 mt-1">
          First request after 1 hour triggers background regeneration while serving cached version
        </p>
      </div>

      <div className="mt-4">
        <a 
          href="/" 
          className="text-blue-600 hover:underline"
        >
          ← Back to Dashboard
        </a>
      </div>
    </div>
  )
}
