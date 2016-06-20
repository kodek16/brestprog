//@Test:Solution:Sort:O(N^2):O(N*log(N))
#include <bits/stdc++.h>

using namespace std;

//@Section:Function
//[begin, end) - границы отрезка. Заметьте, что end не включительно.
void merge_sort(vector<int>& v, int begin, int end) {
    if (end - begin == 1) {
        return;     //Если длина отрезка == 1, то сортировать нечего.
    }

    //Разбиваем отрезок на две приблизительно равные части.
    //Их равенство обеспечивает нам сложность O(N log N)
    int mid = (begin + end) / 2;
    //Рекурсивно сортируем их.
    merge_sort(v, begin, mid);
    merge_sort(v, mid, end);

    vector<int> t;
    t.reserve(end - begin);     //Небольшая оптимизация
    for (int i = begin, j = mid; i + j < mid + end; ) {
        if (j == end || (i < mid && v[i] < v[j])) { //если вторая часть закончилась,
                                                    //или элемент из первой меньше
            t.push_back(v[i++]);
        } else {
            t.push_back(v[j++]);
        }
    }

    //Копируем отсортированные элементы из вспомогательного массива t в наш
    //сортируемый массив.
    copy(t.begin(), t.end(), v.begin() + begin);    //библиотечная функция std::copy
}
//@EndSection

int main() {
    int n;
    cin >> n;

    vector<int> v(n);
    for (int i = 0; i < n; i++) {
        cin >> v[i];
    }

    merge_sort(v, 0, n);

    for (int x: v) {
        cout << x << ' ';
    }
}
