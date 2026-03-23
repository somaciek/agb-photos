import { getChannels } from '@/db/queries';
import { createChannelAction, deleteChannelAction } from '@/app/actions/channel-actions';

export const dynamic = 'force-dynamic';

export default async function ChannelsPage() {
  const channels = await getChannels();

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Kanały sprzedaży</h1>

      {/* New channel form */}
      <form action={createChannelAction} className="flex gap-2 mb-6">
        <input
          name="name"
          placeholder="Nazwa kanału"
          required
          className="px-3 py-2 text-sm border border-gray-300 rounded-lg"
        />
        <select
          name="type"
          required
          className="px-3 py-2 text-sm border border-gray-300 rounded-lg"
        >
          <option value="store">Sklep</option>
          <option value="marketplace">Marketplace</option>
        </select>
        <button
          type="submit"
          className="px-4 py-2 text-sm bg-gray-900 text-white rounded-lg hover:bg-gray-800"
        >
          + Nowy kanał
        </button>
      </form>

      {/* Channels table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200 text-left text-xs text-gray-500 uppercase tracking-wider">
              <th className="px-4 py-3">Nazwa</th>
              <th className="px-4 py-3">Typ</th>
              <th className="px-4 py-3">Dodano</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {channels.length === 0 && (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-gray-400">
                  Brak kanałów
                </td>
              </tr>
            )}
            {channels.map((ch) => (
              <tr key={ch.id} className="border-b border-gray-50 hover:bg-gray-50">
                <td className="px-4 py-3 font-medium">{ch.name}</td>
                <td className="px-4 py-3">
                  <span className={`text-xs px-2 py-0.5 rounded-full ${
                    ch.type === 'store' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'
                  }`}>
                    {ch.type === 'store' ? 'Sklep' : 'Marketplace'}
                  </span>
                </td>
                <td className="px-4 py-3 text-gray-500">
                  {new Date(ch.created_at).toLocaleDateString('pl-PL')}
                </td>
                <td className="px-4 py-3 text-right">
                  <form action={async () => {
                    'use server';
                    await deleteChannelAction(ch.id);
                  }}>
                    <button
                      type="submit"
                      className="text-xs text-red-500 hover:text-red-700"
                    >
                      Usuń
                    </button>
                  </form>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
