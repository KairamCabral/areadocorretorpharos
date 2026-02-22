export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      avaliacao_comparaveis: {
        Row: {
          andar_posicao: string | null
          ativo: boolean | null
          avaliacao_id: string | null
          banheiros: number | null
          codigo: string | null
          condicao: string | null
          created_at: string | null
          data_atualizacao: string | null
          empreendimento: string | null
          fonte_url: string | null
          id: string
          infra: string | null
          m2_privativo: number | null
          mobilia: string | null
          ordem: number | null
          origem: string | null
          peso: number | null
          quartos: number | null
          suites: number | null
          vagas: number | null
          valor_m2: number | null
          valor_total: number | null
        }
        Insert: {
          andar_posicao?: string | null
          ativo?: boolean | null
          avaliacao_id?: string | null
          banheiros?: number | null
          codigo?: string | null
          condicao?: string | null
          created_at?: string | null
          data_atualizacao?: string | null
          empreendimento?: string | null
          fonte_url?: string | null
          id?: string
          infra?: string | null
          m2_privativo?: number | null
          mobilia?: string | null
          ordem?: number | null
          origem?: string | null
          peso?: number | null
          quartos?: number | null
          suites?: number | null
          vagas?: number | null
          valor_m2?: number | null
          valor_total?: number | null
        }
        Update: {
          andar_posicao?: string | null
          ativo?: boolean | null
          avaliacao_id?: string | null
          banheiros?: number | null
          codigo?: string | null
          condicao?: string | null
          created_at?: string | null
          data_atualizacao?: string | null
          empreendimento?: string | null
          fonte_url?: string | null
          id?: string
          infra?: string | null
          m2_privativo?: number | null
          mobilia?: string | null
          ordem?: number | null
          origem?: string | null
          peso?: number | null
          quartos?: number | null
          suites?: number | null
          vagas?: number | null
          valor_m2?: number | null
          valor_total?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "avaliacao_comparaveis_avaliacao_id_fkey"
            columns: ["avaliacao_id"]
            isOneToOne: false
            referencedRelation: "avaliacoes"
            referencedColumns: ["id"]
          },
        ]
      }
      avaliacoes: {
        Row: {
          andar: string | null
          bairro: string
          banheiros: number | null
          cidade: string
          corretor_id: string | null
          created_at: string | null
          endereco: string | null
          fator_ajuste: number | null
          id: string
          idade_predio: number | null
          infra_lazer: string | null
          m2_privativo: number
          m2_total: number | null
          mobilia: string | null
          posicao_mar: string | null
          proprietario_email: string | null
          proprietario_nome: string | null
          proprietario_telefone: string | null
          quartos: number | null
          status: string | null
          suites: number | null
          tipo: string | null
          token_publico: string | null
          updated_at: string | null
          vagas: number | null
          valor_avaliado: number | null
          valor_comercial: number | null
          valor_m2_medio: number | null
          valor_maximo: number | null
        }
        Insert: {
          andar?: string | null
          bairro: string
          banheiros?: number | null
          cidade: string
          corretor_id?: string | null
          created_at?: string | null
          endereco?: string | null
          fator_ajuste?: number | null
          id?: string
          idade_predio?: number | null
          infra_lazer?: string | null
          m2_privativo: number
          m2_total?: number | null
          mobilia?: string | null
          posicao_mar?: string | null
          proprietario_email?: string | null
          proprietario_nome?: string | null
          proprietario_telefone?: string | null
          quartos?: number | null
          status?: string | null
          suites?: number | null
          tipo?: string | null
          token_publico?: string | null
          updated_at?: string | null
          vagas?: number | null
          valor_avaliado?: number | null
          valor_comercial?: number | null
          valor_m2_medio?: number | null
          valor_maximo?: number | null
        }
        Update: {
          andar?: string | null
          bairro?: string
          banheiros?: number | null
          cidade?: string
          corretor_id?: string | null
          created_at?: string | null
          endereco?: string | null
          fator_ajuste?: number | null
          id?: string
          idade_predio?: number | null
          infra_lazer?: string | null
          m2_privativo?: number
          m2_total?: number | null
          mobilia?: string | null
          posicao_mar?: string | null
          proprietario_email?: string | null
          proprietario_nome?: string | null
          proprietario_telefone?: string | null
          quartos?: number | null
          status?: string | null
          suites?: number | null
          tipo?: string | null
          token_publico?: string | null
          updated_at?: string | null
          vagas?: number | null
          valor_avaliado?: number | null
          valor_comercial?: number | null
          valor_m2_medio?: number | null
          valor_maximo?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "avaliacoes_corretor_id_fkey"
            columns: ["corretor_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      badges: {
        Row: {
          criterio: string | null
          descricao: string | null
          icone_url: string | null
          id: string
          nome: string
          pontos_bonus: number | null
        }
        Insert: {
          criterio?: string | null
          descricao?: string | null
          icone_url?: string | null
          id?: string
          nome: string
          pontos_bonus?: number | null
        }
        Update: {
          criterio?: string | null
          descricao?: string | null
          icone_url?: string | null
          id?: string
          nome?: string
          pontos_bonus?: number | null
        }
        Relationships: []
      }
      configuracoes: {
        Row: {
          chave: string
          updated_at: string | null
          valor: Json
        }
        Insert: {
          chave: string
          updated_at?: string | null
          valor: Json
        }
        Update: {
          chave?: string
          updated_at?: string | null
          valor?: Json
        }
        Relationships: []
      }
      corretor_badges: {
        Row: {
          badge_id: string | null
          conquistado_em: string | null
          corretor_id: string | null
          id: string
        }
        Insert: {
          badge_id?: string | null
          conquistado_em?: string | null
          corretor_id?: string | null
          id?: string
        }
        Update: {
          badge_id?: string | null
          conquistado_em?: string | null
          corretor_id?: string | null
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "corretor_badges_badge_id_fkey"
            columns: ["badge_id"]
            isOneToOne: false
            referencedRelation: "badges"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "corretor_badges_corretor_id_fkey"
            columns: ["corretor_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      links_uteis: {
        Row: {
          ativo: boolean | null
          categoria: string | null
          descricao: string | null
          icone: string | null
          id: string
          ordem: number | null
          titulo: string
          url: string
        }
        Insert: {
          ativo?: boolean | null
          categoria?: string | null
          descricao?: string | null
          icone?: string | null
          id?: string
          ordem?: number | null
          titulo: string
          url: string
        }
        Update: {
          ativo?: boolean | null
          categoria?: string | null
          descricao?: string | null
          icone?: string | null
          id?: string
          ordem?: number | null
          titulo?: string
          url?: string
        }
        Relationships: []
      }
      open_house_avaliacoes: {
        Row: {
          compraria: string | null
          created_at: string | null
          creci: string | null
          id: string
          imobiliaria: string
          mais_gostou: string | null
          menos_gostou: string | null
          nome_corretor: string
          nota_acabamento: number | null
          nota_areas_comuns: number | null
          nota_conservacao: number | null
          nota_disposicao: number | null
          nota_localizacao: number | null
          nota_media: number | null
          nota_preco: number | null
          nota_tamanho: number | null
          open_house_id: string | null
          telefone: string | null
        }
        Insert: {
          compraria?: string | null
          created_at?: string | null
          creci?: string | null
          id?: string
          imobiliaria: string
          mais_gostou?: string | null
          menos_gostou?: string | null
          nome_corretor: string
          nota_acabamento?: number | null
          nota_areas_comuns?: number | null
          nota_conservacao?: number | null
          nota_disposicao?: number | null
          nota_localizacao?: number | null
          nota_media?: number | null
          nota_preco?: number | null
          nota_tamanho?: number | null
          open_house_id?: string | null
          telefone?: string | null
        }
        Update: {
          compraria?: string | null
          created_at?: string | null
          creci?: string | null
          id?: string
          imobiliaria?: string
          mais_gostou?: string | null
          menos_gostou?: string | null
          nome_corretor?: string
          nota_acabamento?: number | null
          nota_areas_comuns?: number | null
          nota_conservacao?: number | null
          nota_disposicao?: number | null
          nota_localizacao?: number | null
          nota_media?: number | null
          nota_preco?: number | null
          nota_tamanho?: number | null
          open_house_id?: string | null
          telefone?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "open_house_avaliacoes_open_house_id_fkey"
            columns: ["open_house_id"]
            isOneToOne: false
            referencedRelation: "open_houses"
            referencedColumns: ["id"]
          },
        ]
      }
      open_houses: {
        Row: {
          bairro: string | null
          cidade: string
          created_at: string | null
          criado_por: string | null
          data_evento: string
          empreendimento: string
          endereco: string
          fotos: Json | null
          horario_fim: string | null
          horario_inicio: string | null
          id: string
          observacoes: string | null
          proprietario_nome: string | null
          proprietario_telefone: string | null
          status: string | null
          token_avaliacao: string | null
          token_resultado: string | null
          unidade: string | null
        }
        Insert: {
          bairro?: string | null
          cidade: string
          created_at?: string | null
          criado_por?: string | null
          data_evento: string
          empreendimento: string
          endereco: string
          fotos?: Json | null
          horario_fim?: string | null
          horario_inicio?: string | null
          id?: string
          observacoes?: string | null
          proprietario_nome?: string | null
          proprietario_telefone?: string | null
          status?: string | null
          token_avaliacao?: string | null
          token_resultado?: string | null
          unidade?: string | null
        }
        Update: {
          bairro?: string | null
          cidade?: string
          created_at?: string | null
          criado_por?: string | null
          data_evento?: string
          empreendimento?: string
          endereco?: string
          fotos?: Json | null
          horario_fim?: string | null
          horario_inicio?: string | null
          id?: string
          observacoes?: string | null
          proprietario_nome?: string | null
          proprietario_telefone?: string | null
          status?: string | null
          token_avaliacao?: string | null
          token_resultado?: string | null
          unidade?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "open_houses_criado_por_fkey"
            columns: ["criado_por"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      pontuacao: {
        Row: {
          corretor_id: string | null
          created_at: string | null
          descricao: string | null
          id: string
          pontos: number
          referencia_id: string | null
          tipo: string
        }
        Insert: {
          corretor_id?: string | null
          created_at?: string | null
          descricao?: string | null
          id?: string
          pontos: number
          referencia_id?: string | null
          tipo: string
        }
        Update: {
          corretor_id?: string | null
          created_at?: string | null
          descricao?: string | null
          id?: string
          pontos?: number
          referencia_id?: string | null
          tipo?: string
        }
        Relationships: [
          {
            foreignKeyName: "pontuacao_corretor_id_fkey"
            columns: ["corretor_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          ativo: boolean | null
          cnpj: string | null
          created_at: string | null
          creci: string | null
          email: string | null
          foto_url: string | null
          id: string
          nome: string
          role: string | null
          telefone: string
        }
        Insert: {
          ativo?: boolean | null
          cnpj?: string | null
          created_at?: string | null
          creci?: string | null
          email?: string | null
          foto_url?: string | null
          id: string
          nome: string
          role?: string | null
          telefone: string
        }
        Update: {
          ativo?: boolean | null
          cnpj?: string | null
          created_at?: string | null
          creci?: string | null
          email?: string | null
          foto_url?: string | null
          id?: string
          nome?: string
          role?: string | null
          telefone?: string
        }
        Relationships: []
      }
      simulacao_cenarios: {
        Row: {
          created_at: string | null
          custos_venda: number | null
          id: string
          ir_devido: number | null
          label: string | null
          lucro_bruto: number | null
          lucro_liquido: number | null
          mes_venda: number
          rendimento_cdb: number | null
          rendimento_lci: number | null
          rendimento_selic: number | null
          rentabilidade_anualizada: number | null
          rentabilidade_percentual: number | null
          simulacao_id: string | null
          total_investido: number | null
          total_investido_corrigido: number | null
          valor_imovel_momento: number | null
        }
        Insert: {
          created_at?: string | null
          custos_venda?: number | null
          id?: string
          ir_devido?: number | null
          label?: string | null
          lucro_bruto?: number | null
          lucro_liquido?: number | null
          mes_venda: number
          rendimento_cdb?: number | null
          rendimento_lci?: number | null
          rendimento_selic?: number | null
          rentabilidade_anualizada?: number | null
          rentabilidade_percentual?: number | null
          simulacao_id?: string | null
          total_investido?: number | null
          total_investido_corrigido?: number | null
          valor_imovel_momento?: number | null
        }
        Update: {
          created_at?: string | null
          custos_venda?: number | null
          id?: string
          ir_devido?: number | null
          label?: string | null
          lucro_bruto?: number | null
          lucro_liquido?: number | null
          mes_venda?: number
          rendimento_cdb?: number | null
          rendimento_lci?: number | null
          rendimento_selic?: number | null
          rentabilidade_anualizada?: number | null
          rentabilidade_percentual?: number | null
          simulacao_id?: string | null
          total_investido?: number | null
          total_investido_corrigido?: number | null
          valor_imovel_momento?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "simulacao_cenarios_simulacao_id_fkey"
            columns: ["simulacao_id"]
            isOneToOne: false
            referencedRelation: "simulacoes"
            referencedColumns: ["id"]
          },
        ]
      }
      simulacoes: {
        Row: {
          bairro: string | null
          cidade: string
          comissao_compra: number | null
          comissao_venda_percentual: number | null
          construtora: string | null
          corretor_id: string | null
          created_at: string | null
          data_entrega_estimada: string | null
          data_lancamento: string | null
          empreendimento_nome: string
          entrada: number | null
          fonte_valorizacao: string | null
          id: string
          investidor_email: string | null
          investidor_nome: string | null
          investidor_telefone: string | null
          ir_ganho_capital: boolean | null
          itbi_percentual: number | null
          parcelas_anuais: number | null
          parcelas_mensais: number | null
          parcelas_semestrais: number | null
          pos_chaves_indice: string | null
          pos_chaves_juros: number | null
          registro_cartorio: number | null
          saldo_chaves: number | null
          status: string | null
          taxa_cdb: number | null
          taxa_correcao_anual: number | null
          taxa_lci: number | null
          taxa_selic: number | null
          tipo_correcao: string | null
          token_publico: string | null
          updated_at: string | null
          valor_atual: number | null
          valor_entrega_estimado: number | null
          valor_lancamento: number
          valor_parcela_anual: number | null
          valor_parcela_mensal: number | null
          valor_parcela_semestral: number | null
          valorizacao_anual_estimada: number | null
        }
        Insert: {
          bairro?: string | null
          cidade: string
          comissao_compra?: number | null
          comissao_venda_percentual?: number | null
          construtora?: string | null
          corretor_id?: string | null
          created_at?: string | null
          data_entrega_estimada?: string | null
          data_lancamento?: string | null
          empreendimento_nome: string
          entrada?: number | null
          fonte_valorizacao?: string | null
          id?: string
          investidor_email?: string | null
          investidor_nome?: string | null
          investidor_telefone?: string | null
          ir_ganho_capital?: boolean | null
          itbi_percentual?: number | null
          parcelas_anuais?: number | null
          parcelas_mensais?: number | null
          parcelas_semestrais?: number | null
          pos_chaves_indice?: string | null
          pos_chaves_juros?: number | null
          registro_cartorio?: number | null
          saldo_chaves?: number | null
          status?: string | null
          taxa_cdb?: number | null
          taxa_correcao_anual?: number | null
          taxa_lci?: number | null
          taxa_selic?: number | null
          tipo_correcao?: string | null
          token_publico?: string | null
          updated_at?: string | null
          valor_atual?: number | null
          valor_entrega_estimado?: number | null
          valor_lancamento: number
          valor_parcela_anual?: number | null
          valor_parcela_mensal?: number | null
          valor_parcela_semestral?: number | null
          valorizacao_anual_estimada?: number | null
        }
        Update: {
          bairro?: string | null
          cidade?: string
          comissao_compra?: number | null
          comissao_venda_percentual?: number | null
          construtora?: string | null
          corretor_id?: string | null
          created_at?: string | null
          data_entrega_estimada?: string | null
          data_lancamento?: string | null
          empreendimento_nome?: string
          entrada?: number | null
          fonte_valorizacao?: string | null
          id?: string
          investidor_email?: string | null
          investidor_nome?: string | null
          investidor_telefone?: string | null
          ir_ganho_capital?: boolean | null
          itbi_percentual?: number | null
          parcelas_anuais?: number | null
          parcelas_mensais?: number | null
          parcelas_semestrais?: number | null
          pos_chaves_indice?: string | null
          pos_chaves_juros?: number | null
          registro_cartorio?: number | null
          saldo_chaves?: number | null
          status?: string | null
          taxa_cdb?: number | null
          taxa_correcao_anual?: number | null
          taxa_lci?: number | null
          taxa_selic?: number | null
          tipo_correcao?: string | null
          token_publico?: string | null
          updated_at?: string | null
          valor_atual?: number | null
          valor_entrega_estimado?: number | null
          valor_lancamento?: number
          valor_parcela_anual?: number | null
          valor_parcela_mensal?: number | null
          valor_parcela_semestral?: number | null
          valorizacao_anual_estimada?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "simulacoes_corretor_id_fkey"
            columns: ["corretor_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      treinamento_aulas: {
        Row: {
          ativo: boolean | null
          categoria_id: string | null
          conteudo_texto: string | null
          conteudo_tipo: string | null
          conteudo_url: string | null
          created_at: string | null
          descricao: string | null
          duracao_minutos: number | null
          id: string
          ordem: number | null
          pontos: number | null
          thumbnail_url: string | null
          titulo: string
        }
        Insert: {
          ativo?: boolean | null
          categoria_id?: string | null
          conteudo_texto?: string | null
          conteudo_tipo?: string | null
          conteudo_url?: string | null
          created_at?: string | null
          descricao?: string | null
          duracao_minutos?: number | null
          id?: string
          ordem?: number | null
          pontos?: number | null
          thumbnail_url?: string | null
          titulo: string
        }
        Update: {
          ativo?: boolean | null
          categoria_id?: string | null
          conteudo_texto?: string | null
          conteudo_tipo?: string | null
          conteudo_url?: string | null
          created_at?: string | null
          descricao?: string | null
          duracao_minutos?: number | null
          id?: string
          ordem?: number | null
          pontos?: number | null
          thumbnail_url?: string | null
          titulo?: string
        }
        Relationships: [
          {
            foreignKeyName: "treinamento_aulas_categoria_id_fkey"
            columns: ["categoria_id"]
            isOneToOne: false
            referencedRelation: "treinamento_categorias"
            referencedColumns: ["id"]
          },
        ]
      }
      treinamento_categorias: {
        Row: {
          ativo: boolean | null
          cor: string | null
          cor_bg: string | null
          descricao: string | null
          icone: string | null
          id: string
          imagem_capa: string | null
          nome: string
          ordem: number | null
        }
        Insert: {
          ativo?: boolean | null
          cor?: string | null
          cor_bg?: string | null
          descricao?: string | null
          icone?: string | null
          id?: string
          imagem_capa?: string | null
          nome: string
          ordem?: number | null
        }
        Update: {
          ativo?: boolean | null
          cor?: string | null
          cor_bg?: string | null
          descricao?: string | null
          icone?: string | null
          id?: string
          imagem_capa?: string | null
          nome?: string
          ordem?: number | null
        }
        Relationships: []
      }
      treinamento_progresso: {
        Row: {
          aula_id: string | null
          concluida: boolean | null
          concluida_em: string | null
          corretor_id: string | null
          created_at: string | null
          id: string
          nota_quiz: number | null
          pontos_ganhos: number | null
        }
        Insert: {
          aula_id?: string | null
          concluida?: boolean | null
          concluida_em?: string | null
          corretor_id?: string | null
          created_at?: string | null
          id?: string
          nota_quiz?: number | null
          pontos_ganhos?: number | null
        }
        Update: {
          aula_id?: string | null
          concluida?: boolean | null
          concluida_em?: string | null
          corretor_id?: string | null
          created_at?: string | null
          id?: string
          nota_quiz?: number | null
          pontos_ganhos?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "treinamento_progresso_aula_id_fkey"
            columns: ["aula_id"]
            isOneToOne: false
            referencedRelation: "treinamento_aulas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "treinamento_progresso_corretor_id_fkey"
            columns: ["corretor_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      treinamento_quiz: {
        Row: {
          alternativas: Json
          aula_id: string | null
          explicacao: string | null
          id: string
          ordem: number | null
          pergunta: string
          pontos: number | null
          resposta_correta: number
        }
        Insert: {
          alternativas: Json
          aula_id?: string | null
          explicacao?: string | null
          id?: string
          ordem?: number | null
          pergunta: string
          pontos?: number | null
          resposta_correta: number
        }
        Update: {
          alternativas?: Json
          aula_id?: string | null
          explicacao?: string | null
          id?: string
          ordem?: number | null
          pergunta?: string
          pontos?: number | null
          resposta_correta?: number
        }
        Relationships: [
          {
            foreignKeyName: "treinamento_quiz_aula_id_fkey"
            columns: ["aula_id"]
            isOneToOne: false
            referencedRelation: "treinamento_aulas"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_user_role: { Args: { user_id: string }; Returns: string }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof Database
}
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof Database
}
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof Database
}
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never
