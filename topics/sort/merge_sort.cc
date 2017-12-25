void merge_sort(vector<int>& v, int begin, int end) {
    // Для отрезков длиной 1 не выполняем никаких операций.
    // Это так называемый "базовый" (крайний) случай рекурсии, который
    // гарантирует, что алгоритм закончит своё выполнение.
    if (begin == end) {
        return;
    }

    int mid = (begin + end) / 2;

    // Рекурсивные вызовы алгоритма.
    merge_sort(v, begin, mid);
    merge_sort(v, mid + 1, end);

    // Собственно слияние.
    vector<int> t;
    for (int i = begin, j = mid + 1; i <= mid || j <= end;) {
        // Если одна из частей закончилась, добавляем элемент из другой
        if (i > mid) {
            t.push_back(v[j++]);
        } else if (j > end) {
            t.push_back(v[i++]);
        // Иначе добавляем меньший из текущих элементов
        } else if (v[i] <= v[j]) {
            t.push_back(v[i++]);
        } else {
            t.push_back(v[j++]);
        }
    }

    // Копируем отсортированный отрезок из временного массива в v.
    for (int i = 0; i < t.size(); i++) {
        v[begin + i] = t[i];
    }
}
