# 🗄️ Baza Wiedzy - Dział Techniczny

Aplikacja do zarządzania wiedzą dla działu technicznego (zegarki, lokalizatory).

## 📋 Funkcjonalności

- ✅ **Tematy i notatki** - twórz tematy i dodawaj w nich notatki
- ✅ **Kategorie drzewiaste** - organizuj wiedzę w hierarchii folderów
- ✅ **Tagi** - oznaczaj notatki tagami do łatwego filtrowania
- ✅ **Wyszukiwanie pełnotekstowe** - szukaj po treści, tagach, lokalizacji
- ✅ **Historia zmian** - śledź kto co edytował i przywracaj poprzednie wersje
- ✅ **Załączniki** - wgrywaj pliki, zdjęcia, schematy
- ✅ **Powiązania między notatkami** - linkuj powiązane treści
- ✅ **Ulubione i ostatnio przeglądane** - szybki dostęp do ważnych tematów
- ✅ **Edytor Markdown** - formatuj notatki z podglądem na żywo

---

## 🚀 Instrukcja wdrożenia (DARMOWO)

### Krok 1: Utwórz konto Supabase

1. Wejdź na **[supabase.com](https://supabase.com)** i załóż darmowe konto
2. Kliknij **"New Project"**
3. Wypełnij:
   - **Name**: `knowledge-base` (lub inna nazwa)
   - **Database Password**: wygeneruj silne hasło i zapisz!
   - **Region**: wybierz najbliższy (np. Frankfurt)
4. Poczekaj ~2 minuty na utworzenie projektu

### Krok 2: Skonfiguruj bazę danych

1. W panelu Supabase kliknij **"SQL Editor"** w menu bocznym
2. Kliknij **"New query"**
3. Skopiuj całą zawartość pliku `database/schema.sql` i wklej do edytora
4. Kliknij **"Run"** (lub Ctrl+Enter)
5. Powinny pojawić się zielone komunikaty o sukcesie

### Krok 3: Skonfiguruj Storage (dla załączników)

1. W menu bocznym kliknij **"Storage"**
2. Kliknij **"New bucket"**
3. Nazwa: `knowledge-base`
4. Zaznacz **"Public bucket"** (aby pliki były dostępne)
5. Kliknij **"Create bucket"**

### Krok 4: Skonfiguruj autentykację

1. W menu kliknij **"Authentication"** → **"Providers"**
2. Upewnij się że **Email** jest włączony
3. (Opcjonalnie) Włącz **Google** lub inne providery

#### Dodaj pierwszego użytkownika:
1. Idź do **"Authentication"** → **"Users"**
2. Kliknij **"Add user"** → **"Create new user"**
3. Wpisz email i hasło dla siebie
4. Kliknij **"Create user"**

### Krok 5: Pobierz klucze API

1. Idź do **"Settings"** → **"API"**
2. Skopiuj:
   - **Project URL** (np. `https://xxxxx.supabase.co`)
   - **anon public** key (długi ciąg znaków)

### Krok 6: Wdróż frontend na Vercel (DARMOWO)

#### Opcja A: Przez GitHub (zalecane)

1. Utwórz nowe repozytorium na GitHubie
2. Wgraj pliki z folderu `knowledge-base/` do repo
3. Wejdź na **[vercel.com](https://vercel.com)** i zaloguj się przez GitHub
4. Kliknij **"Add New..."** → **"Project"**
5. Wybierz swoje repozytorium
6. W sekcji **"Environment Variables"** dodaj:
   ```
   VITE_SUPABASE_URL = https://twoj-projekt.supabase.co
   VITE_SUPABASE_ANON_KEY = twoj-klucz-anon
   ```
7. Kliknij **"Deploy"**

#### Opcja B: Przez Vercel CLI

```bash
# Zainstaluj Vercel CLI
npm i -g vercel

# W folderze projektu
cd knowledge-base
vercel

# Postępuj zgodnie z instrukcjami
# Dodaj zmienne środowiskowe gdy zapyta
```

### Krok 7: Gotowe! 🎉

Po wdrożeniu otrzymasz URL (np. `https://knowledge-base-xxx.vercel.app`).

Podziel się tym linkiem z kolegami z pracy!

---

## 🔧 Rozwój lokalny

```bash
# 1. Sklonuj/pobierz pliki
cd knowledge-base

# 2. Zainstaluj zależności
npm install

# 3. Utwórz plik .env.local
cat > .env.local << EOF
VITE_SUPABASE_URL=https://twoj-projekt.supabase.co
VITE_SUPABASE_ANON_KEY=twoj-klucz-anon
EOF

# 4. Uruchom serwer deweloperski
npm run dev

# Aplikacja będzie dostępna pod http://localhost:5173
```

---

## 📁 Struktura projektu

```
knowledge-base/
├── database/
│   └── schema.sql          # Schemat bazy danych PostgreSQL
├── docs/
│   └── erd-diagram.mermaid # Diagram ERD
├── src/
│   ├── components/
│   │   ├── layouts/        # Layouty stron
│   │   ├── navigation/     # Sidebar, Header
│   │   ├── notes/          # Komponenty notatek
│   │   ├── topics/         # Komponenty tematów
│   │   └── modals/         # Okna modalne
│   ├── hooks/
│   │   └── useKnowledgeBase.ts  # Custom hooks
│   ├── lib/
│   │   ├── supabase.ts     # Konfiguracja Supabase
│   │   └── database.types.ts    # Typy TypeScript
│   ├── pages/              # Strony aplikacji
│   ├── utils/
│   │   └── helpers.ts      # Funkcje pomocnicze
│   └── App.tsx             # Główny komponent
├── package.json
├── tailwind.config.js
└── README.md
```

---

## 💰 Koszty

### Supabase (darmowy tier):
- ✅ 500 MB bazy danych
- ✅ 1 GB storage na pliki
- ✅ 50,000 aktywnych użytkowników miesięcznie
- ✅ Nieograniczone API requests

### Vercel (darmowy tier):
- ✅ Nieograniczone wdrożenia
- ✅ 100 GB bandwidth/miesiąc
- ✅ Automatyczne SSL
- ✅ Własna domena (opcjonalnie)

**Dla małego/średniego zespołu to w zupełności wystarczy!**

---

## 🔐 Bezpieczeństwo

- Row Level Security (RLS) - użytkownicy widzą tylko to, do czego mają dostęp
- Autentykacja przez Supabase Auth
- Wszystkie hasła hashowane
- HTTPS wymuszony

---

## 📞 Wsparcie

W razie problemów:
1. Sprawdź dokumentację Supabase: [supabase.com/docs](https://supabase.com/docs)
2. Sprawdź dokumentację Vercel: [vercel.com/docs](https://vercel.com/docs)
3. Otwórz issue w repozytorium

---

## 🔮 Planowane rozszerzenia

- [ ] Eksport do PDF
- [ ] Powiadomienia o zmianach
- [ ] Komentarze pod notatkami
- [ ] Wersje językowe
- [ ] Integracja z Slack/Teams
- [ ] Widok grafu powiązań
