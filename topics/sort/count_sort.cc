#include <bits/stdc++.h>

using namespace std;

const int MAX_VALUE = 1000000;

int main() {
    int n;
    cin >> n;

    vector<int> a(n);
    for (int i = 0; i < n; i++) {
        cin >> a[i];
    }

    vector<int> num_count(MAX_VALUE + 1, 0);
    for (int x: a) {
        num_count[x]++;
    }

    for (int num = 1; num <= MAX_VALUE; num++) {
        for (int i = 0; i < num_count[num]; i++) {
            cout << num << ' ';
        }
    }
    cout << endl;
}
