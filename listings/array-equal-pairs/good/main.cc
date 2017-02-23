#include <bits/stdc++.h>
/*@ hide @*/
#ifdef TESTING
#include "listing_utils.hh"
#endif
/*@ end @*/

using namespace std;

const int MAX_N = 1000000;
const int MAX_VALUE = 1000000;

int arr[MAX_N];

// Для чисел от 0 до 1000000.
// Мы будем умножать эти значения, поэтому используем тип long long
// для предотвращения переполнения.
long long num_count[MAX_VALUE + 1];

/*@ hide @*/
#ifdef TESTING
void test_main(istringstream& cin, stringstream& cout) {
    fill(num_count, num_count + MAX_VALUE + 1, 0LL);
#else
/*@ end @*/
int main() {
/*@ hide @*/
#endif
/*@ end @*/
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

/*@ hide @*/
#ifdef TESTING

void max_test_different() {
    stringstream input;
    input << MAX_N << endl;

    for (int i = 0; i < MAX_N; i++) {
        input << i + 1 << ' ';
    }
    input << endl;

    test_token_sequence(test_main, input.str(), "0");
}

void max_test_same() {
    stringstream input;
    input << MAX_N << endl;

    for (int i = 0; i < MAX_N; i++) {
        input << "5 ";
    }
    input << endl;

    test_token_sequence(test_main, input.str(), "499999500000");
}

int main() {
    cerr << "Testing array-equal-pairs/good (C++)..." << endl;
    test_token_sequence(test_main, "3\n1 2 2", "1");
    test_token_sequence(test_main, "4\n1 2 3 4", "0");
    test_token_sequence(test_main, "5\n7 7 7 7 7", "10");
    max_test_different();
    max_test_same();
    cerr << "OK!" << endl;
}
#endif
/*@ end @*/
