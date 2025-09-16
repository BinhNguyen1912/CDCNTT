- Khi page nào của ta có sử dụng `useSearchParams` thì bắt buộc phải bọc page đó vào cặp thẻ `Suspense`

```tsx
export default function RefreshTokenPage() {
  return (
    <Suspense fallback={<div>Loading.....</div>}>
      <RefreshToken />
    </Suspense>
  );
}
```
