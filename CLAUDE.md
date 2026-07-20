# CLAUDE.md — Retrospectiva Clique Diário

Instruções de trabalho para o Claude Code (e Cowork) neste repositório. Leia este arquivo por completo antes de qualquer tarefa.

Site: https://betoleao512.github.io/retrospectiva-clique-diario
Repositório: https://github.com/betoLeao512/retrospectiva-clique-diario (único válido — nunca usar `retrospectivaClickDiario` camelCase como remote)

## Regras de trabalho (sempre válidas)

- Nunca explorar arquivos fora do escopo da tarefa pedida.
- Sempre mostrar o plano antes de editar qualquer arquivo.
- Mostrar as mudanças uma de cada vez, não em lote.
- Nunca instalar dependências sem aprovação explícita.
- Usar Plan Mode como padrão.
- Antes de qualquer `git rebase` ou `git push`, confirmar a remote com `git remote -v`.
- Testar localmente (`python3 -m http.server 8080`) antes de qualquer commit.
- Otimizar imagens com `sips -Z 2000 -s format jpeg -s formatOptions 80` antes de adicionar ao repositório.
- Commit pattern: `git add . && git commit -m "..." && git push`.

## Arquitetura do site

Fluxo de navegação: Hero → Hall da Exposição → Galeria temática **ou** Galer.iA → (Galer.iA) → Mural. Sobre o Artista e Contato são acessíveis a qualquer momento pela navbar, fora desse fluxo.

| Página | Arquivo | Tipo |
|---|---|---|
| Início / Hero | `index.html` | estático |
| Hall da Exposição | `hall.html` | estático, 4 cards escritos à mão |
| Galerias temáticas | `galeria.html?id=...` | dinâmico, lê `galerias.json` |
| Galer.iA | `galeria-ia.html` | próprio, lógica distinta |
| Mural | `mural.html` | dinâmico, lê Firestore |
| Sobre o Artista | `artista.html` | estático |
| Contato | `contato.html` | estático |

### Hall da Exposição
4 cards fixos (Guerreiros do Mar, No Bico do Papagaio, Paisagens Peixeiras, Memórias de Gigantes), escritos à mão em `hall.html` — não dinâmico, por ora. Animação "Revelação": cards emergem da escuridão um a um, funciona em touch/mobile. Cada card é um `<a href="galeria.html?id=...">` simples. Patrocinador (quando houver) aparece discreto ao lado do card, nunca dentro da galeria.

### Galerias temáticas (dinâmicas)
Template único `galeria.html` lê `galerias.json` via `fetch()`, filtra pelo `id` da query string, e monta o grid dinamicamente. Comportamento do clique: expande a foto em tela cheia, toca o áudio original do Alfa automaticamente, só um botão discreto ✕ para fechar. Sem i.Alfa, sem poema — isso é exclusivo da Galer.iA.

### galerias.json — estrutura
```json
{
  "galerias": [
    {
      "id": "guerreiros-do-mar",
      "titulo": "Guerreiros do Mar",
      "patrocinador": null,
      "fotos": [
        { "arquivo": "foto-13.jpg", "titulo": "TÍTULO PENDENTE", "audio": null }
      ]
    }
  ]
}
```
Galerias atuais: `guerreiros-do-mar`, `bico-do-papagaio`, `paisagens-peixeiras`, e a já existente (navios/Porto — id a confirmar). Para adicionar uma galeria nova: só editar este JSON, nunca criar HTML novo.

### Convenção de fotos e áudio
- Arquivo de foto: `foto-NN.jpg`, numeração sequencial contínua (`foto-13.jpg` em diante), sem prefixo de galeria no nome — a galeria de origem vive só no `galerias.json`.
- Todas as fotos ficam juntas em `assets/images/`, sem subpastas por galeria.
- Áudio original do Alfa: mesmo número da foto, ex. `foto-13.mp3`, em `assets/audio/voz/`.
- Campos `titulo` e `audio` podem ficar como placeholder (`"TÍTULO PENDENTE"`, `null`) no JSON até serem preenchidos — isso não bloqueia o resto do pipeline.

## Galer.iA (`galeria-ia.html`)

- 12 fotos sorteadas do banco total (todas as fotos de todas as galerias), usando **rotação controlada** — não puramente aleatório. O algoritmo prioriza as fotos com menor `vezesExibida`, sorteia dentro de um pool das menos exibidas, e incrementa o contador no Firestore a cada sorteio.
- O sorteio acontece uma vez por visita e fica salvo em `sessionStorage` — reentrar na mesma sessão não sorteia de novo.
- Visitante pode escolher **até 2 fotos distintas** por visita.
- Estados de cada foto no grid:
  - Não escolhida, com cota disponível → hover "✦ Sentir", clique abre fluxo de impressão → poema do i.Alfa (Claude API + ElevenLabs).
  - Já escolhida nesta visita → selo "✦ Sentida" (âmbar), clique toca o áudio original do Alfa (bônus).
  - Não escolhida, cota de 2 esgotada → mesmo comportamento das galerias temáticas (clique → expande → áudio original).
- Sem monetização, sem créditos, sem votação — experiência 100% gratuita.
- `vezesEscolhida` incrementado no Firestore quando o visitante gera um poema — alimenta um ranking de popularidade **interno**, não público, para análise pós-exposição.

## Mural (`mural.html`)

- Feed cronológico, sem filtro por galeria (por ora).
- Card: miniatura da foto (clicável, expande em tela cheia só com ✕, sem áudio) + impressão declarada (como legenda/tag) + poema completo em texto + galeria de origem + timestamp.
- Fonte de dados: coleção `poemas` no Firestore, ordenada por `timestamp`, com `onSnapshot()` para atualização em tempo real.

## Firebase Firestore — schema

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

## Design system

Cores: Background `#0A0A08`, Carbon `#111110`, Âmbar `#C8922A`, Âmbar claro `#E8B96A`, Texto `#D4CFC4`, Texto suave `#8A8070`, Branco osso `#F0EBE0`.
Tipografia: Cormorant Garamond (títulos), Cinzel (tags), Raleway (corpo/UI).
Stack: HTML/CSS/JS puro, Bootstrap 5.3.3 (navbar/botões), CSS Grid puro (galeria).

## Pendências conhecidas

- Título e áudio de várias fotos novas — aguardando o Alfa.
- Nome de arquivo do `id` da galeria de navios/Porto (Memórias de Gigantes) — confirmar no JSON.
- Criação do projeto Firebase (console, chaves de API) — só o Leao pode fazer isso, não é tarefa de código.
