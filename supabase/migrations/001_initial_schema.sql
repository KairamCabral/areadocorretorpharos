-- ============================================================
-- PHAROS CORRETOR — Schema Completo (Supabase PostgreSQL)
-- ============================================================
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 1. PROFILES
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  nome TEXT NOT NULL,
  telefone TEXT NOT NULL,
  email TEXT,
  creci TEXT,
  cnpj TEXT,
  foto_url TEXT,
  role TEXT CHECK (role IN ('master','gerente','assistente','corretor')) DEFAULT 'corretor',
  ativo BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE OR REPLACE FUNCTION handle_new_user() RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, nome, telefone, email)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'nome','Novo Corretor'), COALESCE(NEW.phone,''), NEW.email);
  RETURN NEW;
END; $$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- 2. AVALIAÇÕES
CREATE TABLE avaliacoes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(), corretor_id UUID REFERENCES profiles(id),
  cidade TEXT NOT NULL, bairro TEXT NOT NULL, endereco TEXT, tipo TEXT DEFAULT 'apartamento',
  m2_privativo NUMERIC NOT NULL, m2_total NUMERIC, quartos INT, suites INT, banheiros INT, vagas INT,
  mobilia TEXT, infra_lazer TEXT, idade_predio INT, posicao_mar TEXT, andar TEXT,
  proprietario_nome TEXT, proprietario_telefone TEXT, proprietario_email TEXT,
  valor_m2_medio NUMERIC, valor_comercial NUMERIC, valor_avaliado NUMERIC, valor_maximo NUMERIC,
  fator_ajuste NUMERIC DEFAULT 0.90,
  token_publico TEXT UNIQUE DEFAULT encode(gen_random_bytes(16), 'hex'),
  status TEXT DEFAULT 'rascunho', created_at TIMESTAMPTZ DEFAULT now(), updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE avaliacao_comparaveis (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(), avaliacao_id UUID REFERENCES avaliacoes(id) ON DELETE CASCADE,
  codigo TEXT, empreendimento TEXT, valor_total NUMERIC, m2_privativo NUMERIC,
  valor_m2 NUMERIC GENERATED ALWAYS AS (CASE WHEN m2_privativo > 0 THEN valor_total / m2_privativo ELSE NULL END) STORED,
  quartos INT, suites INT, banheiros INT, vagas INT, infra TEXT, mobilia TEXT, andar_posicao TEXT,
  condicao TEXT, data_atualizacao DATE, fonte_url TEXT, peso NUMERIC DEFAULT 0.90,
  origem TEXT DEFAULT 'ia', ativo BOOLEAN DEFAULT true, ordem INT, created_at TIMESTAMPTZ DEFAULT now()
);

-- 3. SIMULAÇÕES
CREATE TABLE simulacoes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(), corretor_id UUID REFERENCES profiles(id),
  empreendimento_nome TEXT NOT NULL, construtora TEXT, cidade TEXT NOT NULL, bairro TEXT,
  valor_lancamento NUMERIC NOT NULL, valor_atual NUMERIC, valor_entrega_estimado NUMERIC,
  data_lancamento DATE, data_entrega_estimada DATE,
  entrada NUMERIC DEFAULT 0, parcelas_mensais INT DEFAULT 0, valor_parcela_mensal NUMERIC DEFAULT 0,
  parcelas_semestrais INT DEFAULT 0, valor_parcela_semestral NUMERIC DEFAULT 0,
  parcelas_anuais INT DEFAULT 0, valor_parcela_anual NUMERIC DEFAULT 0, saldo_chaves NUMERIC DEFAULT 0,
  tipo_correcao TEXT DEFAULT 'CUB', taxa_correcao_anual NUMERIC, pos_chaves_indice TEXT DEFAULT 'IPCA', pos_chaves_juros NUMERIC DEFAULT 0,
  itbi_percentual NUMERIC DEFAULT 2.0, registro_cartorio NUMERIC DEFAULT 3000,
  comissao_compra NUMERIC DEFAULT 0, comissao_venda_percentual NUMERIC DEFAULT 6.0, ir_ganho_capital BOOLEAN DEFAULT true,
  valorizacao_anual_estimada NUMERIC, fonte_valorizacao TEXT,
  taxa_selic NUMERIC, taxa_cdb NUMERIC, taxa_lci NUMERIC,
  investidor_nome TEXT, investidor_telefone TEXT, investidor_email TEXT,
  token_publico TEXT UNIQUE DEFAULT encode(gen_random_bytes(16), 'hex'),
  status TEXT DEFAULT 'rascunho', created_at TIMESTAMPTZ DEFAULT now(), updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE simulacao_cenarios (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(), simulacao_id UUID REFERENCES simulacoes(id) ON DELETE CASCADE,
  mes_venda INT NOT NULL, label TEXT,
  valor_imovel_momento NUMERIC, total_investido NUMERIC, total_investido_corrigido NUMERIC,
  custos_venda NUMERIC, lucro_bruto NUMERIC, ir_devido NUMERIC, lucro_liquido NUMERIC,
  rentabilidade_percentual NUMERIC, rentabilidade_anualizada NUMERIC,
  rendimento_selic NUMERIC, rendimento_cdb NUMERIC, rendimento_lci NUMERIC,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 4. OPEN HOUSE
CREATE TABLE open_houses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(), criado_por UUID REFERENCES profiles(id),
  empreendimento TEXT NOT NULL, endereco TEXT NOT NULL, cidade TEXT NOT NULL, bairro TEXT, unidade TEXT,
  proprietario_nome TEXT, proprietario_telefone TEXT,
  data_evento DATE NOT NULL, horario_inicio TIME, horario_fim TIME, observacoes TEXT,
  fotos JSONB DEFAULT '[]',
  token_avaliacao TEXT UNIQUE DEFAULT encode(gen_random_bytes(16), 'hex'),
  token_resultado TEXT UNIQUE DEFAULT encode(gen_random_bytes(16), 'hex'),
  status TEXT DEFAULT 'agendado', created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE open_house_avaliacoes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(), open_house_id UUID REFERENCES open_houses(id) ON DELETE CASCADE,
  nome_corretor TEXT NOT NULL, imobiliaria TEXT NOT NULL, telefone TEXT, creci TEXT,
  nota_tamanho INT CHECK (nota_tamanho BETWEEN 1 AND 5),
  nota_disposicao INT CHECK (nota_disposicao BETWEEN 1 AND 5),
  nota_acabamento INT CHECK (nota_acabamento BETWEEN 1 AND 5),
  nota_conservacao INT CHECK (nota_conservacao BETWEEN 1 AND 5),
  nota_areas_comuns INT CHECK (nota_areas_comuns BETWEEN 1 AND 5),
  nota_localizacao INT CHECK (nota_localizacao BETWEEN 1 AND 5),
  nota_preco INT CHECK (nota_preco BETWEEN 1 AND 5),
  compraria TEXT CHECK (compraria IN ('sim','nao','talvez')),
  mais_gostou TEXT, menos_gostou TEXT,
  nota_media NUMERIC GENERATED ALWAYS AS (
    (COALESCE(nota_tamanho,0)+COALESCE(nota_disposicao,0)+COALESCE(nota_acabamento,0)+
     COALESCE(nota_conservacao,0)+COALESCE(nota_areas_comuns,0)+COALESCE(nota_localizacao,0)+
     COALESCE(nota_preco,0))/7.0
  ) STORED,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 5. TREINAMENTO
CREATE TABLE treinamento_categorias (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), nome TEXT NOT NULL, descricao TEXT, icone TEXT, cor TEXT, cor_bg TEXT, imagem_capa TEXT, ordem INT DEFAULT 0, ativo BOOLEAN DEFAULT true);
CREATE TABLE treinamento_aulas (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), categoria_id UUID REFERENCES treinamento_categorias(id), titulo TEXT NOT NULL, descricao TEXT, conteudo_tipo TEXT, conteudo_url TEXT, conteudo_texto TEXT, thumbnail_url TEXT, duracao_minutos INT, pontos INT DEFAULT 10, ordem INT DEFAULT 0, ativo BOOLEAN DEFAULT true, created_at TIMESTAMPTZ DEFAULT now());
CREATE TABLE treinamento_quiz (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), aula_id UUID REFERENCES treinamento_aulas(id) ON DELETE CASCADE, pergunta TEXT NOT NULL, alternativas JSONB NOT NULL, resposta_correta INT NOT NULL, explicacao TEXT, pontos INT DEFAULT 5, ordem INT DEFAULT 0);
CREATE TABLE treinamento_progresso (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), corretor_id UUID REFERENCES profiles(id), aula_id UUID REFERENCES treinamento_aulas(id), concluida BOOLEAN DEFAULT false, nota_quiz NUMERIC, pontos_ganhos INT DEFAULT 0, concluida_em TIMESTAMPTZ, created_at TIMESTAMPTZ DEFAULT now(), UNIQUE(corretor_id, aula_id));
CREATE TABLE badges (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), nome TEXT NOT NULL, descricao TEXT, icone_url TEXT, criterio TEXT, pontos_bonus INT DEFAULT 0);
CREATE TABLE corretor_badges (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), corretor_id UUID REFERENCES profiles(id), badge_id UUID REFERENCES badges(id), conquistado_em TIMESTAMPTZ DEFAULT now(), UNIQUE(corretor_id, badge_id));
CREATE TABLE pontuacao (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), corretor_id UUID REFERENCES profiles(id), tipo TEXT NOT NULL, referencia_id UUID, pontos INT NOT NULL, descricao TEXT, created_at TIMESTAMPTZ DEFAULT now());

-- 6. LINKS & CONFIG
CREATE TABLE links_uteis (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), titulo TEXT NOT NULL, url TEXT NOT NULL, icone TEXT, categoria TEXT, descricao TEXT, ordem INT DEFAULT 0, ativo BOOLEAN DEFAULT true);
CREATE TABLE configuracoes (chave TEXT PRIMARY KEY, valor JSONB NOT NULL, updated_at TIMESTAMPTZ DEFAULT now());

-- 7. RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE avaliacoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE avaliacao_comparaveis ENABLE ROW LEVEL SECURITY;
ALTER TABLE simulacoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE simulacao_cenarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE open_houses ENABLE ROW LEVEL SECURITY;
ALTER TABLE open_house_avaliacoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE treinamento_categorias ENABLE ROW LEVEL SECURITY;
ALTER TABLE treinamento_aulas ENABLE ROW LEVEL SECURITY;
ALTER TABLE treinamento_quiz ENABLE ROW LEVEL SECURITY;
ALTER TABLE treinamento_progresso ENABLE ROW LEVEL SECURITY;
ALTER TABLE badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE corretor_badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE pontuacao ENABLE ROW LEVEL SECURITY;
ALTER TABLE links_uteis ENABLE ROW LEVEL SECURITY;
ALTER TABLE configuracoes ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION get_user_role(user_id UUID) RETURNS TEXT AS $$
  SELECT role FROM profiles WHERE id = user_id;
$$ LANGUAGE sql SECURITY DEFINER;

-- Policies (essenciais)
CREATE POLICY "profiles_select" ON profiles FOR SELECT USING (true);
CREATE POLICY "profiles_update" ON profiles FOR UPDATE USING (auth.uid() = id OR get_user_role(auth.uid()) IN ('master','gerente'));
CREATE POLICY "avaliacoes_select" ON avaliacoes FOR SELECT USING (corretor_id = auth.uid() OR get_user_role(auth.uid()) IN ('master','gerente','assistente'));
CREATE POLICY "avaliacoes_insert" ON avaliacoes FOR INSERT WITH CHECK (corretor_id = auth.uid());
CREATE POLICY "avaliacoes_update" ON avaliacoes FOR UPDATE USING (corretor_id = auth.uid() OR get_user_role(auth.uid()) IN ('master','gerente'));
CREATE POLICY "comparaveis_all" ON avaliacao_comparaveis FOR ALL USING (true);
CREATE POLICY "simulacoes_select" ON simulacoes FOR SELECT USING (corretor_id = auth.uid() OR get_user_role(auth.uid()) IN ('master','gerente','assistente'));
CREATE POLICY "simulacoes_insert" ON simulacoes FOR INSERT WITH CHECK (corretor_id = auth.uid());
CREATE POLICY "cenarios_all" ON simulacao_cenarios FOR ALL USING (true);
CREATE POLICY "oh_all" ON open_houses FOR ALL USING (true);
CREATE POLICY "oha_all" ON open_house_avaliacoes FOR ALL USING (true);
CREATE POLICY "cat_all" ON treinamento_categorias FOR ALL USING (true);
CREATE POLICY "aulas_all" ON treinamento_aulas FOR ALL USING (true);
CREATE POLICY "quiz_all" ON treinamento_quiz FOR ALL USING (true);
CREATE POLICY "progresso_own" ON treinamento_progresso FOR ALL USING (corretor_id = auth.uid());
CREATE POLICY "badges_all" ON badges FOR ALL USING (true);
CREATE POLICY "cb_all" ON corretor_badges FOR ALL USING (true);
CREATE POLICY "pontuacao_all" ON pontuacao FOR ALL USING (true);
CREATE POLICY "links_all" ON links_uteis FOR ALL USING (true);
CREATE POLICY "config_all" ON configuracoes FOR ALL USING (true);

-- 8. INDEXES
CREATE INDEX idx_avaliacoes_corretor ON avaliacoes(corretor_id);
CREATE INDEX idx_avaliacoes_token ON avaliacoes(token_publico);
CREATE INDEX idx_simulacoes_corretor ON simulacoes(corretor_id);
CREATE INDEX idx_simulacoes_token ON simulacoes(token_publico);
CREATE INDEX idx_oh_token_avaliacao ON open_houses(token_avaliacao);
CREATE INDEX idx_oh_token_resultado ON open_houses(token_resultado);
CREATE INDEX idx_progresso_corretor ON treinamento_progresso(corretor_id);
CREATE INDEX idx_pontuacao_corretor ON pontuacao(corretor_id);

-- 9. SEED
INSERT INTO treinamento_categorias (nome, descricao, icone, cor, cor_bg, ordem) VALUES
('Vendas','Técnicas de captação, apresentação e fechamento','Target','#1B4DDB','#E8EEFB',1),
('Marketing Digital','Fotos de imóvel, redes sociais, portais','Smartphone','#7C3AED','#F3E8FF',2),
('Jurídico','Documentação, contratos, tributação','Scale','#059669','#D1FAE5',3),
('Financeiro','Simulações, investimento, financiamento','Coins','#C9A84C','#F5EDD4',4);

INSERT INTO links_uteis (titulo, url, icone, categoria, ordem) VALUES
('CRM Pharos','https://crm.pharosnegocios.com.br','LayoutDashboard','CRM',1),
('Google Drive','https://drive.google.com','HardDrive','Drive',2),
('WhatsApp Web','https://web.whatsapp.com','MessageCircle','Ferramentas',3),
('ZAP Imóveis','https://www.zapimoveis.com.br','Search','Portais',4),
('VivaReal','https://www.vivareal.com.br','Search','Portais',5),
('OLX Imóveis','https://www.olx.com.br/imoveis','Search','Portais',6);

INSERT INTO configuracoes (chave, valor) VALUES
('indices_financeiros','{"selic":13.25,"ipca":4.5,"cdi":13.15,"cub_sc":2345.67}'),
('custos_operacao_sc','{"itbi":2.0,"registro":3000,"comissao_venda":6.0}');

INSERT INTO badges (nome, descricao, criterio, pontos_bonus) VALUES
('Primeira Avaliação','Completou primeira avaliação','primeira_avaliacao',50),
('Simulador Expert','Criou 10 simulações','10_simulacoes',100),
('Trilha Vendas','Completou todas as aulas de Vendas','completar_vendas',200),
('Trilha Marketing','Completou todas as aulas de Marketing','completar_marketing',200),
('Quiz Master','Acertou 100% em 5 quizzes','quiz_master_5',150),
('Corretor do Mês','Maior pontuação no mês','corretor_do_mes',500);
