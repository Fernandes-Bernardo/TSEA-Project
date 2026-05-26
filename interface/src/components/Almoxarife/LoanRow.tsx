import { isConsumableOnly, statusLabel, type Loan } from "../../services/loans";

interface Props {
  loan: Loan;
  actions?: React.ReactNode;
}

/**
 * Card compartilhado de exibição de empréstimo usado pelas páginas
 * do almoxarife (pendentes, ativos, histórico).
 */
function LoanRow({ loan, actions }: Props) {
  const fmt = (s: string | null) => (s ? new Date(s).toLocaleString("pt-BR") : "-");
  const apenasConsumiveis = isConsumableOnly(loan);

  return (
    <article className="bg-[#D9D9D9] rounded-xl border-2 border-primary p-4 shadow-md transition-all duration-300 ease-apple hover:shadow-lg animate-slide-up">
      <header className="flex items-start justify-between gap-3 flex-wrap mb-3">
        <div>
          <h3 className="font-bold text-primary text-lg">
            {loan.responsibleName}{" "}
            <span className="text-sm font-normal text-gray-600">
              (Crachá {loan.employeeId})
            </span>
          </h3>
          <p className="text-xs text-gray-600">Solicitado em {fmt(loan.requestedAt)}</p>
        </div>
        <span className={`text-xs font-bold px-3 py-1 rounded-full ${statusColor(loan.status)}`}>
          {statusLabel(loan.status)}
        </span>
      </header>

      <ul className="text-sm text-gray-800 space-y-1 mb-2">
        {loan.items.map((item) => {
          const pendente = item.quantity - item.returnedQuantity;
          return (
            <li key={item.id} className="flex items-center justify-between">
              <span>
                <span className="font-semibold">{item.quantity}×</span> {item.toolName}{" "}
                <span className="text-xs text-gray-500">
                  ({item.toolType === "CONSUMABLE" ? "Consumível" : "Ferramenta"})
                </span>
              </span>
              {loan.status === "DELIVERED" && item.toolType !== "CONSUMABLE" && (
                <span className="text-xs text-gray-600">
                  {pendente > 0 ? `${pendente} pendente(s)` : "Devolvido"}
                </span>
              )}
            </li>
          );
        })}
      </ul>

      {(loan.deliveredAt || loan.returnedAt) && (
        <div className="text-xs text-gray-600 space-y-0.5">
          {loan.deliveredAt && <p>Entregue em {fmt(loan.deliveredAt)}</p>}
          {loan.returnedAt && <p>Concluído em {fmt(loan.returnedAt)}</p>}
        </div>
      )}

      {apenasConsumiveis && loan.status === "DELIVERED" && (
        <p className="text-xs italic text-gray-600 mt-1">
          Empréstimo apenas com consumíveis — não exige devolução.
        </p>
      )}

      {actions && <div className="mt-3 flex justify-end gap-2 flex-wrap">{actions}</div>}
    </article>
  );
}

function statusColor(status: Loan["status"]): string {
  switch (status) {
    case "REQUESTED":
      return "bg-orange-100 text-orange-700";
    case "DELIVERED":
      return "bg-blue-100 text-blue-700";
    case "RETURNED":
      return "bg-green-100 text-green-700";
    case "CANCELLED":
      return "bg-gray-200 text-gray-600";
  }
}

export default LoanRow;
