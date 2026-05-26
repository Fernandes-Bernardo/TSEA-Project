import { useEffect, useMemo, useRef, useState } from "react";
import {
  isLowStock,
  isOutOfStock,
  levelSecurityLabel,
  toolsApi,
  type Tool,
  type ToolPayload,
  type TypeTool,
} from "../../services/tools";
import { roleLabel, usersApi, type User, type UserPayload } from "../../services/users";
import { listSectors } from "../../services/sectors";
import SuccessModal from "../ui/SuccessModal";
import ConfirmModal from "../ui/ConfirmModal";
import { useToast } from "../ui/Toast";

const tipoLabel = (t: TypeTool) => (t === "CONSUMABLE" ? "Consumível" : "Ferramenta");

interface PendingDelete {
  kind: "tool" | "user";
  id: string | number;
  name: string;
}

function CrudFerramentas() {
  const { toast } = useToast();
  const [modo, setModo] = useState<"ferramenta" | "usuario">("ferramenta");
  const [sectors, setSectors] = useState<string[]>([]);

  const [novaFerramenta, setNovaFerramenta] = useState<ToolPayload>({
    name: "",
    description: "",
    type: "DAILY_USE",
    quantity: 0,
    minQuantity: 0,
    levelSecurity: "low",
  });
  const [imagemFile, setImagemFile] = useState<File | null>(null);
  const [imagemPreview, setImagemPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [submitting, setSubmitting] = useState(false);

  const [novoUsuario, setNovoUsuario] = useState<UserPayload>({
    name: "",
    sector: "",
    role: "ROLE_USER",
    password: "",
  });

  const [ferramentas, setFerramentas] = useState<Tool[]>([]);
  const [usuarios, setUsuarios] = useState<User[]>([]);
  const [buscaFerramenta, setBuscaFerramenta] = useState("");
  const [buscaUsuario, setBuscaUsuario] = useState("");
  const [filtroSetor, setFiltroSetor] = useState<string>("todos");

  const [successFeedback, setSuccessFeedback] = useState<{ open: boolean; message: string }>({
    open: false,
    message: "",
  });
  const [pendingDelete, setPendingDelete] = useState<PendingDelete | null>(null);

  useEffect(() => {
    listSectors()
      .then((s) => {
        setSectors(s);
        // valor inicial do dropdown de criar usuário = primeiro setor
        setNovoUsuario((prev) => ({ ...prev, sector: prev.sector || s[0] || "" }));
      })
      .catch((err) => console.error("[crud] erro setores:", err));
  }, []);

  /**
   * Recarrega tools/users de forma silenciosa — erros aqui só vão para o console,
   * para nunca aparecer um toast/modal de erro após uma operação de sucesso.
   */
  const refresh = async () => {
    try {
      const [t, u] = await Promise.allSettled([toolsApi.list(), usersApi.list()]);
      if (t.status === "fulfilled") setFerramentas(t.value);
      else console.error("[crud] refresh tools:", t.reason);
      if (u.status === "fulfilled") setUsuarios(u.value);
      else console.error("[crud] refresh users:", u.reason);
    } catch (err) {
      console.error("[crud] refresh inesperado:", err);
    }
  };

  useEffect(() => {
    refresh();
  }, []);

  const ferramentasFiltradas = useMemo(() => {
    if (buscaFerramenta.trim() === "") return ferramentas;
    const q = buscaFerramenta.trim().toLowerCase();
    return ferramentas.filter(
      (f) =>
        f.name.toLowerCase().includes(q) ||
        f.description.toLowerCase().includes(q) ||
        tipoLabel(f.type).toLowerCase().includes(q)
    );
  }, [ferramentas, buscaFerramenta]);

  const usuariosFiltrados = useMemo(() => {
    let arr = usuarios;
    if (filtroSetor !== "todos") {
      arr = arr.filter((u) => u.sector === filtroSetor);
    }
    if (buscaUsuario.trim() !== "") {
      const q = buscaUsuario.trim().toLowerCase();
      arr = arr.filter(
        (u) =>
          u.name.toLowerCase().includes(q) ||
          u.sector.toLowerCase().includes(q) ||
          String(u.employeeId).includes(q) ||
          roleLabel(u.role).toLowerCase().includes(q)
      );
    }
    return arr;
  }, [usuarios, buscaUsuario, filtroSetor]);

  const handleSelectImage = (file: File | null) => {
    if (imagemPreview) URL.revokeObjectURL(imagemPreview);
    setImagemFile(file);
    setImagemPreview(file ? URL.createObjectURL(file) : null);
  };

  const resetFerramentaForm = () => {
    setNovaFerramenta({
      name: "",
      description: "",
      type: "DAILY_USE",
      quantity: 0,
      minQuantity: 0,
      levelSecurity: "low",
    });
    handleSelectImage(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const criarFerramenta = async () => {
    if (!novaFerramenta.name || !novaFerramenta.description) {
      toast("Preencha nome e descrição.", "info");
      return;
    }
    if (novaFerramenta.quantity < 0 || novaFerramenta.minQuantity < 0) {
      toast("Quantidades não podem ser negativas.", "info");
      return;
    }
    setSubmitting(true);
    try {
      const created = await toolsApi.create(novaFerramenta);
      if (imagemFile) {
        try {
          await toolsApi.uploadImage(created.id, imagemFile);
        } catch (err) {
          console.error("[crud] erro upload imagem:", err);
          toast("Ferramenta criada, mas a imagem não pôde ser enviada.", "info");
          resetFerramentaForm();
          refresh();
          return;
        }
      }
      resetFerramentaForm();
      setSuccessFeedback({ open: true, message: "Ferramenta criada com sucesso!" });
      refresh();
    } catch (err: any) {
      console.error("[crud] erro criar tool:", err);
      toast(err?.response?.data?.message ?? "Erro ao criar ferramenta.", "error");
    } finally {
      setSubmitting(false);
    }
  };

  const criarUsuario = async () => {
    if (!novoUsuario.name || !novoUsuario.sector || !novoUsuario.password) {
      toast("Preencha todos os campos.", "info");
      return;
    }
    if (novoUsuario.password.length < 8) {
      toast("Senha deve ter no mínimo 8 caracteres.", "info");
      return;
    }
    setSubmitting(true);
    try {
      await usersApi.create(novoUsuario);
      setNovoUsuario({ name: "", sector: sectors[0] ?? "", role: "ROLE_USER", password: "" });
      setSuccessFeedback({ open: true, message: "Usuário criado com sucesso!" });
      refresh();
    } catch (err: any) {
      console.error("[crud] erro criar usuário:", err);
      toast(err?.response?.data?.message ?? "Erro ao criar usuário.", "error");
    } finally {
      setSubmitting(false);
    }
  };

  const handleCriar = () => {
    if (submitting) return;
    if (modo === "ferramenta") criarFerramenta();
    else criarUsuario();
  };

  const confirmDelete = async () => {
    if (!pendingDelete) return;
    const { kind, id } = pendingDelete;
    setPendingDelete(null);
    try {
      if (kind === "tool") {
        await toolsApi.remove(String(id));
        toast("Ferramenta deletada!", "success");
      } else {
        await usersApi.remove(Number(id));
        toast("Usuário deletado!", "success");
      }
      refresh();
    } catch (err: any) {
      console.error("[crud] erro deletar:", err);
      toast(err?.response?.data?.message ?? "Erro ao deletar.", "error");
    }
  };

  return (
    <div className="min-h-screen p-6 animate-fade-in" style={{ backgroundColor: "#BEBEBE" }}>
      <div className="flex flex-col gap-6 w-full max-w-6xl mx-auto">
        <div className="flex items-center gap-4">
          <div className="bg-[#D9D9D9] rounded-full p-1 shadow-md flex">
            <button
              onClick={() => setModo("ferramenta")}
              className={`px-6 py-2 rounded-full transition-all duration-200 ease-apple font-medium ${
                modo === "ferramenta" ? "bg-primary text-white shadow" : "text-gray-700 hover:bg-gray-300"
              }`}
            >
              Ferramenta
            </button>
            <button
              onClick={() => setModo("usuario")}
              className={`px-6 py-2 rounded-full transition-all duration-200 ease-apple font-medium ${
                modo === "usuario" ? "bg-primary text-white shadow" : "text-gray-700 hover:bg-gray-300"
              }`}
            >
              Usuário
            </button>
          </div>
        </div>

        <div className="bg-[#D9D9D9] rounded-lg border-2 border-primary p-6 shadow-md animate-slide-up">
          <h2 className="text-xl font-bold text-primary mb-4 tracking-tight">
            {modo === "ferramenta" ? "Nova Ferramenta" : "Novo Usuário"}
          </h2>

          {modo === "ferramenta" ? (
            <div className="space-y-4">
              <div className="flex gap-4 items-start flex-col md:flex-row">
                <div className="flex-1 space-y-4 w-full">
                  <Campo label="Nome">
                    <input
                      type="text"
                      value={novaFerramenta.name}
                      onChange={(e) => setNovaFerramenta({ ...novaFerramenta, name: e.target.value })}
                      className="w-full p-3 rounded-lg border border-gray-300 transition-colors focus:outline-none focus:border-primary"
                    />
                  </Campo>
                  <Campo label="Descrição">
                    <input
                      type="text"
                      value={novaFerramenta.description}
                      onChange={(e) => setNovaFerramenta({ ...novaFerramenta, description: e.target.value })}
                      className="w-full p-3 rounded-lg border border-gray-300 transition-colors focus:outline-none focus:border-primary"
                    />
                  </Campo>
                </div>

                <div className="w-40">
                  <label className="block text-gray-700 font-bold mb-1">Imagem</label>
                  <div className="w-40 h-40 rounded-lg border-2 border-dashed border-primary/50 bg-white flex items-center justify-center overflow-hidden transition-all duration-300 hover:border-primary">
                    {imagemPreview ? (
                      <img src={imagemPreview} alt="preview" className="w-full h-full object-cover animate-fade-in" />
                    ) : (
                      <span className="text-xs text-gray-500 text-center px-2">
                        PNG, JPG ou WEBP
                        <br />
                        até 5MB
                      </span>
                    )}
                  </div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/png,image/jpeg,image/webp"
                    onChange={(e) => handleSelectImage(e.target.files?.[0] ?? null)}
                    className="mt-2 text-xs w-full"
                  />
                </div>
              </div>

              <Campo label="Tipo">
                <select
                  value={novaFerramenta.type}
                  onChange={(e) => setNovaFerramenta({ ...novaFerramenta, type: e.target.value as TypeTool })}
                  className="w-full p-3 rounded-lg border border-gray-300 transition-colors focus:outline-none focus:border-primary"
                >
                  <option value="DAILY_USE">Ferramenta</option>
                  <option value="CONSUMABLE">Consumível</option>
                </select>
              </Campo>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Campo label="Quantidade em estoque">
                  <input
                    type="number"
                    min={0}
                    value={novaFerramenta.quantity}
                    onChange={(e) =>
                      setNovaFerramenta({ ...novaFerramenta, quantity: parseInt(e.target.value) || 0 })
                    }
                    className="w-full p-3 rounded-lg border border-gray-300 transition-colors focus:outline-none focus:border-primary"
                  />
                </Campo>
                <Campo label="Estoque mínimo (alerta)">
                  <input
                    type="number"
                    min={0}
                    value={novaFerramenta.minQuantity}
                    onChange={(e) =>
                      setNovaFerramenta({
                        ...novaFerramenta,
                        minQuantity: parseInt(e.target.value) || 0,
                      })
                    }
                    className="w-full p-3 rounded-lg border border-gray-300 transition-colors focus:outline-none focus:border-primary"
                  />
                </Campo>
              </div>

              <Campo label="Nível de segurança">
                <select
                  value={novaFerramenta.levelSecurity}
                  onChange={(e) =>
                    setNovaFerramenta({ ...novaFerramenta, levelSecurity: e.target.value })
                  }
                  className="w-full p-3 rounded-lg border border-gray-300 transition-colors focus:outline-none focus:border-primary"
                >
                  <option value="low">Baixo</option>
                  <option value="medium">Médio</option>
                  <option value="high">Alto</option>
                </select>
              </Campo>
            </div>
          ) : (
            <div className="space-y-4">
              <Campo label="Nome">
                <input
                  type="text"
                  value={novoUsuario.name}
                  onChange={(e) => setNovoUsuario({ ...novoUsuario, name: e.target.value })}
                  className="w-full p-3 rounded-lg border border-gray-300 transition-colors focus:outline-none focus:border-primary"
                />
              </Campo>
              <Campo label="Setor">
                <select
                  value={novoUsuario.sector}
                  onChange={(e) => setNovoUsuario({ ...novoUsuario, sector: e.target.value })}
                  className="w-full p-3 rounded-lg border border-gray-300 transition-colors focus:outline-none focus:border-primary"
                >
                  {sectors.length === 0 && <option value="">Carregando setores...</option>}
                  {sectors.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </Campo>
              <Campo label="Ocupação">
                <select
                  value={novoUsuario.role}
                  onChange={(e) =>
                    setNovoUsuario({ ...novoUsuario, role: e.target.value as UserPayload["role"] })
                  }
                  className="w-full p-3 rounded-lg border border-gray-300 transition-colors focus:outline-none focus:border-primary"
                >
                  <option value="ROLE_USER">Usuário</option>
                  <option value="ROLE_ALMOXARIFE">Almoxarife</option>
                  <option value="ROLE_ADMIN">Administrador</option>
                </select>
              </Campo>
              <Campo label="Senha (mín. 8)">
                <input
                  type="password"
                  value={novoUsuario.password}
                  onChange={(e) => setNovoUsuario({ ...novoUsuario, password: e.target.value })}
                  className="w-full p-3 rounded-lg border border-gray-300 transition-colors focus:outline-none focus:border-primary"
                />
              </Campo>
            </div>
          )}

          <div className="flex gap-4 mt-6">
            <button
              onClick={handleCriar}
              disabled={submitting}
              className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-all duration-200 ease-apple active:scale-95 font-medium shadow-md disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {submitting ? "Salvando..." : "Criar"}
            </button>
          </div>
        </div>

        <div className="bg-[#D9D9D9] rounded-lg border-2 border-primary p-4 shadow-md animate-slide-up">
          <div className="flex items-center justify-between gap-3 mb-3 flex-wrap">
            <h3 className="text-lg font-bold text-primary">
              {modo === "ferramenta" ? "Ferramentas cadastradas" : "Usuários cadastrados"}
            </h3>
            <span className="text-sm text-gray-600">
              {modo === "ferramenta"
                ? `${ferramentasFiltradas.length} de ${ferramentas.length}`
                : `${usuariosFiltrados.length} de ${usuarios.length}`}
            </span>
          </div>

          <div className="flex flex-col md:flex-row gap-2 mb-3">
            <div className="flex items-center gap-2 bg-white rounded-full p-2 px-4 shadow-sm flex-1 focus-within:shadow-md transition-shadow">
              <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              {modo === "ferramenta" ? (
                <input
                  type="text"
                  placeholder="Buscar ferramenta..."
                  value={buscaFerramenta}
                  onChange={(e) => setBuscaFerramenta(e.target.value)}
                  className="flex-1 p-1 bg-transparent focus:outline-none text-sm"
                />
              ) : (
                <input
                  type="text"
                  placeholder="Buscar usuário por nome, crachá, ocupação..."
                  value={buscaUsuario}
                  onChange={(e) => setBuscaUsuario(e.target.value)}
                  className="flex-1 p-1 bg-transparent focus:outline-none text-sm"
                />
              )}
            </div>

            {modo === "usuario" && (
              <select
                value={filtroSetor}
                onChange={(e) => setFiltroSetor(e.target.value)}
                className="bg-white rounded-full px-4 py-2 shadow-sm focus:outline-none text-sm"
              >
                <option value="todos">Todos os setores</option>
                {sectors.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            )}
          </div>

          {modo === "ferramenta" ? (
            <ul className="divide-y divide-highlight">
              {ferramentasFiltradas.map((f) => {
                const baixo = isLowStock(f);
                const fora = isOutOfStock(f);
                return (
                  <li
                    key={f.id}
                    className="py-2 flex justify-between items-center gap-3 transition-colors hover:bg-black/5 rounded px-2"
                  >
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      {f.imagePath ? (
                        <img
                          src={toolsApi.imageUrl(f.id)}
                          alt={f.name}
                          className="w-10 h-10 rounded object-cover flex-shrink-0"
                          onError={(e) => (e.currentTarget.style.display = "none")}
                        />
                      ) : (
                        <div className="w-10 h-10 rounded bg-gray-300 flex items-center justify-center flex-shrink-0">
                          <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M11.42 15.17 17.25 21A2.652 2.652 0 0 0 21 17.25l-5.877-5.877" />
                          </svg>
                        </div>
                      )}
                      <div className="min-w-0 flex-1">
                        <p className="truncate">
                          <span className="font-bold">{f.name}</span> — {f.description}
                        </p>
                        <p className="text-xs text-gray-600 flex items-center gap-2 flex-wrap">
                          <span>{tipoLabel(f.type)}</span>
                          <span>·</span>
                          <span className={fora ? "text-red-600 font-semibold" : baixo ? "text-orange-600 font-semibold" : ""}>
                            Qtd: {f.quantity}
                            {f.minQuantity > 0 ? ` (mín. ${f.minQuantity})` : ""}
                          </span>
                          <span>·</span>
                          <span>Nível {levelSecurityLabel(f.levelSecurity)}</span>
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => setPendingDelete({ kind: "tool", id: f.id, name: f.name })}
                      className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700 transition-all duration-200 active:scale-95 text-sm flex-shrink-0"
                    >
                      Deletar
                    </button>
                  </li>
                );
              })}
              {ferramentasFiltradas.length === 0 && (
                <li className="py-2 text-gray-600">
                  {buscaFerramenta ? "Nenhuma ferramenta com esse termo." : "Nenhuma ferramenta."}
                </li>
              )}
            </ul>
          ) : (
            <ul className="divide-y divide-highlight">
              {usuariosFiltrados.map((u) => (
                <li
                  key={u.id}
                  className="py-2 flex justify-between items-center transition-colors hover:bg-black/5 rounded px-2"
                >
                  <span>
                    <span className="font-bold">{u.name}</span> — {u.sector} — {roleLabel(u.role)} —{" "}
                    Crachá: {u.employeeId}
                  </span>
                  <button
                    onClick={() => setPendingDelete({ kind: "user", id: u.employeeId, name: u.name })}
                    className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700 transition-all duration-200 active:scale-95 text-sm"
                  >
                    Deletar
                  </button>
                </li>
              ))}
              {usuariosFiltrados.length === 0 && (
                <li className="py-2 text-gray-600">
                  {buscaUsuario || filtroSetor !== "todos"
                    ? "Nenhum usuário com esses filtros."
                    : "Nenhum usuário."}
                </li>
              )}
            </ul>
          )}
        </div>
      </div>

      <SuccessModal
        isOpen={successFeedback.open}
        message={successFeedback.message}
        onClose={() => setSuccessFeedback((f) => ({ ...f, open: false }))}
      />

      <ConfirmModal
        isOpen={pendingDelete !== null}
        title={`Confirmar exclusão`}
        message={
          pendingDelete
            ? `Tem certeza que deseja excluir "${pendingDelete.name}"? Esta ação não pode ser desfeita.`
            : ""
        }
        confirmLabel="Excluir"
        destructive
        onConfirm={confirmDelete}
        onCancel={() => setPendingDelete(null)}
      />
    </div>
  );
}

function Campo({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-gray-700 font-bold mb-1">{label}</label>
      {children}
    </div>
  );
}

export default CrudFerramentas;
