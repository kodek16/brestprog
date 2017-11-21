---
layout: topic
title: Длинная арифметика
permalink: topics/longarithmetics
---

### Определение

Длинная арифметика - набор алгоритмов для поразрядной работы с числами
произвольной длины. Она применяется как с относительно небольшими числами,
превышающими ограничения типа <code>long long</code> в несколько раз, так и с
по-настоящему большими числами (чаще всего до $$10^{100000}$$).

Для работы с "длинными" числами их разбивают на *разряды*. Размер
разряда может быть произвольным, но чаще всего используются следующие:


- $$10$$ - по аналогии с цифрами числа в десятичной системе, для простоты
    понимания и отладки.

- $$10^4$$ - набольшая степень десяти, квадрат которой не превышает
    ограничения типа <code>int</code>. Используется для максимальной эффективности
    при хранении разрядов как чисел типа <code>int</code>.

- $$10^9$$ - аналогично предыдущему пункту, но для типа
    <code>long long</code>. Позволяет достичь максимально возможной эффективности.


(Ограничения на квадрат размера разряда связаны с необходимостью перемножать между
собой разряды. Если квадрат разряда превышает ограничение своего типа, при умножении
возможны переполнения.)

В большинстве реализаций разряды хранятся в порядке, обратным привычному для
упрощения работы с ними. Например число $$578002300$$ при размере разряда $$10^4$$
представляется следующим массивом:

$$\{2300, 7800, 5\}$$

Количество разрядов числа может быть как ограничено, так и не ограничено, в
зависимости от типа используемого контейнера: массива константной длины или
вектора.

### Реализация

Далее будет приведена реализация длинной арифметики, использующая размер
разряда $$10^9$$, и массив константой длины $$10$$ для хранения разрядов. Таким
образом, эта реализация позволяет быстро работать с числами до $$10^{90}$$.

Реализация будет приведена в виде структуры <code>bigint</code> с перегруженными
математическими операторами. Предполагается владение соответствующим материалом по
C++.

Начнём с основных элементов структуры:

{% highlight cpp linenos %}
struct bigint {

    static const long long BASE = 1e9;     //размер разряда
    static const long long SIZE = 10;      //количество вмещаемых разрядов

    long long digits[SIZE];

    bigint() {                                  //стандартный конструктор
        for (int i = 0; i < SIZE; i++) {
            digits[i] = 0;
        }
    }

    bigint(long long x) {                       //конструктор для преобразования обычного числа в длинное
        for (int i = 0; i < SIZE; i++) {
            digits[i] = 0;
        }

        int next = 0;
        while (x) {
            digits[next++] = x % BASE;
            x /= BASE;
        }
    }

    bigint(const bigint& other) {           //конструктор копирования
        for (int i = 0; i < SIZE; i++) {
            digits[i] = other.digits[i];
        }
    }

    bigint& operator=(const bigint& other) {    //оператор присваивания
        for (int i = 0; i < SIZE; i++) {
            digits[i] = other.digits[i];
        }

        return *this;
    }
{% endhighlight %}


### Сложение

Длинную арифметику часто сравнивают с детским вычислением "в столбик". Это
достаточно справедливо, так как оба методы основаны на поразрядных операциях.
Если вы умеете складывать в столбик, то реализация длинного сложения не должна
вызвать у вас трудностей:

{% highlight cpp linenos %}
    void operator+=(const bigint& other) {
        for (int i = 0; i < SIZE; i++) {        //сначала сложим числа поразрядно,
            digits[i] += other.digits[i];       //игнорируя переполнения
        }

        for (int i = 0; i < SIZE - 1; i++) {    //а затем поочередно выполним переносы
            if (digits[i] >= BASE) {            //для каждого разряда
                digits[i] -= BASE;
                digits[i + 1]++;
            }
        }
    }

    bigint operator+(const bigint& other) {
        bigint n(*this);
        n += other;
        return n;
    }

    bigint& operator++() {
        *this += 1;
        return *this;
    }
{% endhighlight %}


### Вычитание

Вычитание реализуется симметрично сложению:

{% highlight cpp linenos %}
    void operator-=(const bigint& other) {
        for (int i = 0; i < SIZE; i++) {
            digits[i] -= other.digits[i];
        }

        for (int i = 0; i < SIZE - 1; i++) {
            if (digits[i] < 0) {
                digits[i] += BASE;
                digits[i + 1]--;
            }
        }
    }

    bigint operator-(const bigint& other) {
        bigint n(*this);
        n -= other;
        return n;
    }

    bigint& operator--() {
        *this -= 1;
        return *this;
    }
{% endhighlight %}


### Умножение

Реализация умножения немного отличается от алгоритма умножения в столбик,
но принцип сохраняется: перемножим каждый разряд одного числа на каждый разряд
другого. При умножении разряда $$i$$ на разряд $$j$$ добавим результат к разряду
$$i + j$$ произведения (0-индексация). После этого выполним переносы аналогично
сложению:

{% highlight cpp linenos %}
    void operator*=(const bigint& other) {
        *this = *this * other;
    }

    bigint operator*(const bigint& other) {
        bigint result;

        for (int i = 0; i < SIZE; i++) {             //игнорируем переполнения всего числа
            for (int j = 0; j < SIZE - i; j++) {     //(откидываем разряды больше SIZE)
                result.digits[i + j] += digits[i] * other.digits[j];
            }
        }

        //Не забываем, что мы могли переполнить размер разряда более, чем в два раза.
        //Для переноса воспользуемся делением.
        for (int i = 0; i < SIZE - 1; i++) {
            result.digits[i + 1] += result.digits[i] / BASE;
            result.digits[i] %= BASE;
        }

        return result;
    }
{% endhighlight %}


Такой алгоритм легко реализуется, но имеет сложность $$O(N^2)$$ ($$N$$ -
количество разрядов). Более эффективный алгоритм (алгоритм Карацубы)
позволяет перемножать длинные числа за $$O(N^{1.58})$$, но вам он вряд ли
понадобится.

### Деление на короткое

В отличие от других арифметических операций, деление длинного числа на
другое длинное реализуется достаточно сложно, и в школьных задачах вам
вряд ли придётся им пользоваться.

Деление на короткое число (меньше размера разряда), напротив, реализуется
очень просто. Просто делим по очереди каждый разряд длинного числа на короткое,
сохраняем целую часть, а остаток переносим в предыдущий (младший) разряд:

{% highlight cpp linenos %}
    void operator/=(long long x) {
        for (int i = SIZE - 1; i >= 0; i--) {
            if (i) {
                digits[i - 1] += (digits[i] % x) * BASE;
            }

            digits[i] /= x;
        }
    }

    bigint operator/(long long x) {
        bigint n(*this);
        n /= x;
        return n;
    }
{% endhighlight %}


### Вывод длинного числа

Реализуем также вспомогательную функцию, позволяющую нам выводить длинные
числа на экран так же просто, как и короткие.

{% highlight cpp linenos %}
ostream& operator<<(ostream& out, const bigint& num) {
    string result;

    char buffer[10];

    for (int i = bigint::SIZE - 1; i >= 0; i--) {
        sprintf(buffer, "%09d", num.digits[i]);
        result += buffer;
    }

    int first_idx = result.find_first_not_of('0');
    if (first_idx == string::npos) {
        out << "0";
    } else {
        out << result.substr(first_idx);
    }

    return out;
}
{% endhighlight %}


### Полный код структуры

{% highlight cpp linenos %}
struct bigint {

    static const long long BASE = 1e9;
    static const long long SIZE = 10;

    long long digits[SIZE];

    bigint() {
        for (int i = 0; i < SIZE; i++) {
            digits[i] = 0;
        }
    }

    bigint(long long x) {
        for (int i = 0; i < SIZE; i++) {
            digits[i] = 0;
        }

        int next = 0;
        while (x) {
            digits[next++] = x % BASE;
            x /= BASE;
        }
    }

    bigint(const bigint& other) {
        for (int i = 0; i < SIZE; i++) {
            digits[i] = other.digits[i];
        }
    }

    bigint& operator=(const bigint& other) {
        for (int i = 0; i < SIZE; i++) {
            digits[i] = other.digits[i];
        }

        return *this;
    }

    void operator+=(const bigint& other) {
        for (int i = 0; i < SIZE; i++) {
            digits[i] += other.digits[i];
        }

        for (int i = 0; i < SIZE - 1; i++) {
            if (digits[i] >= BASE) {
                digits[i] -= BASE;
                digits[i + 1]++;
            }
        }
    }

    bigint operator+(const bigint& other) {
        bigint n(*this);
        n += other;
        return n;
    }

    bigint& operator++() {
        *this += 1;
        return *this;
    }

    void operator-=(const bigint& other) {
        for (int i = 0; i < SIZE; i++) {
            digits[i] -= other.digits[i];
        }

        for (int i = 0; i < SIZE - 1; i++) {
            if (digits[i] < 0) {
                digits[i] += BASE;
                digits[i + 1]--;
            }
        }
    }

    bigint operator-(const bigint& other) {
        bigint n(*this);
        n -= other;
        return n;
    }

    bigint& operator--() {
        *this -= 1;
        return *this;
    }

    void operator*=(const bigint& other) {
        *this = *this * other;
    }

    bigint operator*(const bigint& other) {
        bigint result;

        for (int i = 0; i < SIZE; i++) {
            for (int j = 0; j < SIZE - i; j++) {
                result.digits[i + j] += digits[i] * other.digits[j];
            }
        }

        for (int i = 0; i < SIZE - 1; i++) {
            result.digits[i + 1] += result.digits[i] / BASE;
            result.digits[i] %= BASE;
        }

        return result;
    }

    void operator/=(long long x) {
        for (int i = SIZE - 1; i >= 0; i--) {
            if (i) {
                digits[i - 1] += (digits[i] % x) * BASE;
            }

            digits[i] /= x;
        }
    }

    bigint operator/(long long x) {
        bigint n(*this);
        n /= x;
        return n;
    }
};

ostream& operator<<(ostream& out, const bigint& num) {
    string result;

    char buffer[10];

    for (int i = bigint::SIZE - 1; i >= 0; i--) {
        sprintf(buffer, "%09d", num.digits[i]);
        result += buffer;
    }

    int first_idx = result.find_first_not_of('0');
    if (first_idx == string::npos) {
        out << "0";
    } else {
        out << result.substr(first_idx);
    }

    return out;
}
{% endhighlight %}


Разумеется, если в задаче требуются не все операции, можно реализовывать
только некоторые из них.

### Длинная арифметика в разных языках программирования

В последнее время на олимпиадах длинная арифметика встречается всё реже и
реже, и есть вероятность, что скоро она исчезнет насовсем. Главным образом
это связано с постепенным включением в списки допустимых языков Java и Python,
в которых длинная арифметика встроена в стандартную библиотеку. Из-за этого
необходимость реализовывать её самостоятельно полностью отпадает. Для уравнивания
участников, использующих C++ с участниками, использующими Java и Python,
составители задач стараются избегать задач на банальные длинные арифметические
операции. Хотя сама концепция длинных чисел всё ещё встречается, задачи имеют
несколько другой вид.
