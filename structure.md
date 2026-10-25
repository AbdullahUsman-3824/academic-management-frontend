# Frontend Structure Guide

This document explains the structure and state-management approach used by the Academic Management frontend. It is also a blueprint for creating the same kind of structure in another React project.

The main rule is:

> React Query owns server state. Redux owns client-side application state.

Server state is data that comes from the backend and can become stale. Client state is state created and controlled by the browser application.

## 1. Technology Stack

- React for the user interface.
- Vite for development and production builds.
- React Router for URL and page routing.
- Axios for HTTP requests.
- TanStack React Query for server data, caching, queries, and mutations.
- Redux Toolkit for client-side global state.
- Material UI for some shared UI primitives.
- TypeScript and JSX/TSX for application code.

## 2. Project Structure

```text
src/
|-- api/
|   |-- client.ts              # Shared Axios instance
|   |-- auth.ts                # Auth HTTP functions and types
|   `-- academic.ts            # Academic HTTP functions and types
|-- app/
|   |-- providers/
|   |   |-- AppProviders.tsx   # Redux and React Query providers
|   |   |-- AuthInitializer.tsx# Restore session when app starts
|   |   `-- PortalProvider.tsx  # Portal-specific context
|   |-- router/
|   |   |-- index.tsx          # Top-level routes
|   |   |-- ProtectedRoute.tsx # Authentication route guard
|   |   `-- PortalRoutes.jsx   # Portal route selection
|   `-- store/
|       |-- index.ts            # Redux store and types
|       `-- authSlice.ts        # Authentication Redux slice
|-- features/
|   |-- admin/                 # Admin layout, pages, data, and routes
|   |-- student/               # Student layout, pages, and routes
|   |-- faculty/               # Faculty feature area
|   |-- finance/               # Finance feature area
|   `-- common/                # Shared pages such as login
|-- hooks/
|   |-- useAuth.ts             # Auth mutations and queries
|   `-- useAcademicQueries.ts  # Academic React Query hooks
|-- shared/components/         # Reusable components
|-- styles/                    # Global and portal styles
|-- App.jsx                    # App providers and router
`-- main.jsx                   # React entry point
```

### Responsibility of each layer

| Layer | Responsibility | Should not contain |
| --- | --- | --- |
| `api/` | HTTP functions and response types | React hooks or UI decisions |
| `hooks/` | React Query and reusable application logic | Large JSX layouts |
| `app/store/` | Redux client-side state | API cache management |
| `features/` | Pages and feature workflows | A second Axios client |
| `app/router/` | URL and access decisions | Detailed data fetching |
| `app/providers/` | Global application initialization | Feature-specific page markup |
| `shared/` | Components used by several features | Feature-specific business rules |

## 3. Application Startup

The application starts in this order:

```text
main.jsx
  -> App.jsx
    -> AppProviders
      -> Redux Provider
      -> QueryClientProvider
      -> AuthInitializer
        -> RouterProvider
```

`main.jsx` mounts React. `App.jsx` wraps the router with the global providers. Once the providers exist, every page can use Redux and React Query.

### Redux provider

The Redux `Provider` makes the Redux store available to every component.

### React Query provider

The `QueryClientProvider` makes one shared React Query cache available to every component. Do not create a new `QueryClient` inside a component, because that would create separate caches.

```tsx
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
})
```

### Auth initializer

`AuthInitializer` checks the existing backend session before rendering the application. This prevents a protected route from redirecting to login while `/auth/me` is still being checked.

## 4. Axios API Layer

Create one shared Axios instance in `src/api/client.ts`:

```ts
import axios from 'axios'

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
})

export default apiClient
```

The `.env` file contains the backend URL:

```env
VITE_API_BASE_URL=http://localhost:3000
```

`withCredentials: true` is required when the backend uses an HTTP-only authentication cookie.

The JWT should not be stored in localStorage, sessionStorage, or Redux. The browser sends the HTTP-only cookie automatically, and JavaScript cannot read it.

### API modules

Each backend area gets an API module. The module contains types and small HTTP functions:

```ts
export interface AcademicYear {
  id: string
  name: string
  startDate: string
  endDate: string
  status: 'active' | 'inactive' | 'completed'
}

export async function getYears(status?: string) {
  const { data } = await apiClient.get<AcademicYear[]>('/academics/years', {
    params: status ? { status } : undefined,
  })

  return data
}
```

The API function knows the endpoint and response type. It does not render UI or decide how loading and error states should look.

## 5. React Query: Server State

React Query manages data that belongs to the backend:

- Lists returned by the API.
- Detail records.
- Loading and error states.
- Cache and stale time.
- Refetching.
- Create, update, delete, and action mutations.
- Refreshing related data after a mutation.

A page should not call Axios directly. The normal flow is:

```text
Backend endpoint
  -> API function
    -> React Query hook
      -> feature page
        -> reusable component
```

### Query hook

Create a custom hook around each useful query:

```ts
import { useQuery } from '@tanstack/react-query'
import * as api from '../api/academic'

export const academicKeys = {
  all: ['academics'] as const,
  years: {
    all: () => [...academicKeys.all, 'years'] as const,
    list: (status?: string) =>
      [...academicKeys.years.all(), { status }] as const,
    detail: (id: string) => [...academicKeys.years.all(), id] as const,
  },
}

export function useYears(status?: string) {
  return useQuery({
    queryKey: academicKeys.years.list(status),
    queryFn: () => api.getYears(status),
    staleTime: 60_000,
  })
}
```

A page consumes the hook:

```tsx
const { data: years = [], isLoading, isError } = useYears('active')

if (isLoading) return <LoadingState />
if (isError) return <ErrorState />

return <YearTable years={years} />
```

### Query keys

A query key identifies cached data. Keys must include values that change the request:

```ts
academicKeys.years.list(status)
academicKeys.years.detail(id)
academicKeys.sessions.list(filters)
```

A list and a detail must have different keys. A filtered list must include its filter. Use key factories so components do not invent inconsistent arrays.

### Mutations

Use `useMutation` for changes:

```ts
export function useUpdateYear() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: UpdateAcademicYearDto }) =>
      api.updateYear(id, dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: academicKeys.years.all() })
      queryClient.invalidateQueries({ queryKey: academicKeys.overview() })
    },
  })
}
```

The page calls:

```tsx
const updateYear = useUpdateYear()

updateYear.mutate({
  id: year.id,
  dto: { name: 'Updated name' },
})
```

After the update, invalidated queries become stale and React Query fetches fresh backend data. This avoids manually changing every table and dashboard that uses the same resource.

## 6. Redux Toolkit: Client State

Redux Toolkit manages global state created by the frontend itself.

Good Redux use cases:

- Current authenticated user used by route guards.
- Sidebar open or closed state.
- Theme or language preference.
- Multi-step form draft.
- Temporary client-only selections.

Do not put normal API lists, API loading flags, or API responses into Redux if React Query already manages them. Duplicating server state creates two sources of truth.

### Store

`src/app/store/index.ts` creates the store:

```ts
import { configureStore } from '@reduxjs/toolkit'
import authReducer from './authSlice'

export const store = configureStore({
  reducer: {
    auth: authReducer,
  },
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
```

The `RootState` type is used by selectors. The `AppDispatch` type is used by typed dispatch hooks if the project adds them later.

### Slice

A slice contains one area of client state and its actions:

```ts
interface AuthState {
  user: User | null
}

const initialState: AuthState = {
  user: null,
}

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setUser: (state, action: PayloadAction<User>) => {
      state.user = action.payload
    },
    clearUser: (state) => {
      state.user = null
    },
  },
})
```

A component reads and changes Redux state like this:

```tsx
const user = useSelector((state: RootState) => state.auth.user)
const dispatch = useDispatch()

dispatch(setUser(userFromApi))
```

Redux state exists only in browser memory unless persistence is deliberately added. Therefore, Redux is empty after a full page refresh. The application must restore the user by calling the backend.

## 7. Redux And React Query Together

This project currently mirrors the authenticated user in both systems.

### Login flow

```text
Login page
  -> useAuth().login()
    -> React Query mutation
      -> POST /auth/login
        -> backend sets HTTP-only cookie
        -> backend returns user
          -> dispatch(setUser(user))
          -> queryClient.setQueryData(['auth', 'me'], user)
```

React Query performs the request and cache operation. Redux exposes the user to route guards and layouts.

### Refresh flow

```text
Browser refresh
  -> Redux memory starts empty
    -> AuthInitializer calls GET /auth/me
      -> browser sends auth cookie
        -> backend returns user
          -> dispatch(setUser(user))
            -> ProtectedRoute allows the page
```

The initial auth check must finish before the routes render. Otherwise, `ProtectedRoute` sees `user = null` for a moment and sends a valid user to `/login`.

### The boundary

```text
React Query: What does the backend currently say?
Redux:       What does this browser application need immediately?
```

For a new project, the cleanest approach is usually to let React Query be the single source of truth for the authenticated user as well. Then protected routes can read the `auth/me` query directly.

This project keeps a Redux mirror because its existing `ProtectedRoute` and portal layouts read from Redux. If both copies are kept, every login, refresh, and logout path must update both consistently.

## 8. Authentication

`useAuth.ts` is the authentication boundary:

- `useMutation` calls the login API function.
- The mutation `onSuccess` dispatches `setUser`.
- The mutation also updates the `['auth', 'me']` cache.
- `useQuery` defines the current-user request.
- `enabled: false` prevents the current-user request from running automatically.
- `AuthInitializer` explicitly calls `refetchUser()` once on startup.
- `ProtectedRoute` redirects to login when Redux has no user.

A logout flow should call the backend first and then clear local state:

```ts
await apiClient.post('/auth/logout')
dispatch(clearUser())
queryClient.removeQueries({ queryKey: ['auth', 'me'] })
```

The backend and browser must agree on cookie settings. For local HTTP development, `SameSite=None` requires `Secure` and is rejected by browsers without HTTPS. Use `SameSite=Lax` locally or run local HTTPS. In production, use secure HTTPS cookie settings.

## 9. Routing

The top-level routes are divided into public and protected routes:

```text
/login       public login page
/*           protected portal routes
```

`ProtectedRoute` checks whether a user exists. `PortalProvider` and `PortalRoutes` then choose the portal based on `user.portal`.

Each portal owns its own route configuration:

```ts
export const adminRoutes = {
  layout: AdminLayout,
  children: [
    { index: true, element: <DashboardPage /> },
    { path: 'academic', element: <AcademicManagementPage /> },
  ],
}
```

This keeps admin pages together and allows student, faculty, and finance routes to evolve independently.

## 10. Feature Creation Checklist

For a new backend resource called `courses`:

1. Create `src/api/courses.ts`.
2. Add interfaces for course responses and request DTOs.
3. Add plain HTTP functions such as `getCourses`, `getCourse`, and `updateCourse`.
4. Create `src/hooks/useCourseQueries.ts`.
5. Add a `courseKeys` query-key factory.
6. Add list, detail, and mutation hooks.
7. Invalidate related keys after successful mutations.
8. Create the page under `src/features/<portal>/pages/`.
9. Add the page to that portal's route configuration.
10. Use the custom hook in the page instead of using Axios directly.

Recommended shape:

```text
api/courses.ts
  getCourses()
  getCourse(id)
  updateCourse(id, dto)

hooks/useCourseQueries.ts
  courseKeys.all()
  courseKeys.list(filters)
  courseKeys.detail(id)
  useCourses(filters)
  useCourse(id)
  useUpdateCourse()

features/admin/pages/CourseManagementPage.tsx
  useCourses(filters)
  useUpdateCourse()
```

## 11. Common Mistakes

- Calling Axios directly inside a page component.
- Creating a separate Axios client for every feature.
- Storing JWT tokens in localStorage or Redux.
- Putting the same server list in both Redux and React Query.
- Omitting filters or IDs from query keys.
- Forgetting to invalidate related queries after a mutation.
- Rendering protected routes before the initial auth check finishes.
- Creating a new `QueryClient` during every render.
- Mixing feature-specific styles into the global app entry point.
- Continuing to use mock data after the real API hook exists.
- Updating Redux after login but forgetting to update the query cache.
- Clearing Redux on logout but leaving stale authenticated data in React Query.

## 12. Beginner Mental Model

When you need backend data:

```text
Backend endpoint
  -> API function
    -> React Query hook
      -> feature page
        -> reusable component
```

When you need browser-only state:

```text
Redux slice
  -> selector in component
  -> dispatch action when it changes
```

When you need authentication:

```text
HTTP-only cookie proves the session
React Query asks the backend who is logged in
Redux currently exposes that user to route guards
```
