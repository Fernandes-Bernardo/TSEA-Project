import HistoricoLoans from "../Almoxarife/HistoricoLoans";

/**
 * O admin reaproveita a mesma página de histórico do almoxarife —
 * apenas leitura, todos os empréstimos.
 */
function Historico() {
  return <HistoricoLoans />;
}

export default Historico;
