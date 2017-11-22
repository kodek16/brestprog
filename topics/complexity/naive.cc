#include <bits/stdc++.h>

using namespace std;

const int MAX_N = 1000000;

int arr[MAX_N];

int main() {
    int n;
    cin >> n;

    for (int i = 0; i < n; i++) {
        cin >> arr[i];
    }

    long long ans = 0;

    for (int i = 0; i < n; i++) {           // внешний цикл
        for (int j = i + 1; j < n; j++) {   // внутренний цикл
            if (arr[i] == arr[j]) {
                ans++;
            }
        }
    }

    cout << ans << endl;
}
