'use client';
import { BodyContainer } from "@/components/BodyContainer";
import { CardContainer } from "@/components/CardContainer";
import { FormModal } from "@/components/FormModal";
import { Header } from "@/components/Header";
import { Table } from "@/components/Table";
import { ITransaction, TotalCard } from "@/types/transaction";
import { useMemo, useState } from "react";

const transactions: ITransaction[] = [
  { id: "1", title: "Salário", price: 5000, category: "Trabalho", type: "INCOME", data: new Date("2024-06-01") },
  { id: "2", title: "Aluguel", price: 1500, category: "Moradia", type: "OUTCOME", data: new Date("2024-06-05") },
  { id: "3", title: "Supermercado", price: 300, category: "Alimentação", type: "OUTCOME", data: new Date("2024-06-10") },
  { id: "4", title: "Freelance", price: 1200, category: "Trabalho", type: "INCOME", data: new Date("2024-06-15") }
];

export default function Home() {
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [transactionData, setTransactionData] = useState(transactions);
  
  // NOVOS ESTADOS: Controle de edição e exclusão
  const [transactionToEdit, setTransactionToEdit] = useState<ITransaction | null>(null);
  const [transactionIdToDelete, setTransactionIdToDelete] = useState<string | number | null>(null);

  // NOVA FUNÇÃO: Salvar (Serve tanto para Criar quanto para Editar)
  const handleSaveTransaction = (transaction: ITransaction) => {
    if (transactionToEdit) {
      // Se estamos editando, mapeia o array e substitui a transação antiga pela nova
      setTransactionData((prevState) => 
        prevState.map(t => t.id === transaction.id ? transaction : t)
      );
    } else {
      // Se não, é uma nova transação
      setTransactionData((prevState) => [...prevState, transaction]);
    }
    
    // Fecha o modal e limpa o estado de edição
    setIsFormModalOpen(false);
    setTransactionToEdit(null);
  }

  // NOVA FUNÇÃO: Confirmar a exclusão
  const confirmDelete = () => {
    if (transactionIdToDelete) {
      setTransactionData((prevState) => 
        prevState.filter(t => t.id !== transactionIdToDelete)
      );
      setTransactionIdToDelete(null); // Fecha o modal de exclusão
    }
  }

  const calculaTotal = useMemo(() => {
    const totals = transactionData.reduce<TotalCard>((acc, transaction) => {
      if (transaction.type === "INCOME") {
        acc.income += transaction.price;
        acc.total += transaction.price;
      } else {
        acc.outcome += transaction.price;
        acc.total -= transaction.price;
      }
      return acc;
    }, { total: 0, income: 0, outcome: 0 })

    return totals;
  }, [transactionData]);
  
  return (
    <div className="h-full min-h-screen relative">
      <Header handleOpenFormModal={() => {
        setTransactionToEdit(null); // Garante que o modal abra vazio para nova transação
        setIsFormModalOpen(true);
      }}/>
      
      <BodyContainer>
         <CardContainer totalValues={calculaTotal} />
         
         {/* ATUALIZADO: Passando as funções para a Tabela */}
         <Table 
            data={transactionData} 
            onDelete={(id) => setTransactionIdToDelete(id)} 
            onEdit={(transaction) => {
              setTransactionToEdit(transaction);
              setIsFormModalOpen(true);
            }} 
         />
      </BodyContainer>

      {/* ATUALIZADO: FormModal agora recebe transactionToEdit */}
      {isFormModalOpen && (
        <FormModal 
          closeModal={() => {
            setIsFormModalOpen(false);
            setTransactionToEdit(null);
          }} 
          title={transactionToEdit ? "Editar Transação" : "Criar Transação"} 
          addTransaction={handleSaveTransaction}
          transactionToEdit={transactionToEdit} // Precisaremos adicionar essa prop no FormModal
        />
      )}

      {/* NOVO: Modal de Confirmação de Exclusão */}
      {transactionIdToDelete && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-white p-8 rounded-lg w-full max-w-md shadow-xl">
            <h2 className="text-2xl font-bold mb-4 text-gray-800">Excluir Transação</h2>
            <p className="text-gray-600 mb-8">Tem certeza que deseja excluir esta transação? Essa ação não pode ser desfeita.</p>
            <div className="flex justify-end gap-4">
              <button
                onClick={() => setTransactionIdToDelete(null)}
                className="px-6 py-3 bg-gray-200 text-gray-800 font-semibold rounded-lg hover:bg-gray-300 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={confirmDelete}
                className="px-6 py-3 bg-red-500 text-white font-semibold rounded-lg hover:bg-red-600 transition-colors"
              >
                Sim, excluir
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}