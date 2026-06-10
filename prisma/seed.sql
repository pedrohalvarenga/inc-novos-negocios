-- ============================================================
-- SEED SQL — INC Novos Negócios
-- Execute no Supabase SQL Editor após rodar as migrations
-- Substitua 'SEU-UUID-ADMIN' pelo UUID do admin em Auth > Users
-- ============================================================

DO $$
DECLARE
  v_admin_id    TEXT;
  v_gestor_id   TEXT;
  v_analista_id TEXT;
BEGIN

-- ── Usuários ────────────────────────────────────────────────
INSERT INTO "usuarios" (id, "supabaseId", nome, email, role, "createdAt", "updatedAt")
VALUES
  (gen_random_uuid()::text, 'SEU-UUID-ADMIN',                             'Lucas Costa',       'admin@inc.com.br',    'ADMIN',   NOW(), NOW()),
  (gen_random_uuid()::text, '00000000-0000-0000-0000-000000000002', 'Mariana Ferreira',  'gestor@inc.com.br',   'GESTOR',  NOW(), NOW()),
  (gen_random_uuid()::text, '00000000-0000-0000-0000-000000000003', 'Rafael Santos',     'analista@inc.com.br', 'ANALISTA', NOW(), NOW())
ON CONFLICT (email) DO NOTHING;

SELECT id INTO v_admin_id   FROM "usuarios" WHERE email = 'admin@inc.com.br'   LIMIT 1;
SELECT id INTO v_gestor_id  FROM "usuarios" WHERE email = 'gestor@inc.com.br'  LIMIT 1;
SELECT id INTO v_analista_id FROM "usuarios" WHERE email = 'analista@inc.com.br' LIMIT 1;

-- ── Proprietários ───────────────────────────────────────────
INSERT INTO "proprietarios" (id, "nomeRazaoSocial", "cpfCnpj", telefone, email, "representanteLegal", "createdBy", "createdAt", "updatedAt")
VALUES
  ('prop-001', 'José Carlos Mendonça',     '123.456.789-00',       '(11) 99887-6655', 'jcmendonca@gmail.com',          NULL,                  v_admin_id, NOW(), NOW()),
  ('prop-002', 'Família Rodrigues Ltda.',   '12.345.678/0001-99',   '(21) 98765-4321', 'rodrigues@familiarodr.com.br',  'Ana Rodrigues',       v_admin_id, NOW(), NOW()),
  ('prop-003', 'Paulo e Maria Silva',       '987.654.321-00',       '(31) 97654-3210', NULL,                            NULL,                  v_admin_id, NOW(), NOW()),
  ('prop-004', 'Construtora Horizonte S.A.','98.765.432/0001-10',   '(41) 3333-4444',  'negocios@horizonte.com.br',     'Dir. Claudio Horizonte', v_admin_id, NOW(), NOW()),
  ('prop-005', 'Herdeiros Tavares',         '111.222.333-44',       '(11) 91234-5678', NULL,                            NULL,                  v_admin_id, NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- ── Corretores ──────────────────────────────────────────────
INSERT INTO "corretores" (id, nome, telefone, email, creci, "percentualComissao", "createdBy", "createdAt", "updatedAt")
VALUES
  ('cor-001', 'Andréa Lima',    '(11) 98888-1111', 'andrea.lima@corretoraspl.com.br', '123456-F', 1.5, v_admin_id, NOW(), NOW()),
  ('cor-002', 'Bruno Teixeira', '(21) 97777-2222', 'bteixeira@imoveisrj.com.br',      '654321-F', 2.0, v_admin_id, NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- ── Terrenos ────────────────────────────────────────────────
INSERT INTO "terrenos" (id, nome, apelido, logradouro, numero, bairro, cidade, uf, cep,
  "areaTerreno", zoneamento, "coeficienteAproveitamento", "numUnidadesEstimado", "areaPrivativaMedia",
  "vgvEstimado", "valorPedido", "valorCompra", "formaPagamento", "prazoPagamento", "percentualPermuta",
  "descricaoPermuta", status, "createdBy", "responsavelId", "corretorId", "dataProspeccao", "createdAt", "updatedAt")
VALUES
  ('t-001', 'Terreno Av. Paulista', 'Paulista Center', 'Avenida Paulista', '1500', 'Bela Vista', 'São Paulo', 'SP', '01310-100',
    1200, 'ZM-3b', 4.0, 120, 65, 78000000, 12000000, 9500000, 'PERMUTA_FISICA', 0, 100, '12 apartamentos de 65m²',
    'CONTRATO_EM_ELABORACAO', v_admin_id, v_gestor_id, 'cor-001', '2024-03-15', NOW(), NOW()),
  ('t-002', 'Gleba Barra da Tijuca', 'Barra Premium', 'Avenida das Américas', '4500', 'Barra da Tijuca', 'Rio de Janeiro', 'RJ', NULL,
    8500, 'ATE', 2.5, 200, 90, 180000000, 25000000, 21000000, 'MISTO', 24, 60, '20 aptos 90m² + R$8,4M prazo',
    'PROPOSTA_ACEITA', v_admin_id, v_gestor_id, 'cor-002', '2024-05-20', NOW(), NOW()),
  ('t-003', 'Lote Savassi', NULL, 'Rua Antônio de Albuquerque', '700', 'Savassi', 'Belo Horizonte', 'MG', NULL,
    950, 'ZAP-1', 3.5, 80, 70, 44800000, 5500000, 4800000, 'PERMUTA_FINANCEIRA', 36, 80, NULL,
    'EM_NEGOCIACAO', v_analista_id, v_analista_id, NULL, '2024-08-10', NOW(), NOW()),
  ('t-004', 'Área Água Verde', NULL, 'Rua Mato Grosso', '1200', 'Água Verde', 'Curitiba', 'PR', NULL,
    2200, 'ZR-4', 3.0, 160, 55, 57600000, 7200000, 6300000, 'DINHEIRO_PRAZO', 48, NULL, NULL,
    'PROPOSTA_ENVIADA', v_analista_id, v_analista_id, 'cor-001', '2024-09-03', NOW(), NOW()),
  ('t-005', 'Gleba Alphaville', 'Alpha Sul', 'Alameda Rio Negro', '500', 'Alphaville Industrial', 'Barueri', 'SP', NULL,
    5000, 'ZR-2', 2.0, 240, 45, 86400000, 11000000, NULL, NULL, NULL, NULL, NULL,
    'EM_NEGOCIACAO', v_admin_id, v_gestor_id, NULL, '2024-10-15', NOW(), NOW()),
  ('t-006', 'Terreno Centro Histórico', NULL, 'Rua XV de Novembro', '300', 'Centro', 'Porto Alegre', 'RS', NULL,
    600, 'AEIS-1', NULL, 60, 50, 19200000, 3800000, 3200000, 'DINHEIRO_VISTA', NULL, NULL, NULL,
    'CONTRATO_ASSINADO', v_admin_id, v_gestor_id, NULL, '2023-11-10', NOW(), NOW()),
  ('t-007', 'Lote Meireles', NULL, 'Avenida Beira Mar', '2000', 'Meireles', 'Fortaleza', 'CE', NULL,
    1800, 'ZOR', 3.5, 150, 75, 90000000, 13500000, NULL, NULL, NULL, NULL, NULL,
    'PROSPECCAO', v_analista_id, NULL, NULL, '2025-01-08', NOW(), NOW()),
  ('t-008', 'Área Ponta Negra', NULL, 'Via Costeira', 's/n', 'Ponta Negra', 'Natal', 'RN', NULL,
    12000, NULL, 2.0, 320, 60, 115200000, 20000000, NULL, NULL, NULL, NULL, NULL,
    'PROSPECCAO', v_analista_id, NULL, NULL, '2025-02-14', NOW(), NOW()),
  ('t-009', 'Gleba Jardins', NULL, 'Rua Oscar Freire', '800', 'Jardins', 'São Paulo', 'SP', NULL,
    800, 'ZM-4', 4.0, 64, 120, 76800000, 18000000, 15200000, 'PERMUTA_FISICA', NULL, 100, '8 coberturas 240m²',
    'EM_NEGOCIACAO', v_admin_id, v_gestor_id, NULL, '2025-03-01', NOW(), NOW()),
  ('t-010', 'Terreno Moema', NULL, 'Alameda dos Nhambiquaras', '100', 'Moema', 'São Paulo', 'SP', NULL,
    700, 'ZM-3a', NULL, 72, 80, 57600000, 10000000, NULL, NULL, NULL, NULL, NULL,
    'DESCARTADO', v_analista_id, NULL, NULL, '2024-06-15', NOW(), NOW()),
  ('t-011', 'Área Santo André', NULL, 'Avenida Industrial', '4000', 'Centro', 'Santo André', 'SP', NULL,
    3500, NULL, NULL, 280, 50, 84000000, 9500000, 8200000, 'DINHEIRO_PRAZO', 60, NULL, NULL,
    'PROPOSTA_ENVIADA', v_analista_id, v_analista_id, NULL, '2025-04-10', NOW(), NOW()),
  ('t-012', 'Lote Florianópolis Centro', NULL, 'Rua Felipe Schmidt', '200', 'Centro', 'Florianópolis', 'SC', NULL,
    450, 'ACI', NULL, 40, 85, 34000000, 4200000, 3700000, 'PERMUTA_FINANCEIRA', 30, 70, NULL,
    'EM_NEGOCIACAO', v_admin_id, NULL, NULL, '2025-05-05', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- ── Vínculos terreno-proprietário ───────────────────────────
INSERT INTO "terreno_proprietarios" ("terrenoId", "proprietarioId", principal, percentual)
VALUES
  ('t-001', 'prop-001', true,  100),
  ('t-002', 'prop-002', true,  100),
  ('t-003', 'prop-003', true,  100),
  ('t-004', 'prop-004', true,  100),
  ('t-005', 'prop-005', true,   70),
  ('t-005', 'prop-001', false,  30),
  ('t-006', 'prop-003', true,  100),
  ('t-009', 'prop-001', true,  100),
  ('t-012', 'prop-004', true,  100)
ON CONFLICT ("terrenoId", "proprietarioId") DO NOTHING;

-- ── Histórico de status (trajetória simplificada) ────────────
INSERT INTO "terreno_status_historico" ("terrenoId", "statusAnterior", "statusNovo", "createdAt", "createdBy")
VALUES
  ('t-001', NULL,                    'PROSPECCAO',              '2024-03-15', v_admin_id),
  ('t-001', 'PROSPECCAO',            'EM_NEGOCIACAO',           '2024-04-01', v_admin_id),
  ('t-001', 'EM_NEGOCIACAO',         'PROPOSTA_ENVIADA',        '2024-04-10', v_admin_id),
  ('t-001', 'PROPOSTA_ENVIADA',      'PROPOSTA_ACEITA',         '2024-04-20', v_admin_id),
  ('t-001', 'PROPOSTA_ACEITA',       'CONTRATO_EM_ELABORACAO',  '2024-05-01', v_admin_id),
  ('t-002', NULL,                    'PROSPECCAO',              '2024-05-20', v_admin_id),
  ('t-002', 'PROSPECCAO',            'EM_NEGOCIACAO',           '2024-06-01', v_admin_id),
  ('t-002', 'EM_NEGOCIACAO',         'PROPOSTA_ENVIADA',        '2024-06-10', v_admin_id),
  ('t-002', 'PROPOSTA_ENVIADA',      'PROPOSTA_ACEITA',         '2024-07-01', v_admin_id),
  ('t-003', NULL,                    'PROSPECCAO',              '2024-08-10', v_analista_id),
  ('t-003', 'PROSPECCAO',            'EM_NEGOCIACAO',           '2024-09-01', v_analista_id),
  ('t-004', NULL,                    'PROSPECCAO',              '2024-09-03', v_analista_id),
  ('t-004', 'PROSPECCAO',            'EM_NEGOCIACAO',           '2024-10-01', v_analista_id),
  ('t-004', 'EM_NEGOCIACAO',         'PROPOSTA_ENVIADA',        '2024-11-01', v_analista_id),
  ('t-005', NULL,                    'PROSPECCAO',              '2024-10-15', v_admin_id),
  ('t-005', 'PROSPECCAO',            'EM_NEGOCIACAO',           '2024-11-15', v_admin_id),
  ('t-006', NULL,                    'PROSPECCAO',              '2023-11-10', v_admin_id),
  ('t-006', 'PROSPECCAO',            'EM_NEGOCIACAO',           '2023-12-01', v_admin_id),
  ('t-006', 'EM_NEGOCIACAO',         'PROPOSTA_ENVIADA',        '2024-01-10', v_admin_id),
  ('t-006', 'PROPOSTA_ENVIADA',      'PROPOSTA_ACEITA',         '2024-01-25', v_admin_id),
  ('t-006', 'PROPOSTA_ACEITA',       'CONTRATO_EM_ELABORACAO',  '2024-02-01', v_admin_id),
  ('t-006', 'CONTRATO_EM_ELABORACAO','CONTRATO_ASSINADO',       '2024-02-15', v_admin_id),
  ('t-007', NULL,                    'PROSPECCAO',              '2025-01-08', v_analista_id),
  ('t-008', NULL,                    'PROSPECCAO',              '2025-02-14', v_analista_id),
  ('t-009', NULL,                    'PROSPECCAO',              '2025-03-01', v_admin_id),
  ('t-009', 'PROSPECCAO',            'EM_NEGOCIACAO',           '2025-03-20', v_admin_id),
  ('t-010', NULL,                    'PROSPECCAO',              '2024-06-15', v_analista_id),
  ('t-010', 'PROSPECCAO',            'DESCARTADO',              '2024-07-20', v_analista_id),
  ('t-011', NULL,                    'PROSPECCAO',              '2025-04-10', v_analista_id),
  ('t-011', 'PROSPECCAO',            'EM_NEGOCIACAO',           '2025-04-25', v_analista_id),
  ('t-011', 'EM_NEGOCIACAO',         'PROPOSTA_ENVIADA',        '2025-05-10', v_analista_id),
  ('t-012', NULL,                    'PROSPECCAO',              '2025-05-05', v_admin_id),
  ('t-012', 'PROSPECCAO',            'EM_NEGOCIACAO',           '2025-05-25', v_admin_id)
ON CONFLICT DO NOTHING;

-- ── Configurações ────────────────────────────────────────────
INSERT INTO "configuracoes" (id, chave, valor, "createdAt", "updatedAt")
VALUES
  (gen_random_uuid()::text, 'score_pesos',  '{"pesoVgv":40,"pesoPagamento":25,"pesoPrazo":20,"pesoRisco":15}'::jsonb, NOW(), NOW()),
  (gen_random_uuid()::text, 'faixas_vgv',   '{"faixaVerde":10,"faixaAmarela":15}'::jsonb, NOW(), NOW()),
  (gen_random_uuid()::text, 'marca',        '{"incOrange":"#F26522"}'::jsonb, NOW(), NOW())
ON CONFLICT (chave) DO NOTHING;

RAISE NOTICE 'Seed concluído! Terrenos: %, Proprietários: %, Corretores: %',
  (SELECT count(*) FROM "terrenos"),
  (SELECT count(*) FROM "proprietarios"),
  (SELECT count(*) FROM "corretores");

END $$;
