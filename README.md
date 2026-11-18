# LP HCB — Direito Trabalhista (trabalhador reclamante)

Herculano & Castelo Branco Advocacia e Assessoria Jurídica — landing page estática (HTML/CSS/JS, sem build) no padrão ADS BR.

| Arquivo | Função |
|---|---|
| `index.html` | LP completa com formulário no hero e no final (CSS inline) |
| `redirect.html` | Página intermediária `/redirect`: contador de 3 s e abertura do WhatsApp |
| `dashboard.html` | Painel de leads (login Supabase, RLS) em `/dashboard` |
| `config.js` | WhatsApp, Supabase, IDs de pixel/GTM e dados institucionais opcionais |
| `app.js` | Visitas, leads, UTMs, validação, antiduplicidade, FAQ, animações, eventos |
| `vercel.json` | `cleanUrls`, cache e `noindex` em `/redirect` e `/dashboard` |

## Fluxo do lead
1. Formulário (nome + WhatsApp com máscara e validação de DDD/celular).
2. `INSERT` em `lp_leads` (Supabase **ADS BR CLIENTES**, `site = 'hcb-trabalhista'`), com `origem` (UTMs/gclid/fbclid/referrer) e `servico` (área do CTA clicado).
3. Uma nova tentativa automática se a gravação falhar; antiduplicidade de 30 min por número; botão travado durante o envio.
4. `/redirect` → depois de 3 s abre `wa.me/5585991020899` com a mensagem:
   "Olá! Meu nome é {nome}. Acessei a página da HCB e gostaria de conversar sobre uma questão trabalhista. Assunto: {área}."

Eventos no `dataLayer`: `cta_click`, `faq_open`, `lead_submit` (Meta: `Lead`), `lead_thankyou`.

## Deploy (Vercel)
Projeto estático, sem build: crie o repositório `agenciaadsbr/lp-hcb-trabalhista` com esta pasta e importe na Vercel (Framework: Other).

## Antes de veicular
- [ ] **OAB (Provimento 205/2021)**: preencher `oabSociedade` e `advogados[].oab` em `config.js`.
- [ ] Fotos reais dos sócios → `assets/socio-ygor.webp` e `assets/socio-abelardo.webp` (4:5) e `advogados[].foto`.
- [x] Endereço, e-mail e Instagram preenchidos a partir do papel timbrado oficial (ID visual nova HCB).
- [ ] `metaPixelId` e/ou `gtmId`.
- [ ] Com o domínio definido: trocar `og:image` para URL absoluta (`https://dominio/assets/og.jpg`).
- [x] Acesso ao `/dashboard` criado: usuário **Admin** / senha **12345** (e-mail interno `admin@hcb-trabalhista.adsbr.internal`, liberado para `site = 'hcb-trabalhista'` em `lp_acessos`).

## Imagens
Fotografias licenciadas do Freepik (licença do plano ADS BR, sem IA): 26265759 (hero), 22117940 (gestante), 13450080 (logística), 10608095 (fundo do contato). Pessoas recortadas com rembg. As 3 pessoas dos cards de situação (`assets/card-*.webp`) são fictícias, geradas por IA no Freepik/Magnific. Logo extraída da arte oficial do escritório. Mapa: `@svg-maps/brazil` (CC BY 4.0).
