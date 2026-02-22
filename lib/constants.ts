export const PHAROS = {
  nome: 'Pharos Negócios Imobiliários',
  creci: 'CRECI/SC XXXXX-J',
  telefone: '(47) 99999-9999',
  email: 'contato@pharosnegocios.com.br',
  site: 'https://pharosnegocios.com.br',
  instagram: '@pharosnegocios',
  endereco: 'Balneário Camboriú - SC',
}

export const CIDADES_ATENDIDAS = [
  'Balneário Camboriú',
  'Itajaí',
  'Camboriú',
  'Itapema',
  'Navegantes',
] as const

export const ROLES = {
  MASTER: 'master',
  GERENTE: 'gerente',
  ASSISTENTE: 'assistente',
  CORRETOR: 'corretor',
} as const

export const TREINAMENTO_CATEGORIAS = [
  { slug: 'vendas', nome: 'Vendas', icone: 'Target', cor: '#1B4DDB', corBg: '#E8EEFB' },
  { slug: 'marketing', nome: 'Marketing Digital', icone: 'Smartphone', cor: '#7C3AED', corBg: '#F3E8FF' },
  { slug: 'juridico', nome: 'Jurídico', icone: 'Scale', cor: '#059669', corBg: '#D1FAE5' },
  { slug: 'financeiro', nome: 'Financeiro', icone: 'Coins', cor: '#C9A84C', corBg: '#F5EDD4' },
] as const

export const NAVIGATION = {
  main: [
    { href: '/', label: 'Início', icon: 'Home' },
    { href: '/ferramentas', label: 'Ferramentas', icon: 'Wrench' },
    { href: '/treinamento', label: 'Treinamento', icon: 'GraduationCap' },
    { href: '/links', label: 'Links Úteis', icon: 'ExternalLink' },
  ],
  ferramentas: [
    { href: '/ferramentas/avaliacao', label: 'Avaliação de Imóvel', icon: 'Home', desc: 'Análise comparativa com IA' },
    { href: '/ferramentas/simulador', label: 'Simulador', icon: 'Calculator', desc: 'Investimento imobiliário' },
    { href: '/ferramentas/open-house', label: 'Open House', icon: 'DoorOpen', desc: 'Avaliação de visitantes' },
  ],
  admin: [
    { href: '/admin', label: 'Dashboard Admin', icon: 'LayoutDashboard' },
    { href: '/admin/corretores', label: 'Corretores', icon: 'Users' },
    { href: '/admin/metricas', label: 'Métricas', icon: 'BarChart3' },
    { href: '/admin/treinamento', label: 'Treinamento', icon: 'BookOpen' },
    { href: '/admin/gamificacao', label: 'Gamificação', icon: 'Trophy' },
  ],
} as const
