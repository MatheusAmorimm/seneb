from datetime import datetime
from typing import List
from backend.schemas import TransactionSchema, TransactionUpdate, ReportSchema
from backend.repositories.transaction_repository import TransactionRepository
from backend.repositories.report_repository import ReportRepository

class TransactionService:
    def __init__(self, transaction_repo: TransactionRepository, report_repo: ReportRepository):
        self.transaction_repo = transaction_repo
        self.report_repo = report_repo

    async def finalize_month_logic(self, user_id: str, report_name: str, reference_month: str) -> str:
        """
        Executa toda a regra de negócio de fechamento de mês.
        Retorna o ID do relatório criado.
        """
        # 1. Validação: Já existe?
        existing = await self.report_repo.get_by_month_and_user(user_id, report_name)
        if existing:
            raise ValueError("Relatório já existe.")

        # 2. Busca lançamentos (Drafts)
        drafts = await self.transaction_repo.get_drafts_by_user(user_id)
        if not drafts:
            raise ValueError("Não há lançamentos para finalizar.")

        # 3. Cálculos
        total_income = sum(t.amount for t in drafts if t.type == 'income')
        total_expense = sum(t.amount for t in drafts if t.type == 'expense')

        # 4. Criação do Relatório
        new_report = ReportSchema(
            user_id=user_id,
            name=report_name,
            reference_month=reference_month,
            total_income=total_income,
            total_expense=total_expense,
            balance=total_income - total_expense,
            created_at=datetime.now()
        )
        saved_report = await self.report_repo.create(new_report)
        
        # --- CORREÇÃO DE TIPAGEM AQUI ---
        if not saved_report.id:
            raise ValueError("Erro crítico: Relatório salvo sem ID.")
            
        report_id_str = str(saved_report.id)
        # --------------------------------

        # 5. Lógica de Parcelas Futuras & Preparação de IDs
        ids_to_finalize = []
        
        for item in drafts:
            # Mesma validação para os itens
            if item.id:
                ids_to_finalize.append(str(item.id))
            
            if item.is_installment and item.current_installment < item.total_installments:
                # Copia dados
                next_data = item.model_dump(exclude={"id", "created_at", "status", "report_id"})
                
                next_data["current_installment"] += 1
                next_data["installment_identifier"] = f"{next_data['current_installment']}/{next_data['total_installments']}"
                next_data["status"] = "draft"
                next_data["user_id"] = user_id
                
                await self.transaction_repo.create(TransactionSchema(**next_data))

        # 6. Finaliza as atuais usando a string garantida
        await self.transaction_repo.finalize_batch(ids_to_finalize, report_id_str)

        return report_id_str