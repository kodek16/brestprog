//@Test:Solution:ArrayEqualPairs:O(N^2):O(N)
import java.util.Scanner;

public class Main {
    public static void main(String[] args) {
        Scanner in = new Scanner(System.in);

        int n = in.nextInt();

        int[] arr = new int[n];
        long[] c = new long[1000001];   //для чисел от 0 до 1000000
                                        //мы будем умножать эти значения,
                                        //поэтому используем тип long
                                        //для предотвращения переполнения

        for (int i = 0; i < n; i++) {
            arr[i] = in.nextInt();
            c[arr[i]]++;
        }

        long ans = 0;

        for (int i = 0; i <= 1000000; i++) {
            ans += c[i] * (c[i] - 1) / 2;
        }

        System.out.println(ans);
    }
}
