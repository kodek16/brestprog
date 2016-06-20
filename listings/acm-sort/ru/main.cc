//@Test:Solution:AcmSort:O(N*log(N))
#include <bits/stdc++.h>

using namespace std;

//Результаты команды
struct team {
    string name;
    int tasks;      //решённых задач
    int penalty;    //штраф
};

bool cmp(team a, team b) {
    //Если у первой команды больше задач, она должна находиться перед второй.
    if (a.tasks > b.tasks) {
        return true;
    //Аналогично для второй.
    } else if (a.tasks < b.tasks) {
        return false;
    //Если количество задач одинаковое, сравниваем штраф, на этот раз меньший
    //штраф - лучше.
    //Обратите внимание, что если количество задач и штраф двух команд равны,
    //то как cmp(a, b), так и cmp(b, a) вернут false. Так должно быть!
    } else {
        return a.penalty < b.penalty;
    }
}

int main() {
    vector<team> teams;

    int n;
    cin >> n;

    for (int i = 0; i < n; i++) {
        string name;
        int tasks;
        int penalty;
        cin >> name >> tasks >> penalty;    //Имя команды не должно содержать пробелов.
        teams.push_back({ name, tasks, penalty });
    }

    //Про стабильную сортировку ниже.
    stable_sort(teams.begin(), teams.end(), cmp);

    for (team t: teams) {
        cout << t.name << ' ' << t.tasks << ' ' << t.penalty << endl;
    }
}
