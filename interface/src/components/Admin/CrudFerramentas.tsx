import { useEffect, useRef, useState } from "react";
import { toolsApi, type Tool, type ToolPayload, type TypeTool } from "../../services/tools";
import { usersApi, type User, type UserPayload } from "../../services/users";
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

  const [novaFerramenta, setNovaFerramenta] = useState<ToolPayload>({
    name: "",
    description: "",
    type: "DAILY_USE",
    quantity: 0,
    levelSecurity: "",
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
  const [successFeedback, setSuccessFeedback] = useState<{ open: boolean; message: string }>({
    open: false,
    message: "",
  });
  const [pendingDelete, setPendingDelete] = useState<PendingDelete | null>(null);

  const refresh = async () => {
    try {
      const [t, u] = await Promise.all([toolsApi.list(), usersApi.list()]);
      setFerramentas(t);
      setUsuarios(u);
    } catch (err) {
      console.error("[crud] erro ao listar:", err);
      toast("Erro ao carregar dados.", "error");
    }
  };

  useEffect(() => {
    refresh();
  }, []);

  const handleSelectImage = (file: File | null) => {
    if (imagemPreview) URL.revokeObjectURL(imagemPreview);
    setImagemFile(file);
    setImagemPreview(file ? URL.createObjectURL(file) : null);
  };

  const resetFerramentaForm = () => {
    setNovaFerramenta({ name: "", description: "", type: "DAILY_USE", quantity: 0, levelSecurity: "" });
    handleSelectImage(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleCriar = async () => {
    if (submitting) return;
    setSubmitting(true);
    try {
      if (modo === "ferramenta") {
        if (!novaFerramenta.name || !novaFerramenta.description) {
          toast("Preencha nome e descrição.", "info");
          return;
        }
        if (novaFerramenta.quantity < 0) {
          toast("Quantidade não pode ser negativa.", "info");
          return;
        }
        const created = await toolsApi.create(novaFerramenta);
        if (imagemFile) {
          try {
            await toolsApi.uploadImage(created.id, imagemFile);
          } catch (err) {
            console.error("[crud] erro upload imagem:", err);
            toast("Ferramenta criada, mas a imagem não pôde ser enviada.", "info");
            resetFerramentaForm();
            await refresh();
            return;
          }
        }
        resetFerramentaForm();
        setSuccessFeedback({ open: true, message: "Ferramenta criada com sucesso!" });
      } else {
        if (!novoUsuario.name || !novoUsuario.sector || !novoUsuario.password) {
          toast("Preencha todos os campos.", "info");
          return;
        }
        if (novoUsuario.password.length < 8) {
          toast("Senha deve ter no mínimo 8 caracteres.", "info");
          return;
        }
        await usersApi.create(novoUsuario);
        setNovoUsuario({ name: "", sector: "", role: "ROLE_USER", password: "" });
        setSuccessFeedback({ open: true, message: "Usuário criado com sucesso!" });
      }
      await refresh();
    } catch (err: any) {
      console.error("[crud] erro ao criar:", err);
      const msg = err?.response?.data?.message ?? "Erro ao criar item.";
      toast(msg, "error");
    } finally {
      setSubmitting(false);
    }
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
      const msg = err?.response?.data?.message ?? "Erro ao deletar.";
      toast(msg, "error");
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
              <Campo label="Quantidade">
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
              <Campo label="Nível de segurança">
                <input
                  type="text"
                  value={novaFerramenta.levelSecurity}
                  onChange={(e) => setNovaFerramenta({ ...novaFerramenta, levelSecurity: e.target.value })}
                  className="w-full p-3 rounded-lg border border-gray-300 transition-colors focus:outline-none focus:border-primary"
                />
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
                <input
                  type="text"
                  value={novoUsuario.sector}
                  onChange={(e) => setNovoUsuario({ ...novoUsuario, sector: e.target.value })}
                  className="w-full p-3 rounded-lg border border-gray-300 transition-colors focus:outline-none focus:border-primary"
                />
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
          <h3 className="text-lg font-bold text-primary mb-2">Itens cadastrados</h3>
          {modo === "ferramenta" ? (
            <ul className="divide-y divide-highlight">
              {ferramentas.map((f) => (
                <li
                  key={f.id}
                  className="py-2 flex justify-between items-center gap-3 transition-colors hover:bg-black/5 rounded px-2"
                >
                  <div className="flex items-center gap-3">
                    {f.imagePath ? (
                      <img
                        src={toolsApi.imageUrl(f.id)}
                        alt={f.name}
                        className="w-10 h-10 rounded object-cover"
                        onError={(e) => (e.currentTarget.style.display = "none")}
                      />
                    ) : (
                      <div className="w-10 h-10 rounded bg-gray-300 flex items-center justify-center text-xs">
                        🔧
                      </div>
                    )}
                    <span>
                      <span className="font-bold">{f.name}</span> - {f.description} ({tipoLabel(f.type)}) - Qtd: {f.quantity}
                    </span>
                  </div>
                  <button
                    onClick={() => setPendingDelete({ kind: "tool", id: f.id, name: f.name })}
                    className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700 transition-all duration-200 active:scale-95 text-sm"
                  >
                    Deletar
                  </button>
                </li>
              ))}
              {ferramentas.length === 0 && <li className="py-2 text-gray-600">Nenhuma ferramenta.</li>}
            </ul>
          ) : (
            <ul className="divide-y divide-highlight">
              {usuarios.map((u) => (
                <li
                  key={u.id}
                  className="py-2 flex justify-between items-center transition-colors hover:bg-black/5 rounded px-2"
                >
                  <span>
                    <span className="font-bold">{u.name}</span> - {u.sector} -{" "}
                    {u.role === "ROLE_ADMIN" ? "Admin" : "Usuário"} - EmployeeID: {u.employeeId}
                  </span>
                  <button
                    onClick={() => setPendingDelete({ kind: "user", id: u.employeeId, name: u.name })}
                    className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700 transition-all duration-200 active:scale-95 text-sm"
                  >
                    Deletar
                  </button>
                </li>
              ))}
              {usuarios.length === 0 && <li className="py-2 text-gray-600">Nenhum usuário.</li>}
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
