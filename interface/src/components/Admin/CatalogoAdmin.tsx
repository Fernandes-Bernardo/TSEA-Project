import { useEffect, useMemo, useState } from "react";
import {
  isLowStock,
  isOutOfStock,
  levelSecurityColor,
  levelSecurityLabel,
  toolsApi,
  type Tool,
} from "../../services/tools";
import { MaterialCardSkeleton } from "../ui/Skeleton";
import { useToast } from "../ui/Toast";

type TipoFiltro = "todos" | "DAILY_USE" | "CONSUMABLE";
type Ordem = "nome-asc" | "nome-desc" | "qtd-asc" | "qtd-desc";

function CatalogoAdmin() {
  const { toast } = useToast();
  const [tools, setTools] = useState<Tool[]>([]);
  const [loading, setLoading] = useState(true);
  const [busca, setBusca] = useState("");
  const [tipo, setTipo] = useState<TipoFiltro>("todos");
  const [ordem, setOrdem] = useState<Ordem>("nome-asc");

  useEffect(() => {
    (async () => {
      try {
        const data = await toolsApi.list();
        setTools(data);
      } catch (err) {
        console.error("[catalogo] erro:", err);
        toast("Não foi possível carregar o catálogo.", "error");
      } finally {
        setLoading(false);
      }
    })();
  }, [toast]);

  const visiveis = useMemo(() => {
    let arr = tools.filter(
      (t) =>
        (tipo === "todos" || t.type === tipo) &&
        (busca === "" ||
          t.name.toLowerCase().includes(busca.toLowerCase()) ||
          t.description.toLowerCase().includes(busca.toLowerCase()))
    );
    arr = arr.slice();
    arr.sort((a, b) => {
      switch (ordem) {
        case "nome-asc":
          return a.name.localeCompare(b.name);
        case "nome-desc":
          return b.name.localeCompare(a.name);
        case "qtd-asc":
          return a.quantity - b.quantity;
        case "qtd-desc":
          return b.quantity - a.quantity;
      }
    });
    return arr;
  }, [tools, busca, tipo, ordem]);

  const totais = useMemo(
    () => ({
      total: tools.length,
      ferramentas: tools.filter((t) => t.type === "DAILY_USE").length,
      consumiveis: tools.filter((t) => t.type === "CONSUMABLE").length,
      estoque: tools.reduce((acc, t) => acc + t.quantity, 0),
      estoqueBaixo: tools.filter((t) => isLowStock(t) || isOutOfStock(t)).length,
    }),
    [tools]
  );

  return (
    <div className="min-h-screen p-6 animate-fade-in" style={{ backgroundColor: "#BEBEBE" }}>
      <div className="flex flex-col gap-6 w-full max-w-6xl mx-auto">
        <section className="grid grid-cols-2 md:grid-cols-5 gap-3">
          <StatCard label="Itens cadastrados" value={totais.total} />
          <StatCard label="Ferramentas" value={totais.ferramentas} />
          <StatCard label="Consumíveis" value={totais.consumiveis} />
          <StatCard label="Estoque total" value={totais.estoque} />
          <StatCard label="Estoque baixo" value={totais.estoqueBaixo} highlight={totais.estoqueBaixo > 0} />
        </section>

        <section className="flex flex-col md:flex-row gap-3 md:items-center">
          <div className="flex items-center gap-2 bg-[#D9D9D9] rounded-full p-2 px-4 shadow-md flex-1">
            <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Buscar por nome ou descrição..."
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              className="flex-1 p-1 rounded-full bg-transparent focus:outline-none"
            />
          </div>

          <div className="flex gap-2">
            <select
              value={tipo}
              onChange={(e) => setTipo(e.target.value as TipoFiltro)}
              className="bg-[#D9D9D9] rounded-full px-4 py-2 shadow-md focus:outline-none transition-all duration-200"
            >
              <option value="todos">Todos os tipos</option>
              <option value="DAILY_USE">Ferramentas</option>
              <option value="CONSUMABLE">Consumíveis</option>
            </select>
            <select
              value={ordem}
              onChange={(e) => setOrdem(e.target.value as Ordem)}
              className="bg-[#D9D9D9] rounded-full px-4 py-2 shadow-md focus:outline-none transition-all duration-200"
            >
              <option value="nome-asc">Nome A-Z</option>
              <option value="nome-desc">Nome Z-A</option>
              <option value="qtd-desc">Maior estoque</option>
              <option value="qtd-asc">Menor estoque</option>
            </select>
          </div>
        </section>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <MaterialCardSkeleton key={i} />
            ))}
          </div>
        ) : visiveis.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {visiveis.map((t, idx) => (
              <div key={t.id} style={{ animationDelay: `${idx * 40}ms` }} className="animate-slide-up">
                <ToolCard tool={t} />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({ label, value, highlight = false }: { label: string; value: number; highlight?: boolean }) {
  return (
    <div
      className={`rounded-xl p-4 shadow-md border transition-all duration-300 ease-apple hover:-translate-y-0.5 hover:shadow-lg ${
        highlight ? "bg-orange-50 border-orange-300" : "bg-[#D9D9D9] border-primary/20"
      }`}
    >
      <p className="text-xs uppercase tracking-wide text-gray-600">{label}</p>
      <p className={`text-2xl font-bold mt-1 ${highlight ? "text-orange-700" : "text-primary"}`}>
        {value}
      </p>
    </div>
  );
}

function ToolCard({ tool }: { tool: Tool }) {
  const [imgError, setImgError] = useState(false);
  const tipo = tool.type === "CONSUMABLE" ? "Consumível" : "Ferramenta";
  const estoqueBaixo = isLowStock(tool);
  const semEstoque = isOutOfStock(tool);
  const hasImage = tool.imagePath && !imgError;

  return (
    <article className="bg-[#D9D9D9] rounded-xl overflow-hidden shadow-md border-2 border-primary transition-all duration-300 ease-apple hover:-translate-y-1 hover:shadow-2xl group relative">
      {(semEstoque || estoqueBaixo) && (
        <span
          className={`absolute top-2 left-2 z-10 text-[10px] font-bold uppercase tracking-wide px-2 py-1 rounded-full ${
            semEstoque ? "bg-red-600 text-white" : "bg-orange-500 text-white"
          }`}
        >
          {semEstoque ? "Sem estoque" : "Estoque baixo"}
        </span>
      )}
      <div className="aspect-video bg-gray-300 overflow-hidden">
        {hasImage ? (
          <img
            src={toolsApi.imageUrl(tool.id)}
            alt={tool.name}
            className="w-full h-full object-cover transition-transform duration-500 ease-apple group-hover:scale-105"
            onError={() => setImgError(true)}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <svg className="w-14 h-14 text-gray-500" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M11.42 15.17 17.25 21A2.652 2.652 0 0 0 21 17.25l-5.877-5.877M11.42 15.17l2.496-3.03c.317-.384.74-.626 1.208-.766M11.42 15.17l-4.655 5.653a2.548 2.548 0 1 1-3.586-3.586l6.837-5.63" />
            </svg>
          </div>
        )}
      </div>
      <div className="p-4 space-y-2">
        <div className="flex items-start justify-between gap-2">
          <h3 className="text-lg font-bold text-primary tracking-tight leading-tight">{tool.name}</h3>
          <span className="text-[11px] px-2 py-0.5 rounded-full bg-primary text-white font-medium whitespace-nowrap">
            {tipo}
          </span>
        </div>
        <p className="text-gray-700 text-sm line-clamp-2">{tool.description}</p>
        <div className="flex items-center justify-between pt-2">
          <span
            className={`text-sm font-semibold ${
              semEstoque ? "text-red-600" : estoqueBaixo ? "text-orange-600" : "text-green-700"
            }`}
          >
            {semEstoque ? "Sem estoque" : `${tool.quantity} em estoque`}
          </span>
          {tool.levelSecurity && (
            <span
              className={`text-[11px] px-2 py-0.5 rounded-full font-medium ${levelSecurityColor(tool.levelSecurity)}`}
            >
              Nível {levelSecurityLabel(tool.levelSecurity)}
            </span>
          )}
        </div>
        {tool.minQuantity > 0 && (
          <p className="text-[11px] text-gray-500">
            Mínimo de estoque: {tool.minQuantity}
          </p>
        )}
      </div>
    </article>
  );
}

function EmptyState() {
  return (
    <div className="bg-[#D9D9D9] rounded-xl border-2 border-dashed border-primary/40 p-12 text-center animate-fade-in">
      <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
        <svg className="w-8 h-8 text-primary" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-3l-2 3H9l-2-3H4" />
        </svg>
      </div>
      <h3 className="text-lg font-bold text-primary mb-1">Nenhum material encontrado</h3>
      <p className="text-gray-600 text-sm">Ajuste os filtros ou cadastre novos itens.</p>
    </div>
  );
}

export default CatalogoAdmin;
