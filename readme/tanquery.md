## TanStack Query (trước đây là React Query) là một thư viện cực kỳ mạnh giúp bạn quản lý dữ liệu bất đồng bộ (async data) trong ứng dụng React như:

Gọi API (fetch)

Caching (bộ nhớ đệm)

Tự động refetch, invalidate dữ liệu

Hiển thị trạng thái tải, lỗi, dữ liệu...

## Cú pháp

```ts
const { data, isLoading, isError, error } = useQuery({
queryKey: ['users'], // khóa duy nhất
queryFn: fetchUsers, // hàm fetch  -> các hàm gọi api
staleTime: 1000 _ 60 _ 5, // optional: cache trong 5 phút
});
```

## Một số hook phổ biến

Hook Mục đích
useQuery Lấy dữ liệu (GET)
useMutation Thêm, xóa, cập nhật dữ liệu (POST, PUT, DELETE)
useInfiniteQuery Vô hạn scroll / phân trang
useQueryClient Tương tác với cache thủ công (invalidate, refetch...)

1.useMutation

```ts
const queryClient = useQueryClient();

const mutation = useMutation({
  mutationFn: createUser,
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ['users'] }); // refetch danh sách user
  },
});
```

KHÔNG CẦN DÙNG nữa:

Hook cũ Vì sao không cần nữa
useState Không cần useState để lưu dữ liệu từ API (data đã có sẵn từ useQuery)
useEffect Không cần useEffect để gọi API khi component mount
axios.get(...) trong useEffect Được thay bằng queryFn trong useQuery
loading tự tạo Đã có sẵn isLoading, isError, data, error
try/catch trong useEffect TanStack Query xử lý lỗi tự động
refetch thủ công Có sẵn refetch() hoặc invalidateQueries() để làm
