# BarberPro Database Setup Guide

Este guia explica como configurar o banco de dados Supabase para o BarberPro.

## Arquivos de Script SQL

### 1. `scripts/001_create_barbershop_schema.sql`
**O que faz:** Cria toda a estrutura do banco de dados com:
- 10 tabelas principais (barbershops, profiles, barbers, services, clients, appointments, working_hours, whatsapp_conversations, whatsapp_messages, transactions)
- Políticas de Row Level Security (RLS) para cada tabela
- Triggers automáticos para criar profiles e atualizar timestamps
- Índices para otimizar queries

**Como usar:**
1. Vá para Supabase Dashboard > SQL Editor
2. Crie um novo query
3. Copie e cole TODO o conteúdo de `001_create_barbershop_schema.sql`
4. Execute o script

**O que esperar:**
- Tabelas são criadas com `IF NOT EXISTS`, então é seguro executar múltiplas vezes
- RLS policies garantem que usuários só acessem dados da sua barbearia
- Triggers automáticos criam profiles para novos usuários

### 2. `scripts/002_seed_demo_data.sql` (Opcional)
**O que faz:** Insere dados de exemplo para testes e desenvolvimento

**Como usar:**
1. ANTES de executar, você PRECISA:
   - Criar um usuário via Supabase Auth
   - Copiar o UUID do usuário
   - Substituir `'user-uuid-to-replace'` pelo UUID real no script

2. Vá para Supabase Dashboard > SQL Editor
3. Copie e cole o conteúdo de `002_seed_demo_data.sql`
4. Substitua `'user-uuid-to-replace'` pelo seu UUID
5. Execute

**O que será criado:**
- 1 Barbershop (barbearia)
- 5 Services (serviços: Haircut, Beard Trim, Fade, Full Grooming)
- 3 Barbers (barbeiros: John, Carlos, Mike)
- Working Hours para segunda a sábado

## Estrutura do Banco de Dados

### Tabelas Principais

**barbershops** - Tenants (barbearias)
```sql
- id: UUID (primary key)
- owner_id: UUID (ref auth.users - o dono da barbearia)
- name: TEXT
- slug: TEXT (único)
- address, city, state, zip_code, country: TEXT
- phone, email, website: TEXT
- logo_url, cover_image_url: TEXT
- primary_color, secondary_color: TEXT
- timezone, currency: TEXT
- is_active: BOOLEAN
```

**profiles** - Perfis de usuários
```sql
- id: UUID (ref auth.users)
- barbershop_id: UUID (ref barbershops)
- email: TEXT
- first_name, last_name: TEXT
- role: TEXT ('super_admin', 'owner', 'manager', 'barber', 'client')
- avatar_url: TEXT
```

**barbers** - Barbeiros/funcionários
```sql
- id: UUID
- barbershop_id: UUID (ref barbershops)
- user_id: UUID (ref auth.users - opcional)
- first_name, last_name: TEXT
- email, phone: TEXT
- bio, avatar_url: TEXT
- specialties: TEXT[]
- commission_rate: DECIMAL
- is_active: BOOLEAN
```

**services** - Serviços oferecidos
```sql
- id: UUID
- barbershop_id: UUID
- name: TEXT
- description: TEXT
- category: TEXT (Haircut, Beard, Package, etc)
- duration_minutes: INTEGER
- price: DECIMAL
- is_active: BOOLEAN
```

**clients** - Clientes/usuários dos clientes
```sql
- id: UUID
- barbershop_id: UUID
- user_id: UUID (ref auth.users - opcional)
- first_name, last_name: TEXT
- email, phone: TEXT
- notes: TEXT
- is_vip: BOOLEAN
- total_visits: INTEGER
- total_spent: DECIMAL
```

**appointments** - Agendamentos
```sql
- id: UUID
- barbershop_id: UUID
- barber_id: UUID (ref barbers)
- client_id: UUID (ref clients - opcional)
- service_id: UUID (ref services - opcional)
- start_time, end_time: TIMESTAMPTZ
- duration_minutes: INTEGER
- total_price: DECIMAL
- status: TEXT ('pending', 'confirmed', 'in_progress', 'completed', 'cancelled', 'no_show')
- notes: TEXT
```

**working_hours** - Horários de funcionamento
```sql
- id: UUID
- barbershop_id: UUID
- barber_id: UUID (opcional - horários de um barbeiro específico)
- day_of_week: INTEGER (0=Domingo, 1=Segunda, ..., 6=Sábado)
- start_time, end_time: TIME
- is_available: BOOLEAN
```

**whatsapp_conversations** - Conversas WhatsApp
```sql
- id: UUID
- barbershop_id: UUID
- phone_number: TEXT
- client_id: UUID (opcional)
- current_flow: TEXT (scheduling, reports)
- flow_state: JSONB (dados da conversa)
- last_message_at: TIMESTAMPTZ
```

**whatsapp_messages** - Histórico de mensagens WhatsApp
```sql
- id: UUID
- conversation_id: UUID
- barbershop_id: UUID
- direction: TEXT ('inbound', 'outbound')
- message_type: TEXT (text, list, buttons, etc)
- content: TEXT
- metadata: JSONB
```

**transactions** - Transações financeiras
```sql
- id: UUID
- barbershop_id: UUID
- appointment_id: UUID (opcional)
- transaction_type: TEXT ('income', 'expense', 'refund')
- amount: DECIMAL
- description: TEXT
- category: TEXT
- payment_method: TEXT
```

## Como o Fluxo de Registro Funciona

1. **Usuário se registra** em `/auth/sign-up`
   - Submete: email, password, first_name, last_name, barbershop_name

2. **Supabase Auth cria usuário**
   - UUID é gerado automaticamente
   - Trigger `on_auth_user_created` executa automaticamente

3. **Trigger cria profile**
   - Profile com role='owner' é criado
   - Email é armazenado no profile

4. **Frontend chama `/api/barbershop/setup`**
   - API cria:
     - Barbershop com owner_id = user.id
     - 4 Services padrão (Haircut, Beard Trim, Fade, Full Grooming)
     - Working hours (segunda a sábado, 9am-6pm)
   - Profile é atualizado com barbershop_id e role='owner'

5. **Usuário é redirecionado para `/auth/sign-up-success`**
   - Após confirmar email, pode acessar `/admin`

## RLS (Row Level Security) - Segurança

Todas as tabelas têm RLS habilitado. Regras padrão:

- **SELECT:** Usuário vê dados da sua barbershop e dados públicos
- **INSERT:** Apenas staff (owner, manager, barber) pode inserir dados da sua barbershop
- **UPDATE:** Apenas owners/managers podem editar
- **DELETE:** Apenas owners/managers podem deletar

Exemplo de policy para `services`:
```sql
-- Usuário vê serviços da sua barbearia
SELECT: barbershop_id IN (SELECT barbershop_id FROM profiles WHERE id = auth.uid())

-- Apenas manager+ pode adicionar
INSERT: barbershop_id IN (SELECT barbershop_id FROM profiles 
        WHERE id = auth.uid() AND role IN ('owner', 'manager', 'super_admin'))
```

## Índices de Performance

Índices criados para otimizar queries comuns:
- `barbershops(owner_id, slug)`
- `profiles(barbershop_id, role)`
- `barbers(barbershop_id, user_id)`
- `services(barbershop_id)`
- `appointments(barbershop_id, barber_id, scheduled_at, status)`
- `whatsapp_conversations(barbershop_id, phone_number)`
- `transactions(barbershop_id, transaction_type)`

## Dicas de Uso

### Para desenvolver localmente:
1. Execute o script 001_create_barbershop_schema.sql
2. Execute o script 002_seed_demo_data.sql com um UUID de teste
3. Use as credenciais Supabase localmente

### Para produção:
1. Execute apenas 001_create_barbershop_schema.sql
2. Não use 002_seed_demo_data.sql
3. Certifique-se que RLS está habilitado
4. Monitore performance com índices

### Para debug:
```sql
-- Ver todas as policies
SELECT tablename, policyname FROM pg_policies;

-- Ver triggers
SELECT trigger_name, event_manipulation, event_object_table FROM information_schema.triggers;

-- Ver índices
SELECT schemaname, tablename, indexname FROM pg_indexes WHERE schemaname = 'public';
```

## Troubleshooting

### "Sua barbearia está sendo configurada..."
- **Causa:** Nenhuma barbearia encontrada para o usuário
- **Solução:** Execute `/api/barbershop/setup` manualmente ou registre-se novamente

### "Permission denied" ao acessar dados
- **Causa:** RLS policy bloqueando acesso
- **Solução:** Verifique que o perfil tem `barbershop_id` e role correto

### Banco de dados vazio após setup
- **Causa:** Trigger do usuário não executou
- **Solução:** Verifique que o script 001_create_barbershop_schema.sql foi executado completamente

## Próximos Passos

1. ✅ Banco de dados está pronto
2. Execute a API `/api/barbershop/setup` via sign-up
3. Acesse `/admin` para gerenciar dados
4. Use WhatsApp bot em `/api/whatsapp/webhook`
