//@Test:Solution:AcmSort:O(N*log(N))
import java.util.*;

public class Main {

    //Результаты команды
    static class Team {
        String name;
        int tasks;      //решённых задач
        int penalty;    //штраф

        Team(String name, int tasks, int penalty) {
            this.name = name;
            this.tasks = tasks;
            this.penalty = penalty;
        }
    }

    //Используется функциональный подход из Java 8.
    static int compare(Team a, Team b) {
        //Если количество решённых задач отличается, раньше должна находиться
        //та команда, у которой их больше. Выражение b.tasks - a.tasks
        //принимает отрицательные/положительные значение в соответствии с этим условием:
        //разность двух чисел - часто встречающаяся операция в компараторах.
        if (a.tasks != b.tasks) {
            return b.tasks - a.tasks;
        //Если количество задач равно, выполняем ту же операцию со штрафом.
        //Заметьте, что теперь левый операнд - a.penalty, поэтому сортировка
        //будет идти по возрастанию штрафа, а не убыванию.
        } else {
            return a.penalty - b.penalty;
        }
    }

    public static void main(String[] args) {
        Scanner in = new Scanner(System.in);

        int n = in.nextInt();

        Team[] teams = new Team[n];

        for (int i = 0; i < n; i++) {
            String name = in.next();    //Имя команды не должно содержать пробелов.
            int tasks = in.nextInt();
            int penalty = in.nextInt();
            teams[i] = new Team(name, tasks, penalty);
        }

        Arrays.sort(teams, Main::compare);

        for (Team team: teams) {
            System.out.printf("%s %d %d\n", team.name, team.tasks, team.penalty);
        }
    }
}
