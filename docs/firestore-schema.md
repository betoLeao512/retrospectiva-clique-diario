# Firebase Firestore — schema

Três coleções usadas no projeto: `fotos` (metadados de cada foto ativa, usada pela Galer.iA para sorteio), `poemas` (alimenta o Mural) e `cotasDiarias` (controle server-side do limite de 2 poemas/dia por visitante).

```
coleção: fotos
{
  id: "foto-13",
  arquivo: "foto-13.jpg",
  galeria: "guerreiros-do-mar",
  audioOriginalUrl: "..." | null,
  ativa: true,
  vezesExibida: 0,
  vezesEscolhida: 0
}

coleção: poemas
{
  id: auto,
  fotoId: "foto-13",
  emocaoSelecionada: "texto ou tag da emoção escolhida",
  textoLivre: "texto livre declarado pelo visitante" | null,
  poemaTexto: "...",
  audioUrl: "..." | null,
  visitanteId: "...",
  timestamp: serverTimestamp()
}

coleção: cotasDiarias
{
  id: "{visitanteId}_{YYYY-MM-DD}",
  count: 0
}
```

Campo `tags` (metadado curado por tema/elementos/local) foi removido do schema de `fotos` por ora — não existe fonte de dado pra isso ainda; pode ser adicionado no futuro se quiserem currar manualmente. Campo `ativa` foi adicionado — necessário pra query de sorteio da Galer.iA (`where('ativa', '==', true)`, ver `docs/galer-ia.md`). Em `poemas`, o antigo campo único `impressao` foi dividido em `emocaoSelecionada`/`textoLivre`; o campo antigo `deviceId` (controle client-side via `localStorage`, `galer-ia-poemas.js`) foi substituído por `visitanteId` — a cota de 2 poemas/dia passa a ser validada e reservada no servidor, pela Cloud Function `sentirFoto` (transação em `cotasDiarias`, ver `docs/galer-ia.md`), não só no cliente. `galer-ia-poemas.js` fica candidato a remoção/simplificação numa etapa futura — ainda escreve `photoId`/`deviceId` (nomes antigos), então não deve ser usado como referência de schema atual.

**Regras de segurança:** ver `firestore.rules`/`storage.rules` na raiz do repositório (leitura pública em `fotos`/`poemas`, escrita em `fotos` sempre bloqueada, criação em `poemas` validada por forma dos campos, `cotasDiarias` sem leitura/escrita pelo cliente — só via Admin SDK nas Cloud Functions, que ignoram as regras). Aplicar via `firebase deploy --only firestore:rules,storage` no terminal — `firebase.json` já aponta pros dois arquivos.
