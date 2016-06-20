#@Test:Solution:ArrayEqualPairs:O(N^2):O(N)
n = int(input())
arr = list(map(int, input().split(' ')))

c = [0] * 1000001   #для чисел от 0 до 1000000
for elem in arr:
    c[elem] += 1

ans = 0

for x in c:
    ans += int(x * (x - 1) / 2)

print(ans)
