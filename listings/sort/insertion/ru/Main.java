import java.util.*;

//@Test:Solution:Sort:O(N^2)
public class Main {

    //@Section:Function
    static void insertionSort(int[] a) {
        for (int i = 0; i < a.length; i++) {
            for (int j = i; j > 0 && a[j] < a[j - 1]; j--) {
                int t = a[j];
                a[j] = a[j - 1];
                a[j - 1] = t;
            }
        }
    }
    //@EndSection

    public static void main(String[] args) {
        Scanner in = new Scanner(System.in);

        int n = in.nextInt();
        int[] a = new int[n];
        for (int i = 0; i < n; i++) {
            a[i] = in.nextInt();
        }

        insertionSort(a);

        for (int x: a) {
            System.out.printf("%d ", x);
        }
    }
}
