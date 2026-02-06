# Audit de Performance Complet - SuperCash

## 📊 Résumé Exécutif

**Statut Actuel:** ⚠️ **Performances Sous-Optimales**

**Temps de Chargement Observés:**
- Page d'accueil (`/`): **5.7s** (compilation: 4.8s, render: 855ms)
- Dashboard (`/dashboard`): **10.0s** (compilation: 9.8s, render: 240ms)
- Pages secondaires: **3-3.4s** en moyenne

**Objectifs Recommandés:**
- ✅ First Load: < 1.5s
- ✅ Route Changes: < 500ms
- ✅ Time to Interactive: < 2s

---

## 🔍 Problèmes Identifiés par Catégorie

### 1. 🚨 CRITIQUE: Bundle JavaScript Massif

#### a) Radix UI - Surcharge des Dépendances
**Impact:** ~30 packages Radix UI importés (27 composants UI)

```json
Packages identifiés:
- @radix-ui/react-accordion
- @radix-ui/react-alert-dialog
- @radix-ui/react-dialog
- @radix-ui/react-dropdown-menu
- @radix-ui/react-select
- @radix-ui/react-tabs
- @radix-ui/react-tooltip
... (20+ autres)
```

**Problème:** 
- Chaque package Radix ajoute 5-15 KB au bundle compressé
- Total estimé: **150-300 KB** uniquement pour Radix UI
- Beaucoup de composants ne sont utilisés que sur certaines pages

**Recommandation:**
```typescript
// ✅ Bon: Lazy load les composants lourds
const Dialog = dynamic(() => import('@/components/ui/dialog'))
const Select = dynamic(() => import('@/components/ui/select'))

// ❌ Mauvais: Import direct dans le layout
import { Dialog, Select } from '@/components/ui'
```

#### b) Firebase Bundle
**Impact:** Firebase + Firebase Admin = ~150-200 KB

```json
"firebase": "^11.10.0",
"firebase-admin": "^12.7.0"  // ⚠️ Ne devrait PAS être dans dependencies
```

**Problème:**
- `firebase-admin` est pour Node.js/Server-side UNIQUEMENT
- Il ne devrait jamais être dans le bundle client
- `firebase` client SDK peut être réduit en n'important que les modules nécessaires

**Recommandation:**
```bash
# Déplacer firebase-admin en devDependencies
pnpm remove firebase-admin
pnpm add -D firebase-admin
```

```typescript
// ✅ Import sélectif (au lieu de tout Firebase)
import { initializeApp } from 'firebase/app'
import { getMessaging } from 'firebase/messaging'
// N'importer QUE ce qui est utilisé
```

#### c) Lucide Icons
**Impact:** 13+ icônes importées par page

```typescript
// Dashboard page.tsx ligne 7
import { 
  ArrowDownToLine, ArrowUpFromLine, Wallet, Loader2, 
  ArrowRight, RefreshCw, Phone, Gift, Ticket, 
  Banknote, Smartphone, BookOpen, Search, Plus 
} from "lucide-react"
```

**Problème:** Chaque page importe son propre set d'icônes
**Taille:** ~2-3 KB par icône = **30-40 KB** pour toutes

**Recommandation:** 
- Créer un fichier centralisé `icons.ts` avec uniquement les icônes utilisées
- Tree-shaking automatique par Next.js

---

### 2. ⚠️ IMPORTANT: Configuration Next.js

#### a) Images Non-Optimisées
```javascript
// next.config.mjs ligne 6-8
images: {
  unoptimized: true,  // ❌ DÉSACTIVE l'optimisation automatique!
}
```

**Impact:**
- Images servies en taille/format d'origine
- Pas de WebP/AVIF automatique
- Pas de responsive sizing
- Perte estimée: **60-80% de performances sur les images**

**Exemple:**
```typescript
// Actuellement: Image servie à 2 MB
<Image src="/ad.jpg" />

// Avec optimisation: Image servie à 50-100 KB (WebP)
```

**Recommandation:**
```javascript
images: {
  unoptimized: false,  // ✅ Activer l'optimisation
  formats: ['image/webp', 'image/avif'],
  deviceSizes: [640, 750, 828, 1080, 1200],
}
```

#### b) Mode Export Statique
```javascript
output: 'export',  // Ligne 9
```

**Impact:**
- Désactive l'optimisation d'images automatique
- Pas de Server-Side Rendering (SSR)
- Pas d'Incremental Static Regeneration (ISR)
- Toutes les pages sont pré-rendues au build

**Problème pour Performance:**
- Chaque changement nécessite un rebuild complet
- Pas de mise en cache intelligent côté serveur
- Data fetching 100% client-side (plus lent)

**Note:** Si vous déployez sur Firebase Hosting statique, c'est normal. Mais considérez Vercel/Netlify pour SSR.

#### c) Webpack au lieu de Turbopack
```json
"dev": "next dev --webpack",  // package.json ligne 7
```

**Impact:**
- Turbopack est ~10x plus rapide que Webpack en dev
- Compilation initiale: 4.8s → **<1s** avec Turbopack

**Recommandation:**
```json
"dev": "next dev",  // Retirer --webpack pour utiliser Turbopack par défaut
```

---

### 3. 🔄 MODÉRÉ: Patterns de Code

#### a) Re-renders Inutiles
**Fichier:** `app/dashboard/page.tsx`

```typescript
// Ligne 29-34: Fetch à CHAQUE render si user change
useEffect(() => {
  if (user) {
    fetchRecentTransactions()
    fetchAdvertisements()
  }
}, [user])  // ⚠️ user change → refetch
```

**Problème:** Si `user` est un objet, il peut changer de référence sans changer de valeur

**Recommandation:**
```typescript
useEffect(() => {
  if (user?.id) {
    fetchRecentTransactions()
    fetchAdvertisements()
  }
}, [user?.id])  // ✅ Dépendance sur une primitive
```

#### b) Carousel Auto-Scroll avec DOM Query
```typescript
// Ligne 48-53
const autoScrollCarousel = () => {
  const next = document.getElementById("next")
  if (next) next.click()  // ⚠️ Simule un clic DOM
}
```

**Problème:** 
- Manipulation DOM directe (anti-pattern React)
- Peut causer des bugs si le bouton n'est pas monté

**Recommandation:** Utiliser l'API Carousel directement (Embla Carousel)

#### c) Multiple API Calls Séquentiels
```typescript
// Dashboard: 2 appels API séparés
await transactionApi.getHistory(...)
await advertisementApi.get(...)
```

**Impact:** Si chaque appel prend 500ms → **1 seconde** d'attente totale

**Recommandation:**
```typescript
// ✅ Parallèle avec Promise.all
const [transactions, ads] = await Promise.all([
  transactionApi.getHistory({ page: 1, page_size: 5 }),
  advertisementApi.get()
])
```

---

### 4. 📦 Composants UI (69 fichiers identifiés)

**Problème:** Tous les composants UI sont potentiellement chargés même si non utilisés sur une page

**Exemple:**
```
components/ui/
├── accordion.tsx (utilisé rarement)
├── alert-dialog.tsx
├── calendar.tsx (lourd: date-fns)
├── carousel.tsx
├── chart.tsx (lourd: recharts)
├── command.tsx
└── ... 60+ autres
```

**Recommandation:** Dynamic imports pour composants lourds

```typescript
// ✅ Pour composants lourds/conditionnels
const Calendar = dynamic(() => import('@/components/ui/calendar'))
const Chart = dynamic(() => import('@/components/ui/chart'))
```

---

### 5. 🌐 API & Network

#### a) Pas de Cache HTTP Visible
**Problème:** Chaque requête API refetch les données même si inchangées

**Recommandation:**
```typescript
// Dans api-client.ts
axios.defaults.headers['Cache-Control'] = 'max-age=60'

// Ou utiliser SWR pour cache client
import useSWR from 'swr'
const { data } = useSWR('/api/transactions', fetcher)
```

#### b) Prefetching Manquant
```typescript
// ❌ Pas de prefetch des routes suivantes
<Link href="/dashboard/deposit">Dépôt</Link>

// ✅ Avec prefetch
<Link href="/dashboard/deposit" prefetch={true}>
```

---

## 📋 Plan d'Action Prioritisé

### 🔴 URGENT (Impact Élevé, Effort Faible)

1. **Activer Turbopack** (Gain: 80% compilation time)
   ```json
   "dev": "next dev"  // Retirer --webpack
   ```

2. **Déplacer firebase-admin** (Gain: -150 KB bundle)
   ```bash
   pnpm remove firebase-admin
   pnpm add -D firebase-admin
   ```

3. **Paralléliser les API Calls** (Gain: 50% temps chargement)
   ```typescript
   Promise.all([fetch1, fetch2])
   ```

4. **Optimiser useEffect dependencies** (Gain: Moins de re-renders)
   ```typescript
   [user?.id] au lieu de [user]
   ```

### 🟠 IMPORTANT (Impact Élevé, Effort Moyen)

5. **Activer Image Optimization** (Gain: 60-80% taille images)
   - Retirer `unoptimized: true`
   - Configurer formats WebP/AVIF
   - ⚠️ Ne fonctionne pas avec `output: 'export'`

6. **Dynamic Import pour Radix UI** (Gain: -100 KB initial load)
   ```typescript
   const Dialog = dynamic(() => import('@/components/ui/dialog'))
   ```

7. **Centraliser Lucide Icons** (Gain: Meilleur tree-shaking)
   ```typescript
   // lib/icons.ts - Un seul fichier
   export { Plus, Wallet, ArrowRight } from 'lucide-react'
   ```

### 🟢 OPTIMISATION (Impact Moyen, Effort Variable)

8. **Ajouter SWR pour Cache Client**
   ```bash
   pnpm add swr
   ```

9. **Code Splitting par Route**
   - Déjà fait par Next.js, mais vérifier les chunks

10. **Compression Gzip/Brotli**
    - Configurer sur Firebase Hosting

11. **Service Worker pour Cache Assets**
    - PWA manifest déjà présent (firebase-messaging-sw.js)

---

## 🎯 Gains Attendus (Estimation)

| Optimisation | Temps Gagné | Effort |
|-------------|-------------|--------|
| Turbopack | -3 à -4s compilation | 1 min |
| firebase-admin removal | -500ms initial load | 2 min |
| API Promise.all | -250ms render | 5 min |
| useEffect fix | -100ms re-renders | 5 min |
| Image optimization* | -1 à -2s (images) | 30 min |
| Dynamic imports | -300 à -500ms | 1-2h |
| SWR cache | -200 à -400ms (repeat visits) | 2-3h |

**Total Gain Estimé:** **5-8 secondes** sur first load
**Objectif:** Dashboard < 3s (actuellement 10s)

\* Nécessite abandon du mode `export` ou solution alternative

---

## ⚠️ Contraintes à Respecter

Selon vos instructions:
- ✅ **NE PAS modifier la logique métier**
- ✅ **NE PAS modifier l'UI/UX**
- ✅ **Optimisations purement techniques**

Toutes les recommandations ci-dessus respectent ces contraintes.

---

## 📊 Mesures de Performance à Suivre

### Avant Optimisation (Baseline)
```
Dashboard First Load: 10.0s (9.8s compile + 0.24s render)
Home First Load: 5.7s (4.8s compile + 0.85s render)
History Page: 3.4s (3.3s compile + 0.14s render)
```

### Après Optimisations Urgentes (Objectif)
```
Dashboard First Load: < 3s
Home First Load: < 2s
History Page: < 1.5s
Route Changes: < 500ms
```

### Outils de Mesure Recommandés
1. **Chrome DevTools**
   - Performance tab
   - Network tab (désactiver cache)
   - Lighthouse audit

2. **Next.js Bundle Analyzer**
   ```bash
   npm install @next/bundle-analyzer
   ```

3. **Commande de Build avec Stats**
   ```bash
   pnpm build
   ```
   → Affiche la taille de chaque page/chunk

---

## 🔧 Prochaines Étapes

1. **Review ce rapport** avec l'équipe
2. **Prioriser** les optimisations (commencer par URGENT)
3. **Implémenter** une par une avec tests
4. **Mesurer** après chaque changement
5. **Itérer** jusqu'à atteindre les objectifs

---

## 📎 Annexes

### Fichiers à Auditer en Détail
- `lib/api-client.ts` (configuration Axios, intercepteurs)
- `app/layout.tsx` (imports globaux)
- `components/ui/*` (69 composants, beaucoup non utilisés?)

### Questions à Poser
1. Pourquoi `output: 'export'`? Contrainte Firebase Hosting?
2. Peut-on migrer vers Vercel/Netlify pour SSR?
3. Quelles sont les vraies contraintes de déploiement?

---

**Date de l'Audit:** 29 Janvier 2026  
**Auditeur:** Antigravity AI  
**Version SuperCash:** 0.1.0  
**Next.js:** 16.1.3
