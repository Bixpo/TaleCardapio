# Talê — Cardápio e Painel Administrativo

Projeto React + Vite com cardápio, carrinho, checkout e painel administrativo local.

## Executar
1. Instale Node.js LTS.
2. No terminal, dentro desta pasta, execute `npm install`.
3. Execute `npm run dev`.

## Painel administrativo
Acesse `/#admin` ou clique no ícone de cadeado no cabeçalho.

Credenciais iniciais:
- Usuário: `admin`
- Senha: `Tale@2026`

Esta é uma autenticação demonstrativa local, não uma proteção de servidor. Para trocar as credenciais iniciais, edite os valores padrão em `src/App.jsx` na função `adminLogin`. As credenciais são guardadas apenas no navegador se forem alteradas por código; não use esta versão para dados confidenciais.

## Funcionalidades
- Dashboard de pedidos, faturamento, pendências e clientes únicos.
- Lista de pedidos e atualização de status.
- Clientes agrupados por telefone e histórico resumido.
- Criar, editar e remover produtos.
- Exportar backup JSON de produtos e pedidos.

## Limitação importante do localStorage
Os pedidos e produtos são armazenados no navegador atual. Não existe sincronização entre celulares/computadores. Os dados podem ser apagados ao limpar dados do navegador. O backup baixa um arquivo JSON para guardar uma cópia.
