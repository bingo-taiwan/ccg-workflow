---
name: typescript
description: TypeScript/JavaScript 開發。前後端、Node.js、React、Vue。當使用者提到 TypeScript、JavaScript、Node、React、Vue、Next.js 時使用。
---

# 📜 符籙秘典 · TypeScript/JavaScript


## TypeScript 基礎

### 型別系統
```typescript
// 基礎型別
let name: string = "Alice";
let age: number = 25;
let active: boolean = true;
let items: string[] = ["a", "b"];
let tuple: [string, number] = ["hello", 10];

// 介面
interface User {
  id: number;
  name: string;
  email?: string;  // 可選
  readonly createdAt: Date;  // 只讀
}

// 型別別名
type ID = string | number;
type Status = "pending" | "active" | "inactive";

// 泛型
function identity<T>(arg: T): T {
  return arg;
}

interface Response<T> {
  data: T;
  status: number;
}

// 工具型別
type Partial<T> = { [P in keyof T]?: T[P] };
type Required<T> = { [P in keyof T]-?: T[P] };
type Pick<T, K extends keyof T> = { [P in K]: T[P] };
type Omit<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>;
```

## Node.js 後端

### Express
```typescript
import express, { Request, Response, NextFunction } from 'express';

const app = express();
app.use(express.json());

// 中介軟體
const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const token = req.headers.authorization;
  if (!token) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  next();
};

// 路由
app.get('/api/users/:id', async (req: Request, res: Response) => {
  const { id } = req.params;
  const user = await getUserById(id);
  res.json(user);
});

app.post('/api/users', async (req: Request, res: Response) => {
  const user = await createUser(req.body);
  res.status(201).json(user);
});

// 錯誤處理
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal Server Error' });
});

app.listen(3000);
```

### Fastify
```typescript
import Fastify from 'fastify';

const fastify = Fastify({ logger: true });

fastify.get('/users/:id', async (request, reply) => {
  const { id } = request.params as { id: string };
  return { id };
});

fastify.listen({ port: 3000 });
```

## React

### 函式元件
```tsx
import React, { useState, useEffect, useCallback } from 'react';

interface User {
  id: number;
  name: string;
}

interface Props {
  userId: number;
  onSelect?: (user: User) => void;
}

const UserCard: React.FC<Props> = ({ userId, onSelect }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUser(userId).then(data => {
      setUser(data);
      setLoading(false);
    });
  }, [userId]);

  const handleClick = useCallback(() => {
    if (user && onSelect) {
      onSelect(user);
    }
  }, [user, onSelect]);

  if (loading) return <div>Loading...</div>;
  if (!user) return <div>User not found</div>;

  return (
    <div onClick={handleClick}>
      <h2>{user.name}</h2>
    </div>
  );
};

export default UserCard;
```

### Hooks
```tsx
// 自定義 Hook
function useFetch<T>(url: string) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    fetch(url)
      .then(res => res.json())
      .then(setData)
      .catch(setError)
      .finally(() => setLoading(false));
  }, [url]);

  return { data, loading, error };
}

// 使用
const { data, loading } = useFetch<User[]>('/api/users');
```

## Vue 3

### Composition API
```vue
<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';

interface User {
  id: number;
  name: string;
}

const props = defineProps<{
  userId: number;
}>();

const emit = defineEmits<{
  (e: 'select', user: User): void;
}>();

const user = ref<User | null>(null);
const loading = ref(true);

const displayName = computed(() => user.value?.name ?? 'Unknown');

onMounted(async () => {
  user.value = await fetchUser(props.userId);
  loading.value = false;
});

const handleClick = () => {
  if (user.value) {
    emit('select', user.value);
  }
};
</script>

<template>
  <div v-if="loading">Loading...</div>
  <div v-else-if="user" @click="handleClick">
    <h2>{{ displayName }}</h2>
  </div>
</template>
```

## 測試

### Jest/Vitest
```typescript
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import UserCard from './UserCard';

describe('UserCard', () => {
  it('should render user name', async () => {
    render(<UserCard userId={1} />);
    expect(await screen.findByText('Alice')).toBeInTheDocument();
  });

  it('should call onSelect when clicked', async () => {
    const onSelect = vi.fn();
    render(<UserCard userId={1} onSelect={onSelect} />);

    const card = await screen.findByRole('button');
    fireEvent.click(card);

    expect(onSelect).toHaveBeenCalledWith({ id: 1, name: 'Alice' });
  });
});

// Mock
vi.mock('./api', () => ({
  fetchUser: vi.fn().mockResolvedValue({ id: 1, name: 'Alice' })
}));
```

## 專案結構

```
myproject/
├── package.json
├── tsconfig.json
├── src/
│   ├── index.ts
│   ├── components/
│   ├── hooks/
│   ├── services/
│   ├── types/
│   └── utils/
├── tests/
└── public/
```

## 常用庫

| 庫 | 用途 |
|---|------|
| Express/Fastify | Node.js 框架 |
| React/Vue | 前端框架 |
| Next.js/Nuxt | 全棧框架 |
| Prisma | ORM |
| Zod | 資料驗證 |
| Vitest/Jest | 測試 |
| ESLint/Prettier | 程式碼規範 |

---

