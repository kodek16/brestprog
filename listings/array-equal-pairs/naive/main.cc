#include <bits/stdc++.h>
/*@ hide @*/
#ifdef TESTING
#include "listing_utils.hh"
#endif
/*@ end @*/

using namespace std;

const int MAX_N = 1000000;

int arr[MAX_N];

/*@ hide @*/
#ifdef TESTING
void test_main(istringstream& cin, stringstream& cout) {
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

/*@ hide @*/
#ifdef TESTING

const int MAX_WORKING_N = 10000;

void big_test_different() {
    stringstream input;
    input << MAX_WORKING_N << endl;

    for (int i = 0; i < MAX_N; i++) {
        input << i + 1 << ' ';
    }
    input << endl;

    test_token_sequence(test_main, input.str(), "0");
}

void big_test_same() {
    stringstream input;
    input << MAX_WORKING_N << endl;

    for (int i = 0; i < MAX_N; i++) {
        input << "5 ";
    }
    input << endl;

    test_token_sequence(test_main, input.str(), "49995000");
}

int main() {
    cerr << "Testing array-equal-pairs/naive (C++)..." << endl;
    test_token_sequence(test_main, "3\n1 2 2", "1");
    test_token_sequence(test_main, "4\n1 2 3 4", "0");
    test_token_sequence(test_main, "5\n7 7 7 7 7", "10");
    big_test_different();
    big_test_same();
    cerr << "OK!" << endl;
}

#endif
/*@ end @*/
