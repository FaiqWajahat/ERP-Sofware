// Components/ProjectTables.js
import { Trash2, DollarSign, TrendingUp } from 'lucide-react';

/**
 * Table for Expenses and Income Tabs (Editable with Delete)
 */
export const TransactionTable = ({ data, type, onDelete, total }) => {
  const isExpense = type === 'expense';
  const colorClass = isExpense ? 'text-error' : 'text-success';
  const EmptyIcon = isExpense ? DollarSign : TrendingUp;

  return (
    <div className="bg-base-100 rounded-lg border border-base-200 overflow-hidden">
      {/* Wrapper for responsive scrolling on small devices */}
      <div className="overflow-x-auto">
        <table className="table table-zebra w-full whitespace-nowrap">
          <thead>
            <tr>
              <th className="w-32">Date</th>
              <th>Description</th>
              {isExpense && <th>Category</th>}
              <th className="text-right">Amount</th>
              <th className="w-10"></th>
            </tr>
          </thead>
          <tbody>
            {data.map((item) => (
              <tr key={item.id}>
                <td>{new Date(item.date).toLocaleDateString()}</td>
                <td className="whitespace-normal min-w-[200px]">{item.description}</td>
                {isExpense && (
                  <td>
                    <span className="badge badge-sm capitalize badge-ghost">
                      {item.category}
                    </span>
                  </td>
                )}
                <td className={`text-right font-semibold ${colorClass}`}>
                  ${item.amount.toLocaleString()}
                </td>
                <td>
                  <button
                    onClick={() => onDelete(item.id)}
                    className="btn btn-ghost btn-xs text-error"
                  >
                    <Trash2 size={14} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
          {data.length > 0 && (
            <tfoot>
              <tr>
                <td colSpan={isExpense ? 3 : 2} className="text-right font-semibold text-sm">
                  Total:
                </td>
                <td className={`text-right font-bold text-lg ${colorClass}`}>
                  ${total.toLocaleString()}
                </td>
                <td></td>
              </tr>
            </tfoot>
          )}
        </table>
      </div>

      {data.length === 0 && (
        <div className="text-center py-12">
          <EmptyIcon size={48} className="mx-auto text-gray-300 mb-2" />
          <p className="text-gray-500">No {type}s recorded yet</p>
        </div>
      )}
    </div>
  );
};

/**
 * Table for Overview Tab (Read-only Activity Feed)
 */
export const ActivityTable = ({ transactions }) => {
  if (!transactions || transactions.length === 0) {
    return <div className="text-gray-500 text-sm">No recent activity.</div>;
  }

  return (
    <div className="overflow-x-auto bg-base-100 rounded-lg border border-base-200">
      <table className="table table-zebra w-full whitespace-nowrap">
        <thead>
          <tr>
            <th>Date</th>
            <th>Description</th>
            <th>Type</th>
            <th className="text-right">Amount</th>
          </tr>
        </thead>
        <tbody>
          {transactions.map((item, index) => (
            <tr key={index}>
              <td>{new Date(item.date).toLocaleDateString()}</td>
              <td className="whitespace-normal min-w-[200px]">{item.description}</td>
              <td>
                <span className={`badge badge-sm ${item.category ? 'badge-error' : 'badge-success'}`}>
                  {item.category ? 'Expense' : 'Income'}
                </span>
              </td>
              <td className={`text-right font-semibold ${item.category ? 'text-error' : 'text-success'}`}>
                {item.category ? '-' : '+'}${item.amount.toLocaleString()}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};