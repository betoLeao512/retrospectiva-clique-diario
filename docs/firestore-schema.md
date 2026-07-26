# Firebase Firestore — schema

Duas coleções usadas no projeto: `fotos` (metadados de cada foto ativa, usada pela Galer.iA para sorteio) e `poemas` (alimenta o Mural).

```
coleção: fotos
{
  id: "foto-13",
  arquivo: "foto-13.jpg",
  galeria: "guerreiros-do-mar",
  tags: { tema: "...", elementos: [...], local: "..." },
  audioOriginalUrl: "...",
  vezesExibida: 0,
  vezesEscolhida: 0
}

coleção: poemas
{
  id: auto,
  photoId: "foto-13",
  impressao: "texto declarado pelo visitante",
  poemaTexto: "...",
  audioUrl: "...",
  timestamp: serverTimestamp()
}
```
