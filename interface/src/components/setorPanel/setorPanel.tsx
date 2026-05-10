import { useState } from "react";
import MaterialCard from "./materialCard";

interface Material {
  id: number;
  nome: string;
  quantidade: number;
  tipo: string;
}

const materiaisIniciais: Material[] = [
  { id: 1, nome: "Eletrodo revestido", quantidade: 10, tipo: "consumível" },
  { id: 2, nome: "Broca de metal duro", quantidade: 50, tipo: "ferramenta" },
  { id: 3, nome: "Lâmina de serra", quantidade: 67, tipo: "ferramenta" },
];

function SetorPanel() {
  const [materiais, setMateriais] = useState<Material[]>(materiaisIniciais);
  const [mensagens, setMensagens] = useState<Record<number, string | null>>({});
  const [botaoAtivo, setBotaoAtivo] = useState<number | null>(null);

  function handleRetirar(id: number) {
    setMateriais((prev) =>
      prev.map((mat) =>
        mat.id === id && mat.quantidade > 0
          ? { ...mat, quantidade: mat.quantidade - 1 }
          : mat
      )
    );
    setMensagens((prev) => ({ ...prev, [id]: "Retirado com sucesso!" }));
    setBotaoAtivo(id);
    setTimeout(() => {
      setMensagens((prev) => ({ ...prev, [id]: null }));
      setBotaoAtivo(null);
    }, 3000);
  }

  function handleDevolver(id: number) {
    setMateriais((prev) =>
      prev.map((mat) =>
        mat.id === id
          ? { ...mat, quantidade: mat.quantidade + 1 }
          : mat
      )
    );
    setMensagens((prev) => ({ ...prev, [id]: "Devolvido com sucesso!" }));
    setBotaoAtivo(id + 100);
    setTimeout(() => {
      setMensagens((prev) => ({ ...prev, [id]: null }));
      setBotaoAtivo(null);
    }, 3000);
  }

  return (
    <div className="min-h-screen p-6" style={{ backgroundColor: "#BEBEBE" }}>
      <div className="flex flex-col gap-6 w-full max-w-6xl mx-auto">
        {materiais.map((material) => (
          <MaterialCard
            key={material.id}
            material={material}
            mensagemSucesso={mensagens[material.id]}
            botaoAtivo={botaoAtivo}
            onRetirar={handleRetirar}
            onDevolver={handleDevolver}
          />
        ))}
      </div>
    </div>
  );
}

export default SetorPanel;