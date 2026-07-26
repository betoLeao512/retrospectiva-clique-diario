# CLAUDE.md — Retrospectiva Clique Diário

Instruções de trabalho para o Claude Code (e Cowork) neste repositório. Leia este arquivo por completo antes de qualquer tarefa. Documentação detalhada de subsistemas específicos vive em `docs/` — ver referências abaixo.

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
- `.gitignore` cobre `.DS_Store`, `**/.DS_Store` e `banco-reserva/`. Nunca forçar (`git add -f`) esses caminhos. `assets/audio/.DS_Store` foi removido retroativamente do rastreamento (`git rm --cached`) por estar versionado desde antes da regra existir.
- **Nomenclatura de arquivos:** nunca usar espaço ou acento em nomes de arquivo do repositório (ex: `hall.html`, não "Hall da Exposição.html") — quebra URL-encoding em links do GitHub Pages.
- **Alinhamento de elementos:** evitar posicionamento via `translateX`/`getBoundingClientRect` sem clamping de limites — pode quebrar em telas largas (ocorreu numa tentativa de alinhar um botão a uma letra específica de título no `index.html`; revertido).
- Notas de sessão soltas (ex: "Sessão - *.md") e screenshots na raiz não são commitados — não fazem parte do site.

## Arquitetura do site

Fluxo de navegação: Hero → Hall da Exposição → Galeria temática **ou** Galer.iA → (Galer.iA) → Mural. Sobre o Artista e Contato são acessíveis a qualquer momento pela navbar, fora desse fluxo.

| Página | Arquivo | Tipo |
|---|---|---|
| Início / Hero | `index.html` | estático |
| Hall da Exposição | `hall.html` | estático, 5 cards escritos à mão |
| Galerias temáticas | `galeria.html?id=...` | estático por ora (migração dinâmica pendente) |
| Galer.iA | `galeria-ia.html` | cópia independente de `galeria.html`, sem lógica própria ainda (ver `docs/galer-ia.md`) |
| Mural | `mural.html` | dinâmico, lê Firestore |
| Sobre o Artista | `artista.html` | estático |
| Contato | `contato.html` | estático |

### Navegação contextual "voltar" (`?voltar=`)
Convenção: `artista.html` e `contato.html` leem o parâmetro `?voltar=<id-da-galeria>` da URL. Se o valor corresponder a um id válido (`memorias-de-gigantes`, `guerreiros-do-mar`, `bico-do-papagaio`, `paisagens-peixeiras`), a navbar mostra "← Voltar para [Nome de Exibição]" apontando para `galeria.html?id=<id>`; caso contrário, o item fica oculto (evita duplicar com o "HALL DA EXPOSIÇÃO" fixo). `galeria.html` hoje passa `?voltar=memorias-de-gigantes` fixo nos links de O Artista/Contato, por ser a única galeria estática ainda.

⚠️ **Não implementado de fato:** `artista.html` e `contato.html` carregam `assets/js/voltar-contextual.js`, mas esse arquivo não existe no repositório — o item de nav fica sempre oculto (`display:none`) na prática. Ver Pendências.

### index.html — notas técnicas
- Hero: fotos de fundo em `assets/images/hero/foto1-6.jpg`, dissolvidas via `assets/js/hero-dissolve.js` (canvas). Overlay escurecido (~72–97% de opacidade) e `text-shadow` em pretitle/título/subtítulo/botões para garantir contraste sobre as fotos.
- Botões "Escuros primeiro" / "Claros primeiro": fundo mais escuro (0.8 de opacidade), alinhados dinamicamente via JS às bordas esquerda/direita do texto do subtítulo, recalculado no resize.
- Nav: apenas "O Artista" e "Contato" além do CTA principal — itens "Início" e "Galeria" removidos por redundância.
- CTA principal: texto atualizado para **"Entrar no Hall da Exposição"** (`btn-amber`). Seção "i.Alfa" (teaser) removida do `index.html` — não pertence a esta página.
- Subtítulo do hero: "O cotidiano visto com olhos que não se contentam em apenas olhar."
- Seção "Sobre a Exposição": 1 coluna (`col-lg-8`, texto abaixo do título) — versão de 2 colunas (`col-lg-5` + `col-lg-6 offset-lg-1`) foi abandonada por quebrar o alinhamento do botão em telas largas. Padding vertical reduzido (7rem → 4rem). Parágrafo com `text-align: justify` (sem `text-align-last: justify`), reescrito na última sessão em torno de "instantes que pediram para permanecer" e "luz, movimento e silêncio".

⚠️ **Link quebrado:** o botão do CTA principal (`id="btnHall"`) ainda tem `href="Hall da Exposição.html"` (nome antigo) em vez de `hall.html` — vai dar 404 no GitHub Pages. Ver Pendências.

### artista.html — notas técnicas
- Foto: `assets/images/alfa-bile.jpg` (substituiu o `.png` anterior).
- `.artist-photo-frame`: moldura sutil (`border: 1px solid rgba(200,146,42,0.14)`, `padding: 0.75rem`, fundo `var(--carbon)`), substituindo a antiga borda lateral de 2px.
- `.artist-photo`: `object-fit: cover`, `object-position: center top`, `filter: grayscale(15%)` — substitui o `aspect-ratio` fixo anterior.
- Assinatura: `.artist-signature-inline` usa `mask-image` com `assinatura-alfa.png`, colorida via `background-color: var(--ambar)`; `.artist-signature-onphoto` posiciona no canto inferior direito da foto, com `drop-shadow`.
- Layout responsivo: coluna de texto e coluna de foto usam `display: flex` + stretch (sem altura fixa em px), para a foto acompanhar a altura do texto lado a lado no desktop.
- "Itajaí, Santa Catarina · Brasil" (`.artist-sublabel`) dentro de `.artist-text-col`, `margin-top: auto`, `text-align: left`, alinhado à base da coluna. Fonte 13px, cor `#FFFFFF`.
- Tag "FOTÓGRAFO & ESCRITOR" (que ficava solta perto da bio) removida — redundante com o pretitle do cabeçalho da página.
- Nova bio do Alfa Bile: multidisciplinaridade (fotografia, pintura, poesia), colunas no Jornal Diarinho e Revista Sopa de Siri, prêmios resumidos na `.awards-strip`, formação em Artes Visuais em andamento.

⚠️ **Bug conhecido:** a regra de stretch (foto acompanhando a altura do texto) não deveria se aplicar no breakpoint empilhado (mobile/tela estreita) — nesse caso a foto precisa de um `aspect-ratio` fixo em vez de stretch. Ainda não corrigido. Ver Pendências.

### contato.html — notas técnicas
- Nav: item "Contato" removido (já é a página atual); "Galeria" renomeado para "Hall da Exposição".
- Criado `assets/js/contato.js` (estava referenciado no HTML mas nunca existia) — função `enviarContato()` monta um `mailto:` com nome, e-mail, assunto e mensagem do formulário. Sem backend — ver Pendências.
- Copy: pretitle do header "FALE COM O ARTISTA" → "FALE COM O ALFA"; footer "Projeto extensionista HOW5 · UNIVALI ADS · 2026" → "UNIVALI ADS · 2026".
- `.contact-section` padding vertical reduzido (top 5rem → 2rem; bottom 7rem → 3rem).

⚠️ **Bugs conhecidos no nav:** o link "Hall da Exposição" aponta para `galeria.html`, não `hall.html`; há também um `<li class="nav-item">` vazio sobrando na lista de navegação. Ver Pendências.

### Hall da Exposição (`hall.html`)
5 cards fixos (Memórias de Gigantes, Guerreiros do Mar, Sentinela de Pedra, Paisagens Peixeiras, Galer.iA), escritos à mão — não dinâmico, por ora. Animação "Revelação": cards emergem da escuridão um a um, funciona em touch/mobile. Cada card (exceto Galer.iA) é um `<a href="galeria.html">` simples (ainda sem `?id=...` — depende da migração dinâmica); o card da Galer.iA aponta para `galeria-ia.html`. Patrocinador aparece como banner sobreposto no topo da foto de cada card.

**Patrocinadores confirmados:**
| Galeria | Patrocinador |
|---|---|
| Memórias de Gigantes | JBS |
| Guerreiros do Mar | Colônia de Pescadores |
| Sentinela de Pedra | Univali |
| Paisagens Peixeiras | Secretaria de Urbanismo de Itajaí |
| Galer.iA | Intelbras |

**Padrão visual dos cards:** banner de apoio no topo da foto (`rgba(10,10,8,0.72)`, texto "APOIO: [nome]" em âmbar claro `#E8B96A`); botão "ENTRAR NA GALERIA" preenchimento âmbar sólido, texto `#0A0A08`, sem borda. Sem selo "GALERIA 0N" nem tags de contagem de fotos/áudio.

**Card da Galer.iA:** ver `docs/galer-ia.md` para o texto definitivo e o estado da correção pendente na linha secundária.

**Exceção em vigor — regra "trailer, não spoiler":** as capas dos 4 cards temáticos (`foto-08`, `foto-15`, `foto-30`, `foto-40`) pertencem às próprias galerias que representam — não há fotos de `banco-reserva/` qualificadas no momento. Aceito como está por ora.

### Galerias temáticas
Estado atual: `galeria.html` segue como página **estática** (exemplo fixo com as fotos de "Memórias de Gigantes") — a migração para o template dinâmico (`galeria.html?id=...` lendo `galerias.json`) ainda não foi feita. Comportamento do clique (já implementado): expande a foto em tela cheia, toca o áudio original do Alfa automaticamente, só um botão discreto ✕ para fechar. Sem i.Alfa, sem poema — isso é exclusivo da Galer.iA.

**Estilo do grid de fotos:** layout via **flexbox** (`flex-wrap`), não CSS Grid. Gap `16px` entre fotos, borda `1.5px solid #8A8070` em cada foto. Aplicado por ora na versão estática de `galeria.html`; **deve ser preservado ao migrar para o template dinâmico.**

**Estrutura de dados:** ver `docs/galerias-json-schema.md` para o formato completo do `galerias.json` e como adicionar uma galeria nova.

Galerias atuais (já criadas em `galerias.json`, confirmado):
| id | titulo (exibido) | fotos |
|---|---|---|
| `memorias-de-gigantes` | Memórias de Gigantes | foto-01 a foto-12, títulos/áudios reais |
| `guerreiros-do-mar` | Guerreiros do Mar | foto-13 a foto-24, títulos reais, áudio pendente |
| `bico-do-papagaio` | **Sentinela de Pedra** (nome novo, id técnico não mudou) | foto-25 a foto-36, títulos reais, áudio pendente |
| `paisagens-peixeiras` | Paisagens Peixeiras | foto-37 a foto-48, títulos reais, áudio pendente |

### Convenção de fotos e áudio

**Fotos ativas (em uso em alguma galeria):**
- Arquivo: `foto-NN.jpg`, numeração sequencial contínua, sem prefixo de galeria — a galeria de origem vive só no `galerias.json`.
- Todas juntas em `assets/images/`, sem subpastas por galeria.
- Estado atual: `foto-01.jpg` até `foto-48.jpg` (48 fotos, sem gaps, mais `alfa-bile.jpg` que é o retrato do artista, não conta como foto de galeria). Antes de processar fotos novas, sempre checar o próximo número livre: `ls assets/images/foto-*.jpg | sort -V | tail -1`.
- Áudio original do Alfa: mesmo número da foto, ex. `foto-13.mp3`, em `assets/audio/voz/`.
- Campos `titulo` e `audio` podem ficar como placeholder (`"TÍTULO PENDENTE"`, `null`) no JSON até serem preenchidos — isso não bloqueia o resto do pipeline.

**Fotos de capa exclusivas (Hall da Exposição):**
- Cada card do Hall usa uma foto de capa que, idealmente, **nunca** aparece dentro da própria galeria ("efeito trailer, não spoiler"). *(Ver exceção em vigor, seção "Hall da Exposição" acima.)*
- Se for uma foto nova, dedicada só à capa: nomear `capa-NOME.jpg` (ex: `capa-galeria-ia.jpg`), nunca usar o padrão `foto-NN.jpg`.

**Banco de reserva (fotos prontas, ainda sem destino):**
- Pasta `banco-reserva/` na raiz do projeto — fotos já otimizadas (`sips` já rodado) mas ainda não atribuídas a nenhuma galeria.
- Nomenclatura: `reserva-NNN.jpg`, sequencial, sem relação com a numeração de `assets/images/`.
- **Nunca entra no Git** — deve estar listada no `.gitignore`.
- "Promover" uma foto da reserva para ativa: mover e renomear (`mv banco-reserva/reserva-007.jpg assets/images/foto-49.jpg`), sem precisar rodar `sips` de novo.

## Galer.iA (`galeria-ia.html`)

Ver `docs/galer-ia.md` para a lógica completa de sorteio/rotação, estados da foto no grid, texto do card no Hall e o convite de e-mail pós-poema (schema, LGPD, extensão Trigger Email — ainda não implementado).

## Mural (`mural.html`)

- Feed cronológico, sem filtro por galeria (por ora).
- Card: miniatura da foto (clicável, expande em tela cheia só com ✕, sem áudio) + impressão declarada (como legenda/tag) + poema completo em texto + galeria de origem + timestamp.
- Fonte de dados: coleção `poemas` no Firestore, ordenada por `timestamp`, com `onSnapshot()` para atualização em tempo real.

## Firebase Firestore — schema

Coleções `fotos` (metadados usados pela Galer.iA) e `poemas` (alimenta o Mural). Ver `docs/firestore-schema.md` para o schema completo de cada uma.

## Design system

Cores: Background `#0A0A08`, Carbon `#111110`, Âmbar `#C8922A`, Âmbar claro `#E8B96A`, Texto `#D4CFC4`, Texto suave `#8A8070`, Branco osso `#F0EBE0`.
Tipografia: Cormorant Garamond (títulos), Cinzel (tags), Raleway (corpo/UI).
Stack: HTML/CSS/JS puro, Bootstrap 5.3.3 (navbar/botões), **flexbox** para o grid de fotos das galerias (gap `16px`, borda `1.5px solid #8A8070` por foto).
Botões `.btn-amber` (classe global, afeta o site todo): peso de fonte 700, texto `#0A0A08` — ajustado para mais contraste sobre o fundo âmbar.

## Pendências conhecidas

- Áudio das fotos foto-13 a foto-48 — aguardando o Alfa.
- Confirmar com o Alfa se o nome "Sentinela de Pedra" (trocado de "No Bico do Papagaio" por decisão do Leao) é aprovado.
- Possíveis fotos repetidas entre as 37 fotos novas — Leao vai revisar com o Alfa.
- Confirmar se a foto de capa da Galer.iA (`capa-galeria-ia.jpg`) é definitiva ou placeholder.
- Implementar `assets/js/voltar-contextual.js` — referenciado em `artista.html` e `contato.html`, mas o arquivo não existe; a navegação "voltar" contextual está sem efeito prático.
- Corrigir `href` do link "Hall da Exposição" em `contato.html` (aponta para `galeria.html`, deveria ser `hall.html`) e remover o `<li class="nav-item">` vazio.
- Corrigir `href` do botão CTA principal em `index.html` (`href="Hall da Exposição.html"` → `hall.html`).
- Corrigir a linha secundária do card da Galer.iA em `hall.html` (erro de digitação "Deixe o i.Alfa vai criar...") — o parágrafo principal já está com o texto definitivo.
- Corrigir breakpoint responsivo de `artista.html`: a foto não deveria usar stretch quando as colunas empilham (mobile) — precisa de `aspect-ratio` fixo nesse caso.
- Considerar aplicar a assinatura do Alfa também em `index.html` (decisão ainda não tomada).
- Confirmar se mais alguma página precisa do nav contextual "voltar" além de `artista.html`/`contato.html`/`galeria.html`.
- `assets/js/contato.js` usa mailto simples — considerar backend/serviço de envio mais robusto no futuro.
- Substituir as fotos de capa do Hall (`foto-08`, `foto-15`, `foto-30`, `foto-40`) por fotos dedicadas do `banco-reserva/` quando houver opções qualificadas, para respeitar a regra "trailer, não spoiler".
- Criação do projeto Firebase (console, chaves de API) — só o Leao pode fazer isso, não é tarefa de código.
- Configuração do provedor de e-mail (SendGrid ou similar) para a extensão "Trigger Email" — tarefa do Leao, não de código.
- Migração de `galeria.html` para template dinâmico (`galeria.html?id=...` lendo `galerias.json`) — arquitetura definida, implementação ainda não iniciada; inclui atualizar os cards do Hall para usar `?id=...`.
- Mecanismo de descadastro da lista de `contatos` — não bloqueia lançamento, mas necessário antes de qualquer campanha de divulgação futura usando essa lista.
- Verificar se a pasta local antiga do usuário (com seu próprio `galeria-ia.html`, `galerias.json`, `banco-reserva/`, `CLAUDE.md`) ainda precisa ser sincronizada com este repositório, ou se já foi resolvido.
