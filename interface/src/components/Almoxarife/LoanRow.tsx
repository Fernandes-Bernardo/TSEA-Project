import { isConsumableOnly, statusLabel, type Loan } from "../../services/loans";

interface Props {
  loan: Loan;
  actions?: React.ReactNode;
}

function LoanRow({ loan, actions }: Props) {
  const fmt = (s: string | null) => (s ? new Date(s).toLocaleString("pt-BR") : "-");
  const apenasConsumiveis = isConsumableOnly(loan);

  return (
    <div className="px-5 py-4 flex flex-col md:flex-row md:items-start md:justify-between gap-4 transition-colors duration-200 hover:bg-black/5">
      <div className="flex-1 min-w-0">
        <h3 className="font-bold text-primary text-lg leading-tight">
          <span className="text-highlight">&gt;</span> {loan.responsibleName}
        </h3>

        <p className="text-sm text-gray-800 font-semibold mt-1">
          <Star /> Solicitado em <span className="font-bold">{fmt(loan.requestedAt)}</span>
        </p>
        <p className="text-sm text-gray-800 font-semibold">
          <Star /> Crachá: <span className="font-bold">{loan.employeeId}</span>
        </p>
        {loan.deliveredAt && (
          <p className="text-sm text-gray-800 font-semibold">
            <Star /> Entregue em <span className="font-bold">{fmt(loan.deliveredAt)}</span>
          </p>
        )}
        {loan.returnedAt && (
          <p className="text-sm text-gray-800 font-semibold">
            <Star /> Concluído em <span className="font-bold">{fmt(loan.returnedAt)}</span>
          </p>
        )}

        <ul className="text-sm text-gray-800 space-y-0.5 mt-2">
          {loan.items.map((item) => {
            const pendente = item.quantity - item.returnedQuantity;
            return (
              <li key={item.id} className="flex items-center gap-2">
                <span className="font-semibold">{item.quantity}x {item.toolName}</span>
                <span className="text-xs text-gray-500">
                  ({item.toolType === "CONSUMABLE" ? "Consumível" : "Ferramenta"})
                </span>
                {loan.status === "DELIVERED" && item.toolType !== "CONSUMABLE" && (
                  <span className="text-xs text-gray-600 ml-auto">
                    {pendente > 0 ? `${pendente} pendente(s)` : "Devolvido"}
                  </span>
                )}
              </li>
            );
          })}
        </ul>

        {apenasConsumiveis && loan.status === "DELIVERED" && (
          <p className="text-xs italic text-gray-600 mt-2">
            Empréstimo apenas com consumíveis — não exige devolução.
          </p>
        )}
      </div>

      <div className="flex flex-col items-end gap-3 min-w-[180px]">
        <span className={`text-sm font-bold ${statusColor(loan.status)}`}>
          {statusLabel(loan.status)}
        </span>
        {actions && <div className="flex flex-col gap-2 w-full items-end">{actions}</div>}
      </div>
    </div>
  );
}

function Star() {
  return <span className="text-highlight font-bold mr-1">*</span>;
}

function statusColor(status: Loan["status"]): string {
  switch (status) {
    case "REQUESTED":
      return "text-highlight";
    case "DELIVERED":
      return "text-blue-700";
    case "RETURNED":
      return "text-green-700";
    case "CANCELLED":
      return "text-gray-500";
  }
}

export default LoanRow;
