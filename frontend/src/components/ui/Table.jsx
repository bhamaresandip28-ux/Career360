import { clsx } from 'clsx';

/**
 * Table — responsive data table component.
 */
export default function Table({ children, className = '' }) {
  return (
    <div className="w-full overflow-x-auto rounded-xl border border-white/10">
      <table className={clsx('w-full text-sm text-left', className)}>
        {children}
      </table>
    </div>
  );
}

Table.Head = function TableHead({ children }) {
  return (
    <thead className="bg-white/5 border-b border-white/10">
      {children}
    </thead>
  );
};

Table.Body = function TableBody({ children }) {
  return (
    <tbody className="divide-y divide-white/5">
      {children}
    </tbody>
  );
};

Table.Row = function TableRow({ children, className = '', onClick }) {
  return (
    <tr
      onClick={onClick}
      className={clsx(
        'transition-colors duration-150',
        onClick && 'cursor-pointer',
        'hover:bg-white/5',
        className,
      )}
    >
      {children}
    </tr>
  );
};

Table.Th = function TableTh({ children, className = '' }) {
  return (
    <th className={clsx('px-4 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider whitespace-nowrap', className)}>
      {children}
    </th>
  );
};

Table.Td = function TableTd({ children, className = '' }) {
  return (
    <td className={clsx('px-4 py-3 text-slate-300', className)}>
      {children}
    </td>
  );
};
