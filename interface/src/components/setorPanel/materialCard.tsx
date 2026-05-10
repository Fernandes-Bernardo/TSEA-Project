interface Material {
  id: number;
  nome: string;
  quantidade: number;
  tipo: string;
}

interface MaterialCardProps {
  material: Material;
  mensagemSucesso: string | null;
  botaoAtivo: number | null;
  onRetirar: (id: number) => void;
  onDevolver: (id: number) => void;
}

function MaterialCard({ material, mensagemSucesso, botaoAtivo, onRetirar, onDevolver }: MaterialCardProps) {
  return (
    <div className="bg-[#D9D9D9] rounded-lg p-4 shadow-md border-2 border-primary flex items-center gap-4 w-full">
      {/* Imagem da ferramenta - 151x119 */}
      <div className="w-[151px] h-[119px] bg-gray-300 rounded-md flex-shrink-0 flex items-center justify-center">
        <span className="text-gray-500 text-sm text-center">🔧<br/>{material.nome}</span>
      </div>
      
      {/* Informações */}
      <div className="flex-1">
        <h3 className="text-lg font-bold text-primary">{material.nome}</h3>
        <p className="text-gray-700">Quantidade disp.: {material.quantidade}</p>
        <p className="text-gray-700">Tipo: {material.tipo}</p>
        
        {mensagemSucesso && (
          <p className="text-green-700 text-sm mt-1 font-semibold">
            ✓ {mensagemSucesso}
          </p>
        )}
      </div>
      
      {/* Botões - lado a lado */}
      <div className="flex gap-3 flex-shrink-0">
        <button 
          onClick={() => onRetirar(material.id)}
          className={`px-6 py-2 rounded transition font-medium w-28 ${
            botaoAtivo === material.id 
              ? "bg-[#A06630] text-white" 
              : "bg-highlight text-white hover:bg-[#A06630]"
          }`}
          disabled={material.quantidade === 0}
        >
          Retirar
        </button>
        <button 
          onClick={() => onDevolver(material.id)}
          className={`px-6 py-2 rounded transition font-medium w-28 ${
            botaoAtivo === material.id + 100 
              ? "bg-[#1A3A3F] text-white" 
              : "bg-primary text-white hover:bg-[#1A3A3F]"
          }`}
        >
          Devolver
        </button>
      </div>
    </div>
  );
}

export default MaterialCard;