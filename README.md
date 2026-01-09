# 💰 Financialite

> Uma plataforma web completa para gerenciamento de finanças pessoais e controle de faturas

## 📋 Visão Geral

**Financialite** é uma aplicação moderna de gestão financeira desenvolvida com as melhores práticas de engenharia de software. Permite que usuários gerenciem suas faturas, transações e contas bancárias de forma intuitiva e eficiente.

A plataforma oferece um painel interativo com relatórios detalhados, categorização de despesas, suporte a faturas parceladas e recorrentes, além de exportação de dados para análise externa.

## ✨ Principais Funcionalidades

### 📊 Dashboard Inteligente
- Visão geral de receitas e despesas
- Gráficos mensais de resumo financeiro
- Categorias mais gastas com visualização top 5
- Estatísticas rápidas (total de receitas, despesas pendentes, etc.)
- Acesso rápido às ações mais comuns

### 💳 Gestão de Contas Bancárias
- Cadastro e organização de múltiplas contas bancárias
- Definição de dia de vencimento da fatura para cada conta
- Visualização de saldo e informações da conta
- Suporte a diferentes bancos

### 📝 Gerenciamento de Faturas
- Criação de faturas com título, descrição e valor
- Classificação por tipo (receita/despesa)
- Atribuição a contas e categorias específicas
- Visualização organizada por mês
- Marcação de pagamentos com datas
- Interface de carrossel para navegação entre meses

### 💰 Transações Avançadas
- Transações em crédito, débito e cartão de crédito
- Suporte a parcelamentos múltiplos
- Transações recorrentes (automáticas)
- Filtros por conta, categoria e tipo
- Busca por título/descrição
- Edição e exclusão de transações
- Soft delete para recuperação de dados

### 📈 Relatórios Detalhados
- Resumo mensal de receitas e despesas
- Análise de padrões de gastos
- Filtragem por conta e categoria
- Exportação de dados para Excel
- Gráficos de tendências financeiras

### 🏷️ Sistema de Categorias
- Criação de categorias personalizadas por usuário
- Categorização automática de transações
- Filtros avançados por categoria
- Gerenciamento completo de categorias

### 📤 Exportação de Dados
- Exportação de faturas pendentes para Excel
- Exportação de transações com formatação
- Suporte a múltiplos formatos
- Relatórios estruturados e prontos para análise

## 🛠️ Stack Tecnológico

### Backend
- **Framework**: Laravel 12 (PHP 8.2+)
- **ORM**: Eloquent
- **Autenticação**: Laravel Sanctum
- **Validação**: Laravel Validation
- **Migrações**: Database Migrations
- **Testing**: PHPUnit

### Frontend
- **Framework**: React 18
- **Roteamento**: Inertia.js (Server-Side Rendering com React)
- **Estilos**: Tailwind CSS 4
- **Formulários**: Headless UI/React
- **Gráficos**: Chart.js + react-chartjs-2
- **Animações**: Framer Motion
- **Notificações**: React Toastify
- **HTTP Client**: Axios

### Ferramentas de Build
- **Vite**: Bundler rápido e moderno
- **Node.js**: Runtime JavaScript
- **Composer**: Gerenciador de pacotes PHP
- **npm**: Gerenciador de pacotes Node.js

### Banco de Dados
- **SQLite/MySQL**: Database relacional
- **Migrations**: Versionamento de schema

## 📁 Estrutura do Projeto

```
Financialite/
├── app/
│   ├── Http/
│   │   ├── Controllers/      # Controladores da API
│   │   ├── Middleware/       # Middlewares customizados
│   │   └── Requests/         # Form Requests com validação
│   ├── Models/               # Modelos Eloquent
│   │   ├── User.php
│   │   ├── Fatura.php
│   │   ├── Bank.php
│   │   ├── BankUser.php
│   │   ├── Category.php
│   │   ├── Paid.php
│   │   └── Notification.php
│   └── Services/             # Lógica de negócio
│       └── FaturaService.php
├── database/
│   ├── migrations/           # Migrations do banco de dados
│   ├── seeders/              # Seeders para dados de teste
│   └── factories/            # Model factories
├── resources/
│   ├── js/
│   │   ├── Pages/            # Componentes de página (Inertia)
│   │   ├── Components/       # Componentes React reutilizáveis
│   │   ├── Layouts/          # Layouts compartilhados
│   │   ├── Lib/              # Utilidades e formatters
│   │   └── app.jsx           # Entrada React
│   ├── css/
│   │   └── app.css           # Estilos base
│   └── views/                # Views Blade (se necessário)
├── routes/
│   ├── web.php               # Rotas web (Inertia)
│   ├── api.php               # Rotas da API
│   ├── auth.php              # Rotas de autenticação
│   └── Fatura.php            # Rotas de faturas
├── config/                   # Configurações da aplicação
├── storage/                  # Arquivos gerados
├── tests/                    # Testes automatizados
├── public/                   # Arquivos públicos
├── bootstrap/                # Bootstrapping da aplicação
│
├── vite.config.js            # Configuração do Vite
├── tailwind.config.js        # Configuração do Tailwind
├── postcss.config.js         # Configuração do PostCSS
├── composer.json             # Dependências PHP
├── package.json              # Dependências JavaScript
└── artisan                   # CLI do Laravel
```

## 🚀 Como Começar

### Pré-requisitos
- PHP 8.2 ou superior
- Node.js 16+ e npm
- Composer
- Banco de dados (SQLite/MySQL)

### Instalação

1. **Clone o repositório**
   ```bash
   git clone <seu-repositorio>
   cd Financialite
   ```

2. **Instale as dependências PHP**
   ```bash
   composer install
   ```

3. **Instale as dependências JavaScript**
   ```bash
   npm install
   ```

4. **Configure o ambiente**
   ```bash
   cp .env.example .env
   php artisan key:generate
   ```

5. **Execute as migrações do banco de dados**
   ```bash
   php artisan migrate
   ```

6. **(Opcional) Popule dados de teste**
   ```bash
   php artisan db:seed
   ```

### Executar em Desenvolvimento

Use o comando de desenvolvimento que executa simultaneamente:
- Servidor PHP (port 8000)
- Processador de filas
- Logs em tempo real
- Vite dev server

```bash
npm run dev
```

Ou, se preferir rodar separadamente:

```bash
# Terminal 1 - Servidor Laravel
php artisan serve

# Terminal 2 - Vite dev server
npm run dev

# Terminal 3 - Processador de filas
php artisan queue:listen
```

### Build para Produção

```bash
npm run build
```

Isso compilará os assets com Vite e os otimizará para produção.

## 📚 Modelos de Dados

### User
- Usuário da aplicação
- Relacionamentos: `banks()`, `faturas()`, `categories()`
- Autenticação integrada com Sanctum

### Bank
- Banco/instituição financeira
- Relacionamentos: `users()`, `bankUsers()`, `faturas()`

### BankUser
- Conta bancária específica do usuário
- Armazena dia de vencimento da fatura
- Relacionamentos: `user()`, `bank()`, `faturas()`

### Fatura
- Transação/fatura (receita ou despesa)
- Suporta: parcelamentos, recorrência, diferentes status
- Soft delete para recuperação
- Relacionamentos: `user()`, `bankUser()`, `category()`, `paid()`
- Scopes: `forUser()`, `notStatus()`

### Category
- Categoria de despesa/receita
- Única por usuário (validação de unicidade)
- Relacionamentos: `user()`, `faturas()`

### Paid
- Registro de pagamento de fatura
- Rastreamento de datas de pagamento

### Notification
- Notificações do sistema para o usuário

## 🔌 API Endpoints

### Autenticação
- `POST /api/auth/register` - Registrar novo usuário
- `POST /api/auth/login` - Fazer login
- `POST /api/auth/logout` - Fazer logout

### Faturas
- `GET /api/faturas` - Listar faturas (com filtros)
- `POST /api/faturas` - Criar nova fatura
- `GET /api/faturas/{id}` - Detalhes da fatura
- `PATCH /api/faturas/{id}` - Atualizar fatura
- `DELETE /api/faturas/{id}` - Deletar fatura
- `GET /api/faturas/stats` - Estatísticas
- `GET /api/faturas/export_data` - Dados para exportação

### Contas Bancárias
- `GET /api/bank-users` - Listar contas do usuário
- `POST /api/bank-users` - Criar nova conta
- `PATCH /api/bank-users/{id}` - Atualizar conta

### Categorias
- `GET /api/categories` - Listar categorias
- `POST /api/categories` - Criar categoria
- `DELETE /api/categories/{id}` - Deletar categoria

### Perfil
- `GET /api/profile` - Dados do perfil
- `PATCH /api/profile` - Atualizar perfil
- `DELETE /api/profile` - Deletar conta

## 🎨 Componentes React Principais

### Pages (Inertia)
- **Dashboard** - Visão geral com estatísticas e gráficos
- **Fatura** - Gestão de faturas por mês
- **Transacao** - Lista e edição de transações
- **Relatorio** - Relatórios e análises
- **Conta** - Gestão de contas bancárias e categorias
- **About** - Informações sobre o projeto

### Componentes Reutilizáveis
- `StatCard` - Card de estatística
- `QuickActions` - Ações rápidas
- `MonthlySummaryChart` - Gráfico mensal
- `TopSpendingCategories` - Top 5 categorias
- `FaturaMonthSection` - Seção de faturas do mês
- `TransactionsList` - Lista de transações
- `Modal` - Modal genérico
- `Pagination` - Paginação
- Buttons: `PrimaryButton`, `SecondaryButton`, `DangerButton`

## 🔒 Segurança

- Autenticação com Laravel Sanctum
- Middleware de verificação de email (`verified`)
- Soft deletes para proteção de dados
- Validação em formulários (Form Requests)
- Proteção CSRF integrada
- Queries escoped por usuário (isolamento de dados)

## 🧪 Testes

A aplicação inclui suporte a testes com PHPUnit:

```bash
php artisan test
```

## 📊 Funcionalidades Futuras

- [ ] Autenticação multi-fator (2FA)
- [ ] Integração com bancos reais
- [ ] Aplicativo mobile (React Native)
- [ ] Previsões com IA
- [ ] Compartilhamento de dados com contador
- [ ] Alertas e notificações push
- [ ] Dashboard colaborativo

## 📝 Convenções de Código

### PHP
- PSR-12 para estilo de código
- Nomeação em snake_case para propriedades e métodos
- Tipagem forte com type hints

### JavaScript/React
- Componentes funcionais com hooks
- Nomeação em camelCase
- ESLint para consistência
- Prettier para formatação

### CSS
- Tailwind CSS para estilos utilitários
- BEM para componentes customizados
- Mobile-first responsive design

## 🤝 Contribuindo

1. Crie uma branch para sua feature: `git checkout -b feature/MinhaFeature`
2. Commit suas mudanças: `git commit -am 'Adiciona MinhaFeature'`
3. Push para a branch: `git push origin feature/MinhaFeature`
4. Abra um Pull Request

## 📄 Licença

Este projeto está licenciado sob a MIT License - veja o arquivo [LICENSE](LICENSE) para detalhes.

## 👨‍💻 Autor

Desenvolvido com ❤️ para simplificar a gestão financeira pessoal.

---

**Última atualização**: Janeiro de 2026
