# Firebase Firestore — schema

Duas coleções usadas no projeto: `fotos` (metadados de cada foto ativa, usada pela Galer.iA para sorteio) e `poemas` (alimenta o Mural).

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
  photoId: "foto-13",
  emocaoSelecionada: "texto ou tag da emoção escolhida" | null,
  textoLivre: "texto livre declarado pelo visitante" | null,
  poemaTexto: "...",
  audioUrl: "..." | null,
  deviceId: "...",
  timestamp: serverTimestamp()
}
```

Campo `tags` (metadado curado por tema/elementos/local) foi removido do schema de `fotos` por ora — não existe fonte de dado pra isso ainda; pode ser adicionado no futuro se quiserem currar manualmente. Campo `ativa` foi adicionado — necessário pra query de sorteio da Galer.iA (`where('ativa', '==', true)`, ver `docs/galer-ia.md`). Em `poemas`, o antigo campo único `impressao` foi dividido em `emocaoSelecionada`/`textoLivre`, e `deviceId` foi adicionado (controle de limite de 2 poemas por dia/dispositivo, ver `docs/galer-ia.md`).

**Regras de segurança:** ver `firestore.rules` na raiz do repositório (leitura pública em `fotos`/`poemas`, escrita em `fotos` sempre bloqueada, criação em `poemas` validada por forma dos campos, sem update/delete pelo cliente em nenhuma coleção). Aplicar manualmente no Console do Firebase (Firestore → Rules) — não há deploy automatizado via CLI configurado ainda.
