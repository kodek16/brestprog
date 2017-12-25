#include <bits/stdc++.h>

using namespace std;

struct team {
    string name;
    int tasks;      // количество решённых задач
    int penalty;    // штраф
};

// cmp(A, B) == true тогда и только тогда, когда команда
// A в таблице результатов должна оказаться выше команды B.
bool cmp(team a, team b) {
    return a.tasks > b.tasks
        || (a.tasks == b.tasks && a.penalty < b.penalty);
}

int main() {
    vector<team> teams {
        {"Team BSEU", 9, 300},
        {"Team BSU", 10, 350},
        {"Team BSUIR", 9, 200}
    };

    sort(teams.begin(), teams.end(), cmp);

    for (team t: teams) {
        cout << t.name << endl;
    }
}
