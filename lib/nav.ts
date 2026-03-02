export type NavItem = {
  label: string;
  href: string;
};

export type NavSection = {
  title: string;
  items: NavItem[];
};

export const navSections: NavSection[] = [
  {
    title: "Geral",
    items: [
      { label: "Dashboard", href: "/dashboard" },
      { label: "Progresso", href: "/progress" },
      { label: "Calendário", href: "/calendar" },
    ],
  },
  {
    title: "Cadastros e Acesso",
    items: [
      { label: "Clientes", href: "/cadastros/customers" },
      { label: "Fornecedores", href: "/cadastros/suppliers" },
      { label: "Produtos/Itens", href: "/cadastros/products" },
      { label: "Bancos", href: "/cadastros/banks" },
      { label: "Usuários", href: "/iam/users" },
      { label: "Perfis", href: "/iam/roles" },
    ],
  },
  {
    title: "Operações",
    items: [
      { label: "Projetos", href: "/projects" },
      { label: "Orçamentos", href: "/projects/budget" },
      { label: "Contratos", href: "/contracts" },
      { label: "Solicitações", href: "/purchases/requests" },
      { label: "Pedidos", href: "/purchases/orders" },
      { label: "Ordens de Serviço", href: "/works/orders" },
    ],
  },
  {
    title: "Financeiro e Precificação",
    items: [
      { label: "Contas a Pagar", href: "/finance/payables" },
      { label: "Contas a Receber", href: "/finance/receivables" },
      { label: "Caixa/Bancos", href: "/finance/cash" },
      { label: "Relatórios", href: "/finance/reports" },
      { label: "Precificação e Custos", href: "/pricing" },
      { label: "Simulador de Preço", href: "/pricing/simulator" },
    ],
  },
  {
    title: "Pós-venda",
    items: [
      { label: "Tickets", href: "/after-sales/tickets" },
      { label: "Garantias", href: "/after-sales/warranties" },
    ],
  },
];
