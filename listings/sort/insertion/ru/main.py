#@Test:Solution:Sort:O(N^2)
#@Section:Function
def insertion_sort(a):
    for i in range(len(a)):
        j = i
        while j > 0 and a[j] < a[j - 1]:
            a[j], a[j - 1] = a[j - 1], a[j]
            j -= 1
#@EndSection

n = int(input())
arr = list(map(int, input().split(' ')))

insertion_sort(arr)

print(' '.join(map(str, arr)))
