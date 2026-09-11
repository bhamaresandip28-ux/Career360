import { clsx } from 'clsx';

/**
 * Table — Career360 responsive data table component.
 * Features: Clean white surface, #F8FAFC header with #001D39 labels, subtle #BDD8E9/15 hover row.
 */
export default function Table({ children, className = '' }) {
  return (
    <div className="w-full overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
      <table className={clsx('w-full text-sm text-left', className)}>
        {children}
      </table>
    </div>
  );
}

Table.Head = function TableHead({ children }) {
  return (
    <thead className="bg-[#F8FAFC] border-b border-slate-200">
      {children}
    </thead>
  );
};

Table.Body = function TableBody({ children }) {
  return (
    <tbody className="divide-y divide-slate-100">
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
        'hover:bg-[#BDD8E9]/15',
        className,
      )}
    >
      {children}
    </tr>
  );
};

Table.Th = function TableTh({ children, className = '' }) {
  return (
    <th className={clsx('px-4 py-3 text-xs font-semibold text-[#001D39] uppercase tracking-wider whitespace-nowrap', className)}>
      {children}
    </th>
  );
};

Table.Td = function TableTd({ children, className = '' }) {
  return (
    <td className={clsx('px-4 py-3.5 text-slate-700 text-xs', className)}>
      {children}
    </td>
  );
};
