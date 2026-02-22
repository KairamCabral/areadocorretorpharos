// ============================================================
// Profile & Auth
// ============================================================
export type UserRole = 'master' | 'gerente' | 'assistente' | 'corretor'

export interface Profile {
  id: string
  nome: string
  telefone: string
  email: string | null
  creci: string | null
  cnpj: string | null
  foto_url: string | null
  role: UserRole
  ativo: boolean
  created_at: string
}

// ============================================================
// Avaliação
// ============================================================
export interface Avaliacao {
  id: string
  corretor_id: string
  cidade: string
  bairro: string
  endereco: string | null
  tipo: string
  m2_privativo: number
  m2_total: number | null
  quartos: number | null
  suites: number | null
  banheiros: number | null
  vagas: number | null
  mobilia: string | null
  infra_lazer: string | null
  idade_predio: number | null
  posicao_mar: string | null
  andar: string | null
  proprietario_nome: string | null
  proprietario_telefone: string | null
  proprietario_email: string | null
  valor_m2_medio: number | null
  valor_comercial: number | null
  valor_avaliado: number | null
  valor_maximo: number | null
  fator_ajuste: number
  token_publico: string
  status: 'rascunho' | 'concluida' | 'enviada'
  created_at: string
  updated_at: string
}

export interface AvaliacaoComparavel {
  id: string
  avaliacao_id: string
  codigo: string | null
  empreendimento: string | null
  valor_total: number | null
  m2_privativo: number | null
  valor_m2: number | null
  quartos: number | null
  suites: number | null
  banheiros: number | null
  vagas: number | null
  infra: string | null
  mobilia: string | null
  andar_posicao: string | null
  condicao: string | null
  data_atualizacao: string | null
  fonte_url: string | null
  peso: number
  origem: 'ia' | 'manual'
  ativo: boolean
  ordem: number | null
  created_at: string
}

// ============================================================
// Simulação
// ============================================================
export interface Simulacao {
  id: string
  corretor_id: string
  empreendimento_nome: string
  construtora: string | null
  cidade: string
  bairro: string | null
  valor_lancamento: number
  valor_atual: number | null
  valor_entrega_estimado: number | null
  data_lancamento: string | null
  data_entrega_estimada: string | null
  entrada: number
  parcelas_mensais: number
  valor_parcela_mensal: number
  parcelas_semestrais: number
  valor_parcela_semestral: number
  parcelas_anuais: number
  valor_parcela_anual: number
  saldo_chaves: number
  tipo_correcao: string
  taxa_correcao_anual: number | null
  pos_chaves_indice: string
  pos_chaves_juros: number
  itbi_percentual: number
  registro_cartorio: number
  comissao_compra: number
  comissao_venda_percentual: number
  ir_ganho_capital: boolean
  valorizacao_anual_estimada: number | null
  fonte_valorizacao: string | null
  taxa_selic: number | null
  taxa_cdb: number | null
  taxa_lci: number | null
  investidor_nome: string | null
  investidor_telefone: string | null
  investidor_email: string | null
  token_publico: string
  status: string
  created_at: string
  updated_at: string
}

// ============================================================
// Open House
// ============================================================
export interface OpenHouse {
  id: string
  criado_por: string
  empreendimento: string
  endereco: string
  cidade: string
  bairro: string | null
  unidade: string | null
  proprietario_nome: string | null
  proprietario_telefone: string | null
  data_evento: string
  horario_inicio: string | null
  horario_fim: string | null
  observacoes: string | null
  fotos: { url: string; caption?: string }[]
  token_avaliacao: string
  token_resultado: string
  status: 'agendado' | 'em_andamento' | 'finalizado'
  created_at: string
}

export interface OpenHouseAvaliacao {
  id: string
  open_house_id: string
  nome_corretor: string
  imobiliaria: string
  telefone: string | null
  creci: string | null
  nota_tamanho: number
  nota_disposicao: number
  nota_acabamento: number
  nota_conservacao: number
  nota_areas_comuns: number
  nota_localizacao: number
  nota_preco: number
  compraria: 'sim' | 'nao' | 'talvez'
  mais_gostou: string | null
  menos_gostou: string | null
  nota_media: number
  created_at: string
}

// ============================================================
// Treinamento
// ============================================================
export interface TreinamentoCategoria {
  id: string
  nome: string
  descricao: string | null
  icone: string | null
  cor: string | null
  cor_bg: string | null
  imagem_capa: string | null
  ordem: number
  ativo: boolean
}

export interface TreinamentoAula {
  id: string
  categoria_id: string
  titulo: string
  descricao: string | null
  conteudo_tipo: 'video' | 'texto' | 'pdf' | 'quiz'
  conteudo_url: string | null
  conteudo_texto: string | null
  thumbnail_url: string | null
  duracao_minutos: number | null
  pontos: number
  ordem: number
  ativo: boolean
  created_at: string
}

export interface TreinamentoQuiz {
  id: string
  aula_id: string
  pergunta: string
  alternativas: string[]
  resposta_correta: number
  explicacao: string | null
  pontos: number
  ordem: number
}

export interface TreinamentoProgresso {
  id: string
  corretor_id: string
  aula_id: string
  concluida: boolean
  nota_quiz: number | null
  pontos_ganhos: number
  concluida_em: string | null
  created_at: string
}

// ============================================================
// Gamificação
// ============================================================
export interface Badge {
  id: string
  nome: string
  descricao: string | null
  icone_url: string | null
  criterio: string | null
  pontos_bonus: number
}

export interface Pontuacao {
  id: string
  corretor_id: string
  tipo: string
  referencia_id: string | null
  pontos: number
  descricao: string | null
  created_at: string
}

// ============================================================
// Links & Config
// ============================================================
export interface LinkUtil {
  id: string
  titulo: string
  url: string
  icone: string | null
  categoria: string | null
  descricao: string | null
  ordem: number
  ativo: boolean
}
