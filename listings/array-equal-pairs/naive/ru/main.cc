//@Test:Solution:ArrayEqualPairs:O(N^2)
#include <bits/stdc++.h>

using namespace std;

int main() {
    int n;
    cin >> n;

    vector<int> arr(n);

    for (int i = 0; i < n; i++) {
        cin >> arr[i];
    }

    long long ans = 0;

    for (int i = 0; i < n; i++) {           //внешний цикл
        for (int j = i + 1; j < n; j++) {   //внутренний цикл
            if (arr[i] == arr[j]) {
                ans++;
            }
        }
    }

    cout << ans;
}
