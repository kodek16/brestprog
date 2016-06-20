import java.util.*;

//@Test:Solution:Sort:O(N^2):O(N*log(N))
public class Main {

    //@Section:Function
    //[begin, end) - границы отрезка. Заметьте, что end не включительно.
    static void mergeSort(int[] a, int begin, int end) {
        if (end - begin == 1) {
            return;     //Если длина отрезка == 1, то сортировать нечего.
        }

        //Разбиваем отрезок на две приблизительно равные части.
        //Их равенство обеспечивает нам сложность O(N log N)
        int mid = (begin + end) / 2;
        //Рекурсивно сортируем их.
        mergeSort(a, begin, mid);
        mergeSort(a, mid, end);

        int[] t = new int[end - begin];
        int next = 0;
        for (int i = begin, j = mid; i + j < mid + end; ) {
            if (j == end || (i < mid && a[i] < a[j])) { //если вторая часть закончилась,
                                                        //или элемент из первой меньше
                t[next++] = a[i++];
            } else {
                t[next++] = a[j++];
            }
        }

        //Копируем отсортированные элементы из вспомогательного массива t в наш
        //сортируемый массив.
        System.arraycopy(t, 0, a, begin, end - begin);    //библиотечный метод System.arraycopy
    }
    //@EndSection

    public static void main(String[] args) {
        Scanner in = new Scanner(System.in);

        int n = in.nextInt();
        int[] a = new int[n];
        for (int i = 0; i < n; i++) {
            a[i] = in.nextInt();
        }

        mergeSort(a, 0, n);

        for (int x: a) {
            System.out.printf("%d ", x);
        }
    }
}
