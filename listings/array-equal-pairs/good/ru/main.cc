//@Test:Solution:ArrayEqualPairs:O(N^2):O(N)
#include <bits/stdc++.h>;

using namespace std;

int arr[1000000];
long long c[1000001];       //для чисел от 0 до 1000000
                            //мы будем умножать эти значения,
                            //поэтому используем тип long long
                            //для предотвращения переполнения

int main() {
    int n;
    cin >> n;

    for (int i = 0; i < n; i++) {
        cin >> arr[i];
        c[arr[i]]++;
    }

    long long ans = 0;

    for (int i = 0; i <= 1000000; i++) {
        ans += c[i] * (c[i] - 1) / 2;
    }

    cout << ans;
}
