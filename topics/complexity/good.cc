#include <bits/stdc++.h>

using namespace std;

const int MAX_N = 1000000;
const int MAX_VALUE = 1000000;

int arr[MAX_N];

// Для чисел от 0 до 1000000.
// Мы будем умножать эти значения, поэтому используем тип long long
// для предотвращения переполнения.
long long num_count[MAX_VALUE + 1];

int main() {
    int n;
    cin >> n;

    for (int i = 0; i < n; i++) {
        cin >> arr[i];
        num_count[arr[i]]++;
    }

    long long ans = 0;

    for (int i = 0; i <= MAX_VALUE; i++) {
        ans += num_count[i] * (num_count[i] - 1) / 2;
    }

    cout << ans << endl;
}
