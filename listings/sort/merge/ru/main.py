#@Test:Solution:Sort:O(N^2):O(N*log(N))
#@Section:Function
#[begin, end) - границы отрезка. Заметьте, что end не включительно.
def merge_sort(a, begin, end):
    if (end - begin == 1):
        return     #Если длина отрезка == 1, то сортировать нечего.

    #Разбиваем отрезок на две приблизительно равные части.
    #Их равенство обеспечивает нам сложность O(N log N)
    mid = (begin + end) // 2
    #Рекурсивно сортируем их.
    merge_sort(a, begin, mid)
    merge_sort(a, mid, end)

    t = []
    i, j = begin, mid
    while i + j < mid + end:
        if j == end or (i < mid and a[i] < a[j]): #если вторая часть закончилась,
                                                  #или элемент из первой меньше
            t.append(a[i])
            i += 1
        else:
            t.append(a[j])
            j += 1

    #Копируем отсортированные элементы из вспомогательного массива t в наш
    #сортируемый массив.
    a[begin:end] = t
#@EndSection

n = int(input())
arr = list(map(int, input().split(' ')))

merge_sort(arr, 0, n)

print(' '.join(map(str, arr)))
