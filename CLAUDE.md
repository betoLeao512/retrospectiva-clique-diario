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
- **Nomenclatura de arquivos:** nunca usar espaço ou acento em nomes de arquivo do repositório (ex: `hall.html`, não "Hall da Exposição.html") — quebra URL-encoding em links do GitHub Pages.
- **Alinhamento de elementos:** evitar posicionamento via `translateX`/`getBoundingClientRect` sem clamping de limites — pode quebrar em telas largas (ocorreu numa tentativa de alinhar um botão a uma letra específica de título no `index.html`; revertido).

## Arquitetura do site

Fluxo de navegação: Hero → Hall da Exposição → Galeria temática **ou** Galer.iA → (Galer.iA) → Mural. Sobre o Artista e Contato são acessíveis a qualquer momento pela navbar, fora desse fluxo.

| Página | Arquivo | Tipo |
|---|---|---|
| Início / Hero | `index.html` | estático |
| Hall da Exposição | `hall.html` | estático, 5 cards escritos à mão |
| Galerias temáticas | `galeria.html?id=...` | estático por ora (migração dinâmica pendente) |
| Galer.iA | `galeria-ia.html` | próprio, lógica distinta (recriação pendente — ver Pendências) |
| Mural | `mural.html` | dinâmico, lê Firestore |
| Sobre o Artista | `artista.html` | estático |
| Contato | `contato.html` | estático |

### index.html — notas técnicas
- Hero: fotos de fundo em `assets/images/hero/foto1-6.jpg`, dissolvidas via `assets/js/hero-dissolve.js` (canvas). Overlay escurecido (~72–97% de opacidade) e `text-shadow` em pretitle/título/subtítulo/botões para garantir contraste sobre as fotos.
- Botões "Escuros primeiro" / "Claros primeiro": fundo mais escuro (0.8 de opacidade), alinhados dinamicamente via JS às bordas esquerda/direita do texto do subtítulo, recalculado no resize.
- Nav: apenas "O Artista" e "Contato" além do CTA principal — itens "Início" e "Galeria" removidos por redundância.
- CTA principal trocado de "Ver a Galeria" para "Entrar no Hall das Galerias" (`btn-amber`, preenchido). Seção "i.Alfa" (teaser) removida do `index.html` — não pertence a esta página.
- Seção "Sobre a Exposição": 1 coluna (`col-lg-8`, texto abaixo do título) — versão de 2 colunas (`col-lg-5` + `col-lg-6 offset-lg-1`) foi abandonada por quebrar o alinhamento do botão em telas largas. Padding vertical reduzido (7rem → 4rem). Parágrafo com `text-align: justify` (sem `text-align-last: justify` — a linha final não deve esticar).

### Hall da Exposição (`hall.html`)
5 cards fixos (Memórias de Gigantes, Guerreiros do Mar, Sentinela de Pedra, Paisagens Peixeiras, Galer.iA), escritos à mão — não dinâmico, por ora. Animação "Revelação": cards emergem da escuridão um a um, funciona em touch/mobile. Cada card (exceto Galer.iA) é um `<a href="galeria.html?id=...">` simples; o card da Galer.iA aponta para `galeria-ia.html`. Patrocinador (quando houver) aparece discreto ao lado do card, nunca dentro da galeria — só nome por extenso, tipografado (Cinzel, texto suave `#8A8070`), sem logotipo/imagem de marca.

Sem selo "GALERIA 0N" acima do título (removido). Padding-top do header e padding-bottom do grid reduzidos e igualados ao padrão de `galeria.html` (~3rem topo / 1.5rem base).

**Patrocinadores confirmados:**
| Galeria | Patrocinador |
|---|---|
| Memórias de Gigantes | JBS |
| Guerreiros do Mar | Colônia de Pescadores |
| Sentinela de Pedra | Univali |
| Paisagens Peixeiras | Secretaria de Urbanismo de Itajaí |
| Galer.iA | Intelbras |

**Padrão visual dos cards (fechado):**
- Banner de apoio: faixa retangular sobreposta no TOPO da foto, largura 100%, altura ~40px, fundo `rgba(10,10,8,0.72)`, texto "APOIO: [nome]" centralizado (Cinzel 11px, letter-spacing 2px, cor âmbar claro `#E8B96A`). Sem tags de contagem de fotos/áudio nos cards.
- Botão "ENTRAR NA GALERIA": preenchimento sólido âmbar `#C8922A`, texto cor de fundo do site `#0A0A08` (letras "vazadas"), sem borda.

**Card da Galer.iA:** categoria "EXPERIÊNCIA IMERSIVA", tags "Sorteio de fotos · Poema personalizado por IA" (não usa "N fotografias · Áudio-narração" como as demais, já que não tem número fixo de fotos). Imagem de capa deve ser uma foto real do Alfa (nunca gerada por IA) — a Galer.iA não tem banco de fotos exclusivo, sorteia do mesmo banco das galerias temáticas.

⚠️ **Correção pendente:** o texto atual do card na página tem um erro de digitação ("Deixe o i.Alfa vai criar um poema...") e não usa a tag oficial acima — corrigir para bater com esta especificação.

**Exceção temporária — regra "trailer, não spoiler":** as capas atuais dos 4 cards temáticos (`foto-08`, `foto-15`, `foto-30`, `foto-40`) violam a regra abaixo (são fotos que também aparecem dentro das próprias galerias) — não há fotos de `banco-reserva/` qualificadas no momento. Aceito como está por ora; revisitar quando houver fotos extras dedicadas disponíveis.

### Galerias temáticas
Estado atual: `galeria.html` segue como página **estática** (exemplo fixo com as fotos de "Memórias de Gigantes") — a migração para o template dinâmico (`galeria.html?id=...` lendo `galerias.json`) ainda não foi feita. Comportamento do clique (já implementado): expande a foto em tela cheia, toca o áudio original do Alfa automaticamente, só um botão discreto ✕ para fechar. Sem i.Alfa, sem poema — isso é exclusivo da Galer.iA.

✅ **Limpeza concluída:** a seção "i.Alfa" (teaser) e o script `ialfa.js` foram removidos de `galeria.html` — pertenciam a uma versão anterior do projeto, antes da separação com a Galer.iA existir.

**Estilo do grid de fotos:** layout via **flexbox** (`flex-wrap`), não CSS Grid — o Grid deixava colunas vazias "reservadas" em linhas com menos itens; flexbox permite que cada linha estique seus próprios itens independentemente. Gap `16px` entre fotos, borda `1.5px solid #8A8070` em cada foto. Aplicado por ora na versão estática de `galeria.html`; **deve ser preservado ao migrar para o template dinâmico.**

Sem selo "GALERIA 0N" acima do título (removido). Footer com banner "Apoio: [nome]" (fundo `#111110`, borda âmbar) entre o bloco de marca e os links de redes sociais; espaçamento geral do footer condensado.

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
| `guerreiros-do-mar` | Guerreiros do Mar | foto-13 a foto-24, títulos reais, áudio pendente |
| `bico-do-papagaio` | **Sentinela de Pedra** (nome novo, id técnico não mudou) | foto-25 a foto-36, títulos reais, áudio pendente |
| `paisagens-peixeiras` | Paisagens Peixeiras | foto-37 a foto-48, títulos reais, áudio pendente |

Para adicionar uma galeria nova: só editar este JSON, nunca criar HTML novo.

⚠️ **Dessincronização pendente — foto-01/foto-03:** a duplicidade de título "Entre Redes e Gigantes" já foi resolvida na versão estática de `galeria.html` (foto-01 → "O Pescador e os Colossos", foto-03 → "Duas Escalas de Trabalho"), mas o `galerias.json` **ainda não foi atualizado** e continua com "Entre Redes e Gigantes" nos dois campos. Sincronizar o JSON com esses títulos antes da migração dinâmica, para que a fonte de dados não regrida ao valor antigo.

### Convenção de fotos e áudio

**Fotos ativas (em uso em alguma galeria):**
- Arquivo: `foto-NN.jpg`, numeração sequencial contínua, sem prefixo de galeria — a galeria de origem vive só no `galerias.json`.
- Todas juntas em `assets/images/`, sem subpastas por galeria.
- Estado atual: `foto-01.jpg` até `foto-48.jpg` (48 fotos, mais `alfa-bile.jpg` que é o retrato do artista, não conta como foto de galeria). Antes de processar fotos novas, sempre checar o próximo número livre: `ls assets/images/foto-*.jpg | sort -V | tail -1`.
- Áudio original do Alfa: mesmo número da foto, ex. `foto-13.mp3`, em `assets/audio/voz/`.
- Campos `titulo` e `audio` podem ficar como placeholder (`"TÍTULO PENDENTE"`, `null`) no JSON até serem preenchidos — isso não bloqueia o resto do pipeline.

**Fotos de capa exclusivas (Hall da Exposição):**
- Cada card do Hall usa uma foto de capa que, idealmente, **nunca** aparece dentro da própria galeria ("efeito trailer, não spoiler") — pode ser uma foto de `assets/images/` que pertence a OUTRA galeria, ou uma foto nova dedicada. *(Ver exceção temporária em vigor, seção "Hall da Exposição" acima.)*
- Se for uma foto nova, dedicada só à capa (nunca vai para dentro de nenhuma galeria): nomear `capa-NOME.jpg` (ex: `capa-galeria-ia.jpg`), nunca usar o padrão `foto-NN.jpg` para essas — evita que alguém confunda com foto de galeria e a adicione por engano ao JSON.

**Banco de reserva (fotos prontas, ainda sem destino):**
- Pasta `banco-reserva/` na raiz do projeto — fotos já otimizadas (`sips` já rodado) mas ainda não atribuídas a nenhuma galeria.
- Nomenclatura: `reserva-NNN.jpg`, sequencial, sem relação com a numeração de `assets/images/`.
- **Nunca entra no Git** — deve estar listada no `.gitignore`.
- "Promover" uma foto da reserva para ativa: mover e renomear (`mv banco-reserva/reserva-007.jpg assets/images/foto-51.jpg`), sem precisar rodar `sips` de novo — ela já foi otimizada ao entrar na reserva.

## Galer.iA (`galeria-ia.html`)

⚠️ **Estado atual do arquivo:** uma limpeza do i.Alfa aplicada em `galeria.html` foi replicada por engano em `galeria-ia.html`, deixando os dois arquivos idênticos (sem nenhuma lógica própria da Galer.iA). Como nenhuma lógica específica havia sido implementada ainda, a recriação é segura: sobrescrever `galeria-ia.html` com uma cópia limpa do `galeria.html` atual (já sem i.Alfa/`ialfa.js`) e construir a lógica abaixo a partir daí, preservando a separação entre os dois arquivos.

- 12 fotos sorteadas do banco total (todas as fotos de todas as galerias), usando **rotação controlada** — não puramente aleatório. O algoritmo prioriza as fotos com menor `vezesExibida`, sorteia dentro de um pool das menos exibidas, e incrementa o contador no Firestore a cada sorteio.
- O sorteio acontece uma vez por visita e fica salvo em `sessionStorage` — reentrar na mesma sessão não sorteia de novo.
- Visitante pode escolher **até 2 fotos distintas** por visita.
- Estados de cada foto no grid:
  - Não escolhida, com cota disponível → hover "✦ Sentir", clique abre fluxo de impressão → poema do i.Alfa (Claude API + ElevenLabs).
  - Já escolhida nesta visita → selo "✦ Sentida" (âmbar), clique toca o áudio original do Alfa (bônus).
  - Não escolhida, cota de 2 esgotada → mesmo comportamento das galerias temáticas (clique → expande → áudio original).
- Sem monetização, sem créditos, sem votação — experiência 100% gratuita.
- `vezesEscolhida` incrementado no Firestore quando o visitante gera um poema — alimenta um ranking de popularidade **interno**, não público, para análise pós-exposição.

### Convite de e-mail pós-poema (funcionalidade nova, ainda não implementada)

Depois de gerar poema(s), a Galer.iA oferece — de forma **opcional e não intrusiva** — enviar os poemas por e-mail ao visitante. **Não substitui o mural**: o poema vai para o mural anonimamente de qualquer forma; o e-mail é uma trilha separada, só para entrega pessoal.

**Quando o convite aparece:**
- Se o visitante gerar os 2 poemas (limite da visita): convite aparece assim que o 2º terminar, oferecendo os 2 juntos.
- Se gerar só 1 poema: convite aparece ao tentar sair da Galer.iA **por um link interno** (menu, logo, etc. — interceptar o clique, mostrar o convite, só então navegar). **Limitação técnica:** não é possível interceptar fechar aba ou botão "voltar" do navegador — o convite só aparece de forma confiável em navegação interna.
- **Se o visitante recusar o convite** (fechar sem preencher) com 1 poema, e depois voltar e gerar o 2º poema na mesma visita: **não perguntar de novo**. Usar uma flag em `sessionStorage` (ex: `emailConviteRecusado: true`) para lembrar a recusa durante toda a sessão.

**Consentimento (LGPD):** duas finalidades diferentes, com opt-in separado e explícito — nunca um checkbox genérico:
1. Enviar o(s) poema(s) gerado(s) agora (implícito ao preencher o campo)
2. "☐ Também quero saber de futuras edições desta exposição" (opcional dentro do opcional)

Se o visitante não marcar a opção 2, o e-mail deve ser usado só para esse envio único, não para a lista de contatos permanente.

**Schema:**
```
coleção: contatos
{
  id: auto,
  email: "visitante@exemplo.com",
  poemaTexto: "...",     // ou array, se forem 2 poemas
  audioUrl: "...",
  aceitaContatoFuturo: true/false,
  enviado: false,
  timestamp: serverTimestamp()
}
```

**Envio real:** Firestore sozinho não envia e-mail. Usar a extensão oficial **"Trigger Email" do Firebase** (observa a coleção `contatos`, dispara e-mail via provedor tipo SendGrid ao detectar documento novo). Configuração do provedor de e-mail é tarefa do Leao (conta/chaves), não de código.

**Pendência futura (não bloqueia o lançamento):** se a lista de `contatos` for usada para divulgação futura, será necessário oferecer um mecanismo de descadastro (direito de revogação de consentimento, LGPD).

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
Stack: HTML/CSS/JS puro, Bootstrap 5.3.3 (navbar/botões), **flexbox** para o grid de fotos das galerias (gap `16px`, borda `1.5px solid #8A8070` por foto — ver seção "Galerias temáticas").

## Pendências conhecidas

- Áudio das fotos foto-13 a foto-48 — aguardando o Alfa (títulos poéticos já preenchidos no `galerias.json` para as 4 galerias temáticas).
- Sincronizar `galerias.json` com os títulos já corrigidos de foto-01/foto-03 no HTML estático (ver seção `galerias.json`).
- Confirmar com o Alfa se o nome "Sentinela de Pedra" (trocado de "No Bico do Papagaio" por decisão do Leao) é aprovado.
- Possíveis fotos repetidas entre as 37 fotos novas — Leao vai revisar com o Alfa.
- Confirmar se a foto de capa da Galer.iA (`capa-galeria-ia.jpg`) é definitiva ou placeholder.
- Recriar `galeria-ia.html` como cópia limpa e independente de `galeria.html` (ver seção "Galer.iA" acima).
- Corrigir texto do card da Galer.iA em `hall.html` (erro de digitação + usar a tag oficial já especificada).
- Navbar: `artista.html` e `contato.html` ainda apontam para o link antigo de galeria — atualizar para `hall.html`, seguindo o padrão já aplicado em `index.html`, `galeria.html` e `galeria-ia.html`.
- Atualizar o link do CTA "Entrar no Hall das Galerias" em `index.html` para `hall.html` (arquivo renomeado após a sessão em que esse CTA foi criado).
- Criação do projeto Firebase (console, chaves de API) — só o Leao pode fazer isso, não é tarefa de código.
- Configuração do provedor de e-mail (SendGrid ou similar) para a extensão "Trigger Email" — tarefa do Leao, não de código.
- Migração de `galeria.html` para template dinâmico (`galeria.html?id=...` lendo `galerias.json`) — arquitetura definida, implementação ainda não iniciada.
- Mecanismo de descadastro da lista de `contatos` — não bloqueia lançamento, mas necessário antes de qualquer campanha de divulgação futura usando essa lista.
