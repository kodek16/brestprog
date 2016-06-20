//@Test:Solution:ArrayEqualPairs:O(N^2)
import java.util.Scanner;

public class Main {
    public static void main(String[] args) {
        Scanner in = new Scanner(System.in);

        int n = in.nextInt();

        int[] arr = new int[n];
        for (int i = 0; i < n; i++) {
            arr[i] = in.nextInt();
        }

        long ans = 0;

        for (int i = 0; i < n; i++) {           //внешний цикл
            for (int j = i + 1; j < n; j++) {   //внутренний цикл
                if (arr[i] == arr[j]) {
                    ans++;
                }
            }
        }

        System.out.println(ans);
    }
}
