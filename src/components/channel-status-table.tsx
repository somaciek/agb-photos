import { StatusCheckbox } from './status-checkbox';
import { StatusDropdown } from './status-dropdown';
import { NoteField } from './note-field';

interface StatusRow {
  id: number;
  sku_id: number;
  channel_id: number;
  photo_session_id: number | null;
  is_updated: boolean;
  note: string;
  updated_at: string;
  channel_name: string;
  channel_type: string;
  session_label: string | null;
  latest_session_id: number | null;
  is_outdated: boolean;
}

interface Session {
  id: number;
  label: string;
}

export function ChannelStatusTable({ rows, sessions, skuId }: { rows: StatusRow[]; sessions: Session[]; skuId: number }) {
  if (rows.length === 0) {
    return <p className="text-sm text-gray-500 py-4">Brak kanałów. Dodaj kanały w zakładce Kanały.</p>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-gray-200 text-left text-xs text-gray-500 uppercase tracking-wider">
            <th className="py-2 pr-4">Kanał</th>
            <th className="py-2 pr-4">Typ</th>
            <th className="py-2 pr-4 text-center">Zaktualizowany</th>
            <th className="py-2 pr-4">Sesja zdjęciowa</th>
            <th className="py-2 pr-4">Notatka</th>
            <th className="py-2">Ostatnia zmiana</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr
              key={row.id}
              className={`border-b border-gray-100 ${row.is_outdated ? 'bg-amber-50' : ''}`}
            >
              <td className="py-2 pr-4 font-medium">{row.channel_name}</td>
              <td className="py-2 pr-4">
                <span className={`text-xs px-2 py-0.5 rounded-full ${
                  row.channel_type === 'store' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'
                }`}>
                  {row.channel_type}
                </span>
              </td>
              <td className="py-2 pr-4 text-center">
                <StatusCheckbox statusId={row.id} skuId={skuId} checked={row.is_updated} />
              </td>
              <td className="py-2 pr-4">
                <StatusDropdown
                  statusId={row.id}
                  skuId={skuId}
                  currentSessionId={row.photo_session_id}
                  sessions={sessions}
                />
              </td>
              <td className="py-2 pr-4">
                <NoteField statusId={row.id} skuId={skuId} initialNote={row.note} />
              </td>
              <td className="py-2 text-xs text-gray-500 whitespace-nowrap">
                {row.updated_at ? new Date(row.updated_at).toLocaleDateString('pl-PL') : '—'}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
