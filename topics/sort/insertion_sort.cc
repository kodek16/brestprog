void insertion_sort(vector<int>& v) {
    for (int i = 0; i < v.size(); i++) {
        int cur = i;
        while (cur > 0 && v[cur - 1] > v[cur]) {
            swap(v[cur - 1], v[cur]);
            cur--;
        }
    }
}
