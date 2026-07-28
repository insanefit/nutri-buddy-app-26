# Design do piloto Saúde Nutricional Sesc

**Data:** 28 de julho de 2026

**Status:** aprovado para planejamento

**Plataforma:** aplicação web para computador e tablet

**Abrangência inicial:** duas unidades

## 1. Objetivo

Criar um sistema clínico de nutrição que permita à equipe das duas unidades conduzir o atendimento completo em um prontuário centralizado: cadastro, agenda, anamnese, avaliação antropométrica, anotações, acompanhamento longitudinal, prescrição nutricional, receitas, solicitações de exames e documentos.

O piloto será considerado bem-sucedido quando:

1. o nutricionista conseguir cadastrar ou importar um paciente;
2. agendar e iniciar uma consulta;
3. registrar anamnese e avaliação antropométrica adequadas ao público;
4. documentar conduta, metas e observações;
5. criar plano alimentar, receitas e solicitações de exames;
6. finalizar a consulta sem perder o histórico;
7. acompanhar medidas e anotações ao longo do tempo;
8. gerar os documentos clínicos em PDF; e
9. o coordenador conseguir administrar formulários e emitir relatórios consolidados das duas unidades em PDF e Excel.

## 2. Usuários e permissões

### Nutricionista

- Acessa sua unidade por padrão.
- Gerencia pacientes, agenda e prontuários da própria unidade.
- Pode acessar a outra unidade somente mediante autorização registrada.
- Registra e finaliza consultas.
- Emite prescrições, receitas, planos alimentares e solicitações de exames.
- Visualiza indicadores necessários ao próprio trabalho, sem acesso às funções administrativas do coordenador.

### Coordenador

- Acessa as duas unidades.
- Administra usuários, unidades, autorizações entre unidades e modelos clínicos.
- Configura quais perguntas e medidas aparecem para cada público.
- Visualiza indicadores consolidados e exporta relatórios.
- Não altera retroativamente consultas finalizadas.

O piloto não terá perfis de recepção ou paciente.

## 3. Públicos atendidos

O prontuário deverá suportar:

- crianças;
- adolescentes;
- adultos;
- idosos; e
- gestantes.

O perfil clínico do paciente determina as perguntas, medidas, referências e classificações exibidas. Mudanças de perfil relevantes, como início de gestação ou transição etária, não apagam registros anteriores.

## 4. Estrutura de navegação

O desenho aprovado é o **prontuário centrado no paciente**.

A navegação principal terá:

1. Início;
2. Pacientes;
3. Agenda;
4. Relatórios; e
5. Configurações, visível apenas ao coordenador.

Ao abrir um paciente, o profissional acessará:

- Resumo;
- Anamnese;
- Antropometria;
- Histórico;
- Prescrição; e
- Documentos.

O resumo exibirá dados de identificação, alertas clínicos, última consulta, principais indicadores e evolução recente. A interface será otimizada para computador e tablet, sem aplicativo móvel dedicado no piloto.

## 5. Direção visual

A identidade aprovada é **institucional**:

- azul profundo como cor principal;
- amarelo como cor de destaque;
- hierarquia visual formal e legível;
- componentes compactos para uso durante a consulta; e
- contraste e tamanho de texto adequados ao uso prolongado.

O protótipo usará o nome de trabalho **Saúde Nutricional**. A aplicação da logomarca e dos elementos oficiais depende do fornecimento dos arquivos e regras institucionais; até lá, o sistema não reproduzirá uma marca oficial não fornecida.

## 6. Arquitetura

A solução será uma aplicação web própria com os seguintes componentes:

1. **Interface web:** agenda, pacientes, prontuário, formulários, gráficos e painéis.
2. **Serviço de aplicação:** regras clínicas, fluxos de consulta, permissões, importações e relatórios.
3. **Autenticação e autorização:** login individual e controle de acesso por função e unidade.
4. **Banco relacional central:** dados de usuários, pacientes, consultas, medidas, formulários e documentos.
5. **Gerador de documentos:** PDFs clínicos e exportações gerenciais em PDF ou Excel.
6. **Trilha de auditoria:** registro de acessos e alterações relevantes.
7. **Rotina de backup:** cópias periódicas e procedimento testado de restauração.

O navegador nunca acessará diretamente registros clínicos sem passar pelas verificações de autenticação, função e unidade.

## 7. Módulos funcionais

### 7.1 Unidades e profissionais

- Duas unidades cadastradas no piloto.
- Vínculo principal do profissional com uma unidade.
- Autorização explícita e auditável para acesso à outra unidade.
- Visão consolidada exclusiva do coordenador.

### 7.2 Pacientes

- Cadastro direto no sistema.
- Importação por planilha.
- Busca por nome e identificadores institucionais disponíveis.
- Aviso de possível duplicidade antes da criação.
- Associação a uma unidade principal.
- Registro do público clínico e dados necessários às classificações.

### 7.3 Agenda

- Visualizações diária, semanal e mensal.
- Estados: agendado, confirmado, realizado, faltou e cancelado.
- Associação entre horário, unidade, nutricionista e paciente.
- Abertura direta do prontuário a partir do agendamento.
- Prevenção de conflito de horário do mesmo profissional.

O piloto não enviará mensagens ou lembretes automáticos.

### 7.4 Anamnese configurável

- Modelos separados por público.
- Perguntas padronizadas editáveis pelo coordenador.
- Tipos de campo: texto curto, texto longo, número, data, escolha única, múltipla escolha e sim/não.
- Campos obrigatórios configuráveis.
- Ativação, desativação e ordenação de perguntas.
- Versionamento do formulário.

Uma consulta mantém a versão da anamnese utilizada no momento do atendimento, mesmo que o coordenador altere o modelo depois.

### 7.5 Avaliação antropométrica

O conjunto disponível poderá incluir:

- peso;
- altura ou comprimento;
- IMC;
- circunferência da cintura;
- circunferência do quadril;
- relação cintura/quadril;
- outras circunferências;
- dobras cutâneas;
- percentual de gordura;
- massa muscular; e
- dados de bioimpedância.

O coordenador configura quais campos aparecem por público. Cada medida guarda valor, unidade, data, profissional e, quando necessário, método ou equipamento.

O sistema:

- calcula automaticamente os indicadores derivados;
- refaz cálculos quando um dado de entrada muda;
- mostra classificação, referência e versão utilizadas;
- alerta para valores improváveis;
- permite que o profissional confirme um valor atípico com justificativa; e
- não transforma um indicador isolado em diagnóstico automático.

As referências iniciais serão:

- padrões de crescimento da OMS para crianças de 0 a 5 anos;
- referência da OMS para crianças e adolescentes de 5 a 19 anos;
- orientações antropométricas do Ministério da Saúde para os demais públicos; e
- avaliação gestacional considerando a semana de gestação.

Tabelas e fórmulas clínicas não serão editáveis em tela. Sua atualização exigirá uma nova versão controlada da regra.

### 7.6 Consulta e anotações

Uma consulta começa como rascunho e recebe salvamento automático. Ela poderá conter:

- motivo e objetivos do atendimento;
- respostas da anamnese;
- avaliação antropométrica;
- observações clínicas;
- conduta;
- metas;
- orientações; e
- plano de acompanhamento.

Ao finalizar:

- a consulta entra na linha do tempo;
- o autor, a unidade, a data e o horário ficam registrados;
- o conteúdo clínico não pode ser sobrescrito ou apagado; e
- correções são registradas como complemento identificado, preservando o original.

### 7.7 Acompanhamento

- Linha do tempo com consultas, anotações, prescrições e documentos.
- Gráficos de peso, IMC, circunferências e demais medidas selecionadas.
- Comparação entre consultas.
- Indicação visual de evolução, sem produzir diagnóstico automático.
- Filtros por período e indicador.

### 7.8 Prescrição e documentos

- Plano alimentar por refeições, horários, alimentos, quantidades e substituições.
- Modelos reutilizáveis de orientações e receitas.
- Duplicação do plano anterior para edição em retornos.
- Solicitação de exames com modelo editável e justificativa clínica opcional.
- Versionamento dos documentos.
- Geração de PDF com paciente, unidade, nutricionista, data e espaço para assinatura.
- Preservação das versões anteriores.

Uma falha na geração do arquivo não poderá desfazer ou corromper a consulta salva.

### 7.9 Painel gerencial

O coordenador poderá analisar:

- atendimentos e retornos por período;
- comparação entre unidades;
- produção por nutricionista;
- perfil dos pacientes por público; e
- indicadores nutricionais consolidados.

Haverá filtros por período, unidade, profissional e público. O painel não exibirá textos de anotações clínicas. Os dados poderão ser exportados em PDF e Excel conforme as permissões do usuário.

## 8. Fluxos de dados

### Cadastro e importação

1. O profissional cadastra diretamente ou envia uma planilha.
2. A importação mostra uma prévia.
3. O sistema valida campos, unidade e possíveis duplicidades.
4. Linhas válidas e inválidas são apresentadas separadamente.
5. Nenhum registro é criado até a confirmação do usuário.

### Consulta

1. O nutricionista abre o paciente pela busca ou agenda.
2. O sistema verifica a unidade e a autorização.
3. A consulta é criada como rascunho.
4. Anamnese, medidas, notas e prescrição são salvas progressivamente.
5. Indicadores derivados são calculados e exibidos com referência.
6. O profissional revisa e finaliza.
7. O sistema grava a versão final e a trilha de auditoria.

### Relatórios

1. O coordenador escolhe filtros.
2. O serviço aplica restrições de acesso.
3. Os dados são agregados.
4. O arquivo é gerado sem incluir anotações clínicas textuais.
5. A emissão fica registrada.

## 9. Privacidade, segurança e integridade

- Login individual; contas compartilhadas não serão previstas.
- Permissões verificadas no servidor em toda operação.
- Conexões protegidas e armazenamento protegido.
- Sessões com expiração e recuperação segura de acesso.
- Registro de acesso entre unidades, exportações e alterações clínicas.
- Nenhum dado clínico sensível em mensagens técnicas ou logs comuns.
- Coleta somente dos dados necessários ao atendimento.
- Consultas finalizadas preservadas como registros imutáveis.
- Backups periódicos e teste de restauração.
- Documentos temporários removidos após a entrega ao usuário autorizado.

O piloto será construído com controles técnicos compatíveis com dados de saúde. A validação institucional de privacidade e governança deverá ocorrer antes do uso em produção.

## 10. Tratamento de erros

- Mensagens em linguagem simples para o usuário.
- Contexto técnico detalhado apenas em registro protegido.
- Rascunhos preservados em falhas de rede.
- Reenvio seguro de operações sem duplicar registros.
- Avisos de campos obrigatórios e unidades ausentes.
- Confirmação para valores antropométricos improváveis.
- Importações sem gravação parcial antes da confirmação.
- Falhas de PDF ou Excel isoladas do prontuário.
- Página de recuperação quando um módulo não puder carregar.

## 11. Estratégia de testes

O projeto exigirá no mínimo 80% de cobertura automatizada.

### Testes unitários

- Fórmulas e classificações por público.
- Validações de medidas e unidades.
- Regras de agenda.
- Regras de permissão.
- Versionamento de formulários e documentos.

### Testes de integração

- Cadastro e importação de pacientes.
- Criação, salvamento e finalização de consulta.
- Autorização entre unidades.
- Geração de PDF e Excel.
- Auditoria e preservação do histórico.

### Testes de ponta a ponta

- Fluxo completo do nutricionista.
- Fluxo completo do coordenador.
- Atendimento de cada público.
- Retorno com comparação de evolução.
- Tentativas de acesso não autorizado.
- Recuperação após falha durante rascunho ou geração de documento.

As fórmulas clínicas terão casos de teste baseados nas tabelas oficiais adotadas e serão revisadas por profissional habilitado antes do uso com pacientes reais.

## 12. Fora do escopo do piloto

- Aplicativo móvel nativo.
- Portal ou login do paciente.
- Perfil de recepção.
- Mensagens automáticas por WhatsApp, SMS ou e-mail.
- Integração em tempo real com outros sistemas do Sesc.
- Prescrição automática baseada em inteligência artificial.
- Diagnóstico automático.
- Base completa de composição nutricional para cálculo automático de calorias e macronutrientes.
- Funcionamento integral sem internet.

## 13. Evoluções possíveis

Após a validação do piloto:

- portal do paciente;
- lembretes de consulta;
- integração com sistemas institucionais;
- base nutricional e cálculo de nutrientes;
- assinatura digital;
- expansão para novas unidades; e
- aplicativo móvel.

## 14. Referências clínicas iniciais

- [OMS — padrões de crescimento de 0 a 5 anos](https://www.who.int/tools/child-growth-standards/standards/p)
- [OMS — IMC por idade de 5 a 19 anos](https://www.who.int/toolkits/growth-reference-data-for-5to19-years/indicators/bmi-for-age)
- [Ministério da Saúde — orientações para coleta e análise de dados antropométricos](https://www.gov.br/saude/pt-br/composicao/saps/vigilancia-alimentar-e-nutricional/arquivos/orientacoes-para-a-coleta-e-analise-de-dados-antropometricos-em-servicos-de-saude/view)
