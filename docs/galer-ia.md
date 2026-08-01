# Galer.iA (`galeria-ia.html`)

`galeria-ia.html` foi recriado como cópia independente e limpa de `galeria.html` (sem i.Alfa/`ialfa.js`), no commit `0db5f7e`. Ainda **sem nenhuma lógica própria implementada** — é hoje uma cópia estática idêntica ao `galeria.html`. A lógica abaixo é a especificação a implementar, não o estado atual do arquivo.

## Sorteio e rotação

- 12 fotos sorteadas do banco total (todas as fotos de todas as galerias), usando **rotação controlada** — não puramente aleatório. O algoritmo prioriza as fotos com menor `vezesExibida`, sorteia dentro de um pool das menos exibidas, e incrementa o contador no Firestore a cada sorteio.
- O sorteio acontece uma vez por visita e fica salvo em `sessionStorage` — reentrar na mesma sessão não sorteia de novo.
- Visitante pode escolher **até 2 fotos distintas** por visita.

## Estados de cada foto no grid

- Não escolhida, com cota disponível → hover "✦ Sentir", clique abre fluxo de impressão → poema do i.Alfa (Claude API + ElevenLabs).
- Já escolhida nesta visita → selo "✦ Sentida" (âmbar), clique toca o áudio original do Alfa (bônus).
- Não escolhida, cota de 2 esgotada → mesmo comportamento das galerias temáticas (clique → expande → áudio original).
- Sem monetização, sem créditos, sem votação — experiência 100% gratuita.
- `vezesEscolhida` incrementado no Firestore quando o visitante gera um poema — alimenta um ranking de popularidade **interno**, não público, para análise pós-exposição.

## Card no Hall (`hall.html`)

Categoria "EXPERIÊNCIA IMERSIVA". Texto definitivo do card (parágrafo principal):

> "Deixe a inteligência artificial escrever, na voz do Alfa, o poema que só o seu olhar poderia inspirar."

## Hint de entrada (Hall)

Card da Galer.iA em `hall.html` tem um popup explicativo no hover do botão
"Entrar na Galeria" (não no card inteiro), pra situar o visitante antes de entrar.

- Trigger: `#galeriaIaHoverBtn` (botão), não o card
- Posicionamento: `position: fixed`, calculado via JS (`getBoundingClientRect()`),
  fecha em scroll/resize
- Texto atual: "Ao entrar, escolha uma foto e descreva o que ela desperta em
  você — o i.Alfa transforma isso em um poema exclusivo. Você tem direito a
  dois poemas por visita."
- Fallback touch: primeiro toque abre, segundo toque no botão navega, toque
  fora fecha

## Convite de e-mail pós-poema (funcionalidade nova, ainda não implementada)

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
  duploOptIn: false,              // só relevante se aceitaContatoFuturo=true
  tokenConfirmacao: null,          // gerado só quando aceitaContatoFuturo=true
  enviado: false,
  timestamp: serverTimestamp()
}
```

**Envio real:** Firestore sozinho não envia e-mail. Usar a extensão oficial **"Trigger Email" do Firebase** (observa a coleção `contatos`, dispara e-mail via provedor tipo SendGrid ao detectar documento novo). Configuração do provedor de e-mail é tarefa do Leao (conta/chaves), não de código.

**Extensão nova — duplo opt-in por confirmação de e-mail (`duploOptIn`):** decisão recente, adicionada depois da primeira versão do schema acima. `aceitaContatoFuturo` e `duploOptIn` são dois campos complementares, não o mesmo conceito com nomes diferentes:
- `aceitaContatoFuturo` — o consentimento em si, marcado pelo visitante no formulário (já documentado desde a primeira versão deste schema).
- `duploOptIn` — mecanismo de confirmação: só passa a ser relevante quando `aceitaContatoFuturo = true`, e começa como `false`. O visitante entra na lista permanente de divulgação só depois de confirmar a intenção por um link de e-mail (`tokenConfirmacao`, gerado nesse momento); até lá, `duploOptIn` permanece `false` e o contato não deve ser tratado como confirmado para campanhas futuras.
- Isso ainda não tem código de escrita implementado — fica para quando o convite de e-mail for de fato construído. A regra do Firestore (`firestore.rules`) já exige `aceitaContatoFuturo` na criação do documento; a validação/atualização de `duploOptIn` e `tokenConfirmacao` será tratada pelo fluxo de confirmação (provavelmente Cloud Function), ainda não implementado.

**Pendência futura (não bloqueia o lançamento):** se a lista de `contatos` for usada para divulgação futura, será necessário oferecer um mecanismo de descadastro (direito de revogação de consentimento, LGPD).
