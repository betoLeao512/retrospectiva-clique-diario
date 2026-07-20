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
- `.gitignore` já existe na raiz — cobre `.DS_Store` e `banco-reserva/`. Nunca forçar (`git add -f`) esses caminhos.

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
5 cards fixos (Memórias de Gigantes, Guerreiros do Mar, Sentinela de Pedra, Paisagens Peixeiras, Galer.iA), escritos à mão em `hall.html` — não dinâmico, por ora. Animação "Revelação": cards emergem da escuridão um a um, funciona em touch/mobile. Cada card (exceto Galer.iA) é um `<a href="galeria.html?id=...">` simples; o card da Galer.iA aponta para `galeria-ia.html`. Patrocinador (quando houver) aparece discreto ao lado do card, nunca dentro da galeria — só nome por extenso, tipografado (Cinzel, texto suave `#8A8070`), sem logotipo/imagem de marca.

**Patrocinadores da maquete atual (fictícios, só para avaliação interna de Marketing — não confirmados):**
| Galeria | Patrocinador |
|---|---|
| Memórias de Gigantes | JBS |
| Guerreiros do Mar | Colônia de Pescadores |
| Sentinela de Pedra | *(sem patrocinador definido)* |
| Paisagens Peixeiras | Secretaria de Urbanismo de Itajaí |
| Galer.iA | Intelbras |

**Card da Galer.iA:** categoria "EXPERIÊNCIA IMERSIVA", tags "Sorteio de fotos · Poema personalizado por IA" (não usa "N fotografias · Áudio-narração" como as demais, já que não tem número fixo de fotos). Imagem de capa deve ser uma foto real do Alfa (nunca gerada por IA) — a Galer.iA não tem banco de fotos exclusivo, sorteia do mesmo banco das galerias temáticas.

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
Galerias atuais (já criadas em `galerias.json`, confirmado):
| id | titulo (exibido) | fotos |
|---|---|---|
| `memorias-de-gigantes` | Memórias de Gigantes | foto-01 a foto-12, títulos/áudios reais |
| `guerreiros-do-mar` | Guerreiros do Mar | foto-13 a foto-24, placeholder |
| `bico-do-papagaio` | **Sentinela de Pedra** (nome novo, id técnico não mudou) | foto-25 a foto-36, placeholder |
| `paisagens-peixeiras` | Paisagens Peixeiras | foto-37 a foto-49, placeholder |

Para adicionar uma galeria nova: só editar este JSON, nunca criar HTML novo.

**Atenção — duplicidade conhecida:** `foto-01.jpg` e `foto-03.jpg` compartilham o título "Entre Redes e Gigantes" no JSON atual. Isso veio assim do Alfa — não é erro de digitação nosso, mas ainda não foi confirmado se é intencional. Não "corrigir" isso sem confirmação explícita do Leao/Alfa.

### Convenção de fotos e áudio

**Fotos ativas (em uso em alguma galeria):**
- Arquivo: `foto-NN.jpg`, numeração sequencial contínua, sem prefixo de galeria — a galeria de origem vive só no `galerias.json`.
- Todas juntas em `assets/images/`, sem subpastas por galeria.
- Estado atual: `foto-01.jpg` até `foto-50.jpg` (50 fotos, mais `alfa-bile.jpg` que é o retrato do artista, não conta como foto de galeria). Antes de processar fotos novas, sempre checar o próximo número livre: `ls assets/images/foto-*.jpg | sort -V | tail -1`.
- Áudio original do Alfa: mesmo número da foto, ex. `foto-13.mp3`, em `assets/audio/voz/`.
- Campos `titulo` e `audio` podem ficar como placeholder (`"TÍTULO PENDENTE"`, `null`) no JSON até serem preenchidos — isso não bloqueia o resto do pipeline.

**Fotos de capa exclusivas (Hall da Exposição):**
- Cada card do Hall usa uma foto de capa que **nunca** aparece dentro da própria galeria ("efeito trailer, não spoiler") — pode ser uma foto de `assets/images/` que pertence a OUTRA galeria, ou uma foto nova dedicada.
- Se for uma foto nova, dedicada só à capa (nunca vai para dentro de nenhuma galeria): nomear `capa-NOME.jpg` (ex: `capa-guerreiros.jpg`), nunca usar o padrão `foto-NN.jpg` para essas — evita que alguém confunda com foto de galeria e a adicione por engano ao JSON.

**Banco de reserva (fotos prontas, ainda sem destino):**
- Pasta `banco-reserva/` na raiz do projeto — fotos já otimizadas (`sips` já rodado) mas ainda não atribuídas a nenhuma galeria.
- Nomenclatura: `reserva-NNN.jpg`, sequencial, sem relação com a numeração de `assets/images/`.
- **Nunca entra no Git** — deve estar listada no `.gitignore`.
- "Promover" uma foto da reserva para ativa: mover e renomear (`mv banco-reserva/reserva-007.jpg assets/images/foto-51.jpg`), sem precisar rodar `sips` de novo — ela já foi otimizada ao entrar na reserva.

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

- Título e áudio das fotos foto-13 a foto-50 — aguardando o Alfa.
- Confirmar com o Alfa se a duplicidade de título em `foto-01`/`foto-03` ("Entre Redes e Gigantes") é intencional.
- Confirmar com o Alfa se o nome "Sentinela de Pedra" (trocado de "No Bico do Papagaio" por decisão do Leao) é aprovado.
- Possíveis fotos repetidas entre as 37 fotos novas — Leao vai revisar com o Alfa.
- Patrocinador da galeria "Sentinela de Pedra" ainda não definido, nem para maquete.
- Criação do projeto Firebase (console, chaves de API) — só o Leao pode fazer isso, não é tarefa de código.
- `hall.html` e `galeria-ia.html` ainda não implementados — decisão de arquitetura fechada, mas os arquivos em si ainda não existem no repositório.
