// Configuração pública da LP HCB — Direito Trabalhista (trabalhador reclamante).
// A chave anon do Supabase é pública por design: o RLS só permite INSERT anônimo
// em lp_leads/lp_visits; a leitura dos leads exige login no /dashboard.
window.LP_CONFIG = {
  site: 'hcb-trabalhista',
  sites: ['hcb-trabalhista'],
  cliente: 'Herculano e Castelo Branco Advocacia e Assessoria Jurídica',
  whatsapp: '5585991020899',
  mensagem: 'Olá! Acessei a página da HCB e gostaria de conversar sobre uma questão trabalhista.',
  supabaseUrl: 'https://qxhnjzyhtllmtdrcyygi.supabase.co',
  supabaseAnonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF4aG5qenlodGxsbXRkcmN5eWdpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODIyMzczNjgsImV4cCI6MjA5NzgxMzM2OH0.DWf4I_x9F--H7ZZHUt_n4V3B__Nlsf1jNZdUV0vNBLU',

  // Rastreamento: preencha os IDs e os scripts carregam sozinhos (vazio = não carrega nada).
  metaPixelId: '',
  gtmId: '',

  // Dados institucionais: cada item só aparece na página quando preenchido.
  // Provimento 205/2021 (OAB): informe o registro da sociedade e/ou dos advogados antes de veicular.
  oabSociedade: '',            // ex.: 'OAB/CE nº 0000'
  advogados: [
    { nome: 'Dr. Ygor', oab: '', foto: '' },      // foto: 'assets/socio-ygor.webp'
    { nome: 'Dr. Abelardo', oab: '', foto: '' }   // foto: 'assets/socio-abelardo.webp'
  ],
  endereco: '',                // ex.: 'Rua X, 123 — Aldeota, Fortaleza/CE'
  email: '',
  instagram: ''
};
