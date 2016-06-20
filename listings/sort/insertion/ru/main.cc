//@Test:Solution:Sort:O(N^2)
#include <bits/stdc++.h>

using namespace std;

//@Section:Function
void insertion_sort(vector<int>& v) {
    for (int i = 0; i < v.size(); i++) {
        for (int j = i; j > 0 && v[j] < v[j - 1]; j--) {
            swap(v[j], v[j - 1]);
        }
    }
}
//@EndSection

int main() {
    int n;
    cin >> n;

    vector<int> v(n);
    for (int i = 0; i < n; i++) {
        cin >> v[i];
    }

    insertion_sort(v);

    for (int x: v) {
        cout << x << ' ';
    }
}
