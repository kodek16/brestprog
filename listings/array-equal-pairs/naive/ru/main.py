#@Test:Solution:ArrayEqualPairs:O(N^2)
n = int(input())
arr = list(map(int, input().split(' ')))

ans = 0

for i in range(len(arr)):               #Внешний цикл
    for j in range(i + 1, len(arr)):    #Внутренний цикл
        if arr[i] == arr[j]:
            ans += 1

print(ans)
