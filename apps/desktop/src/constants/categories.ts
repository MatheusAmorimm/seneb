export type CategoryType = 'income' | 'expense';

export interface CategoryDefinition {
  name: string;
  type: CategoryType;
  subcategories: string[];
}

export const CATEGORIES: CategoryDefinition[] = [
  // --- RECEITAS ---
  {
    name: "Receitas",
    type: "income",
    subcategories: [
      "Salário",
      "Pró-labore",
      "Horas extras",
      "Comissões",
      "Rendimentos de investimentos",
      "Aluguel recebido",
      "Freelances / serviços",
      "Benefícios governamentais",
      "Restituição de imposto",
      "Outros rendimentos",
    ],
  },

  // --- DESPESAS ---
  {
    name: "Moradia",
    type: "expense",
    subcategories: [
      "Aluguel / financiamento",
      "Condomínio",
      "Energia elétrica",
      "Água / esgoto",
      "Gás",
      "Internet",
      "TV por assinatura",
      "Manutenção da casa",
      "IPTU",
      "Seguro residencial",
    ],
  },
  {
    name: "Alimentação",
    type: "expense",
    subcategories: [
      "Supermercado",
      "Padaria",
      "Açougue",
      "Hortifruti",
      "Restaurantes",
      "Delivery",
      "Lanches",
      "Cafés",
    ],
  },
  {
    name: "Transporte",
    type: "expense",
    subcategories: [
      "Combustível",
      "Manutenção do veículo",
      "Seguro do veículo",
      "IPVA",
      "Estacionamento",
      "Pedágios",
      "Transporte público",
      "Aplicativos (Uber, 99)",
    ],
  },
  {
    name: "Saúde",
    type: "expense",
    subcategories: [
      "Plano de saúde",
      "Consultas médicas",
      "Exames",
      "Medicamentos",
      "Odontologia",
      "Academia",
      "Terapias",
    ],
  },
  {
    name: "Educação",
    type: "expense",
    subcategories: [
      "Mensalidades escolares",
      "Faculdade",
      "Cursos",
      "Material escolar",
      "Livros",
      "Idiomas",
    ],
  },
  {
    name: "Despesas Financeiras",
    type: "expense",
    subcategories: [
      "Juros",
      "Tarifas bancárias",
      "Anuidade de cartão",
      "IOF",
      "Multas",
      "Parcelamentos",
    ],
  },
  {
    name: "Lazer e Estilo de Vida",
    type: "expense",
    subcategories: [
      "Cinema",
      "Viagens",
      "Passeios",
      "Streaming",
      "Jogos",
      "Shows / eventos",
      "Hobbies",
    ],
  },
  {
    name: "Compras Pessoais",
    type: "expense",
    subcategories: [
      "Roupas",
      "Calçados",
      "Acessórios",
      "Cosméticos",
      "Eletrônicos",
    ],
  },
  {
    name: "Família e Dependentes",
    type: "expense",
    subcategories: [
      "Mesada",
      "Babá",
      "Creche",
      "Atividades extracurriculares",
      "Cuidados com idosos",
    ],
  },
  {
    name: "Investimentos",
    type: "expense",
    subcategories: [
      "Poupança",
      "CDB",
      "Tesouro Direto",
      "Ações",
      "Fundos",
      "Previdência privada",
      "Criptomoedas",
    ],
  },
  {
    name: "Impostos",
    type: "expense",
    subcategories: [
      "Imposto de renda",
      "IPTU",
      "IPVA",
      "Taxas municipais",
    ],
  },
  {
    name: "Reserva / Planejamento",
    type: "expense",
    subcategories: [
      "Reserva de emergência",
      "Fundo de viagem",
      "Fundo para carro",
      "Fundo para casa",
      "Fundo educacional",
    ],
  },
];

export function getCategoriesByType(type: CategoryType): CategoryDefinition[] {
  return CATEGORIES.filter((c) => c.type === type);
}

export function getSubcategories(categoryName: string): string[] {
  const cat = CATEGORIES.find((c) => c.name === categoryName);
  return cat?.subcategories ?? [];
}
