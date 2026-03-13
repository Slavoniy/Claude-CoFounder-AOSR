# CLAUDE.md — StroyDocs

## О проекте

**StroyDocs** — B2B SaaS-платформа для автоматизации исполнительной документации (ИД) в строительстве.
Целевая аудитория: заказчики, генподрядчики, субподрядчики, стройконтроль.

Все данные хранятся **исключительно на серверах РФ** (Timeweb Cloud, соответствие ФЗ-152).

---

## Инфраструктура — Timeweb Cloud (РФ)

| Сервис | Timeweb Cloud продукт | Примечание |
|---|---|---|
| Приложение | Cloud VPS / App Platform | Деплой из GitHub |
| БД | Managed PostgreSQL | DBaaS, без администрирования |
| Кэш / Очереди | Managed Redis | DBaaS |
| Файловое хранилище | S3-хранилище | S3-совместимое, трёхкратная репликация, ФЗ-152 |
| Оркестрация (в перспективе) | Managed Kubernetes | При масштабировании |

### Переменные окружения (`.env`)
```env
# Timeweb Cloud S3
S3_ENDPOINT=https://s3.timeweb.cloud
S3_REGION=ru-1
S3_BUCKET=stroydocs-files
S3_ACCESS_KEY=<twc_access_key>
S3_SECRET_KEY=<twc_secret_key>

# Timeweb Managed PostgreSQL
DATABASE_URL=postgresql://user:password@<twc-pg-host>:5432/stroydocs

# Timeweb Managed Redis
REDIS_URL=redis://<twc-redis-host>:6379

# App
NEXTAUTH_SECRET=<secret>
NEXTAUTH_URL=https://app.stroydocs.ru
APP_URL=https://app.stroydocs.ru
```

### S3-клиент (aws-sdk v3 — совместим с Timeweb S3)
```typescript
// lib/s3.ts
import { S3Client } from "@aws-sdk/client-s3";

export const s3 = new S3Client({
  endpoint: process.env.S3_ENDPOINT,
  region: process.env.S3_REGION,
  credentials: {
    accessKeyId: process.env.S3_ACCESS_KEY!,
    secretAccessKey: process.env.S3_SECRET_KEY!,
  },
  forcePathStyle: true, // обязательно для Timeweb S3
});
```

---

## Технический стек

### Frontend
- **Framework**: Next.js 14 (App Router)
- **UI**: React + TypeScript
- **Стили**: Tailwind CSS + shadcn/ui
- **Таблицы**: TanStack Table v8
- **PDF**: react-pdf (просмотр) + pdf-lib (генерация)
- **Графики**: Recharts
- **Формы**: React Hook Form + Zod
- **Состояние**: Zustand (глобальное) + TanStack Query (серверное)

### Backend
- **Runtime**: Node.js + TypeScript
- **Framework**: Next.js API Routes (монолит на старте) → NestJS (при росте)
- **ORM**: Prisma
- **БД**: PostgreSQL (Timeweb Managed)
- **Файлы**: Timeweb S3 (через @aws-sdk/client-s3 с forcePathStyle: true)
- **Очереди**: BullMQ + Redis (Timeweb Managed Redis)
- **ЭЦП**: КриптоПро CSP (через REST API шлюз)
- **Auth**: NextAuth.js + JWT + refresh tokens

### DevOps
- **Контейнеры**: Docker + Docker Compose (локальная разработка)
- **CI/CD**: GitHub Actions → деплой на Timeweb Cloud VPS / App Platform
- **Локальная разработка**: Docker Compose (PostgreSQL + Redis + MinIO как замена S3)

---

## Архитектура базы данных

Ключевая иерархия (строго соблюдать реляционность):

```
Organization
  └── Users (roles: admin | manager | worker | controller | customer)
  └── Projects (объекты капстроительства)
        └── Contracts (договоры)
              └── SubContracts (субдоговоры)
              └── WorkItems (наименования работ, привязка к КСИ)
                    └── Materials (материалы + остатки)
                    │     └── MaterialDocuments (паспорта, сертификаты)
                    └── WorkRecords (записи о выполненных работах)
                          └── MaterialWriteoffs (списание материалов)
                          └── ExecutionDocs (ИД: АОСР, ОЖР, акты)
                                └── Signatures (ЭЦП)
                                └── Comments (журнал замечаний)
```

### Ключевые модели Prisma:
- `Organization` — ИНН, ОГРН, СРО, реквизиты
- `User` — ФИО, email, телефон, роль, организация
- `Project` — название, адрес, генподрядчик, заказчик
- `Contract` — участники (застройщик, подрядчик, авторнадзор), приказы
- `KsiNode` — узел классификатора КСИ (дерево через parentId)
- `WorkItem` — привязка к KsiNode, шифр проекта
- `Material` — поставщик, накладная, количество, остаток
- `ExecutionDoc` — тип (АОСР/ОЖР/акт_тех_готовности), статус, s3Key, подписи

---

## Модули системы

### 1. Auth & Roles
- Регистрация/вход организации
- Роли: `admin | manager | worker | controller | customer`
- Приглашение сотрудников по email
- Подтверждение полномочий через ЭЦП

### 2. Организация
- Карточка компании (ИНН, ОГРН, СРО)
- Реестр сотрудников (должность, статус, email, телефон)
- API-интеграции: U-lab, EXON, Cynteka, Основа

### 3. Проекты и договоры
- Создание проектов (автозаполнение по ИНН/ОГРН через API ФНС/ЕГРЮЛ)
- Иерархия: Проект → Договор → Субдоговор
- Карточки участников строительства
- Статистика / дашборды (гистограммы объема работ, прогресс ИД)

### 4. Производство работ
- Привязка работ к КСИ (многоуровневое дерево)
- Учёт материалов по накладным (остатки, предупреждения)
- Сертификаты и паспорта качества (PDF из Timeweb S3)
- Записи о выполненных работах со списанием материалов

### 5. Исполнительная документация
- Автогенерация АОСР, ОЖР, актов технической готовности
- Встроенный PDF-просмотрщик (react-pdf)
- Подписание ЭЦП: открепленная / встроенная (КриптоПро)
- Журнал замечаний с отслеживанием статуса

### 6. Документарий (файловый архив)
- Разрешительная документация (штамп "Копия верна")
- Рабочий проект и исполнительные схемы
- Сертификаты и протоколы лабораторных испытаний
- Нормативка (ГОСТы, СП, СНиПы)

---

## UI/UX принципы

- **Тема**: Enterprise-dashboard, светлая, акцентный синий `#2563EB`
- **Навигация**: Фиксированный левый sidebar (логотип StroyDocs, профиль, уведомления, список проектов)
- **Контент**: Вкладочная структура (Tabs) внутри проектов и договоров
- **Данные**: Таблицы с фильтрами, поиском, пагинацией (TanStack Table)
- **Статусы документов**:
  - 🟢 Зелёный — подписано / утверждено
  - 🔴 Красный — отклонено
  - 🟡 Жёлтый — на проверке
  - ⚪ Серый — черновик / в работе
- **Создание сущностей**: Через модальные окна (shadcn Dialog)

---

## Правила написания компонентов

### Размер и декомпозиция
- Максимум **~150 строк** на один компонент. Если файл превышает этот порог — **обязательно** разбить на подкомпоненты
- Дробить нужно по смыслу, а не механически: каждый компонент = одна ответственность
- Если сложно дать компоненту короткое название — это сигнал, что он делает слишком много

### Разделение UI и логики (обязательно)
Логика и UI всегда живут в разных файлах:

```
# Правильно:
components/modules/contracts/
  ├── ContractCard.tsx        # только JSX-разметка (~60-80 строк)
  └── useContractCard.ts      # стейт, запросы к API, вычисления

# Неправильно:
  └── ContractCard.tsx        # 300 строк с fetch, useState и JSX вперемешку
```

### Что куда класть
- **`*.tsx` компонент** — только JSX и пропсы. Никаких fetch, useEffect с логикой, сложных вычислений
- **`use*.ts` хук** — запросы (TanStack Query), стейт (useState/useReducer), бизнес-логика, форматирование данных
- **`utils/`** — чистые функции без React (форматирование дат, расчёты остатков материалов и т.д.)

### Примеры декомпозиции для StroyDocs
```
# Страница договора:
ContractPage.tsx              # layout + tabs (~80 строк)
  ├── ContractHeader.tsx       # шапка с реквизитами (~60 строк)
  ├── ContractParticipants.tsx # участники строительства (~70 строк)
  ├── ContractWorkItems.tsx    # таблица работ (~80 строк)
  └── useContract.ts           # вся логика загрузки и мутаций
```

---

## Соглашения по коду

### Именование
- Компоненты: `PascalCase` → `ContractCard.tsx`
- Хуки: `camelCase` с `use` → `useContracts.ts`
- API роуты: `kebab-case` → `/api/work-items`
- БД модели в Prisma: `PascalCase`
- Переменные/функции: `camelCase`
- Бренд в коде: `stroydocs` (не `builddocs`)

### Структура папок (Next.js App Router)
```
stroydocs/
├── src/
│   ├── app/
│   │   ├── (auth)/              # /login, /register, /invite
│   │   ├── (dashboard)/         # Основное приложение (за авторизацией)
│   │   │   ├── projects/
│   │   │   ├── organizations/
│   │   │   └── documents/
│   │   └── api/                 # Next.js API Routes
│   ├── components/
│   │   ├── ui/                  # shadcn/ui (авто-генерация)
│   │   ├── shared/              # Переиспользуемые компоненты
│   │   └── modules/             # По модулям: contracts/, materials/, docs/
│   ├── lib/
│   │   ├── db.ts                # Prisma client (singleton)
│   │   ├── auth.ts              # NextAuth конфиг
│   │   ├── s3.ts                # Timeweb S3 клиент
│   │   ├── queue.ts             # BullMQ + Redis
│   │   └── ksi/                 # Классификатор строительной информации
│   ├── hooks/                   # Кастомные React-хуки
│   ├── types/                   # TypeScript типы и интерфейсы
│   └── utils/                   # Утилиты
├── prisma/
│   ├── schema.prisma
│   └── migrations/
├── templates/                   # HTML-шаблоны PDF (АОСР, ОЖР)
├── docker-compose.yml           # Локальная разработка
├── .env.example
└── CLAUDE.md                    # Этот файл
```

### Типизация
- Строгий TypeScript (`strict: true` в tsconfig)
- Zod — валидация всех входящих данных (API + формы)
- Все API-ответы типизировать через `ApiResponse<T>`

---

## Приоритет разработки (MVP)

**Фаза 1 — Ядро (2-3 недели):**
1. Инициализация Next.js 14 + Prisma + shadcn/ui
2. Auth (NextAuth) + организации + приглашение пользователей
3. Базовая Prisma-схема: Organization → Project → Contract
4. Layout: sidebar + tabs + базовые страницы

**Фаза 2 — Производство работ (2-3 недели):**
5. КСИ-дерево (загрузка и отображение)
6. Учёт материалов (накладные, остатки, предупреждения)
7. Загрузка сертификатов в Timeweb S3
8. Записи о выполненных работах

**Фаза 3 — Документация (2-3 недели):**
9. Генерация АОСР и ОЖР (PDF через Puppeteer + шаблоны)
10. PDF-просмотрщик (react-pdf)
11. Журнал замечаний

**Фаза 4 — ЭЦП и интеграции (2 недели):**
12. КриптоПро CSP (через REST-шлюз)
13. API ФНС/ЕГРЮЛ (автозаполнение по ИНН)
14. Внешние интеграции: U-lab, EXON, Cynteka

---

## Важные технические решения

1. **КСИ** — хранить как дерево с `parentId` в PostgreSQL. Загружать JSON-справочник при инициализации через `prisma/seed.ts`.

2. **PDF-генерация** — HTML-шаблоны (Handlebars) в `/templates` → рендер через Puppeteer → сохранение в Timeweb S3 → ссылка в БД.

3. **ЭЦП** — абстракция `SignatureProvider` для подключения КриптоПро и облачных провайдеров.

4. **Multi-tenancy** — в каждом Prisma-запросе фильтрация по `organizationId` из сессии. Row Level Security в PostgreSQL как дополнительный уровень.

5. **Файлы** — только метаданные в БД (`s3Key`, `fileName`, `mimeType`, `size`). Доступ через pre-signed URL от Timeweb S3 (TTL: 1 час).

6. **ФЗ-152** — все данные пользователей хранятся только на Timeweb Cloud (РФ). Не использовать зарубежные сервисы для хранения персональных данных.

---

## Локальная разработка

```bash
# 1. Клонировать репозиторий
git clone <repo>
cd stroydocs

# 2. Настроить переменные окружения
cp .env.example .env.local

# 3. Запустить локальную инфраструктуру
docker-compose up -d

# 4. Установить зависимости
npm install

# 5. Применить миграции и загрузить справочники (КСИ)
npx prisma migrate dev
npx prisma db seed

# 6. Запустить dev-сервер
npm run dev
# → http://localhost:3000
```

### docker-compose.yml (локальная разработка)
```yaml
services:
  postgres:
    image: postgres:16
    environment:
      POSTGRES_DB: stroydocs
      POSTGRES_USER: stroydocs
      POSTGRES_PASSWORD: stroydocs
    ports: ["5432:5432"]
    volumes: [postgres_data:/var/lib/postgresql/data]

  redis:
    image: redis:7-alpine
    ports: ["6379:6379"]

  minio:
    image: minio/minio
    command: server /data --console-address ":9001"
    environment:
      MINIO_ROOT_USER: stroydocs
      MINIO_ROOT_PASSWORD: stroydocs123
    ports: ["9000:9000", "9001:9001"]
    volumes: [minio_data:/data]

volumes:
  postgres_data:
  minio_data:
```

---

## Деплой на Timeweb Cloud

```bash
# Продакшн переменные — через панель Timeweb Cloud
# S3_ENDPOINT=https://s3.timeweb.cloud (forcePathStyle: true)
# DATABASE_URL — Managed PostgreSQL endpoint из панели
# REDIS_URL — Managed Redis endpoint из панели

# GitHub Actions → push в main → деплой на VPS
# или Timeweb App Platform (деплой из Git автоматически)
```

---

## Текущий статус

🚧 **Фаза 1** — инициализация проекта и базовой архитектуры.

При работе с кодом всегда:
- Следовать структуре папок выше
- Название проекта везде: **StroyDocs** (не BuildDocs)
- Добавлять TypeScript типы, не использовать `any`
- Комментарии к бизнес-логике — на **русском языке**
- Учитывать российские стандарты: ГОСТ, СП, ФЗ-152, ФЗ о строительстве
- Все файлы хранить только в Timeweb S3, не использовать зарубежные CDN для персональных данных
