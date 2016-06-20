//@Test:Generator:ArrayEqualPairs:O(N^2):randomNaiveCase:cornerNaiveCases
//@Test:Generator:ArrayEqualPairs:O(N):randomGoodCase:cornerGoodCases
//@Test:Generator:Sort:O(N^2):randomNaiveCase:cornerNaiveCases
//@Test:Generator:Sort:O(N*log(N)):randomGoodCase:cornerGoodCases
#include <testlib.h>
#include <iostream>
#include <vector>

void randomCase(int maxN) {
    int n = rnd.next(1, maxN);
    std::cout << n << std::endl;

    for (int i = 0; i < n - 1; i++) {
        std::cout << rnd.next(1, maxN) << ' ';
    }
    std::cout << rnd.next(1, maxN) << std::endl;
}

void oneElementCase(int maxN) {
    std::cout << 1 << std::endl << rnd.next(1, maxN) << std::endl;
}

void allSameCase(int maxN) {
    std::cout << maxN << std::endl;

    int elem = rnd.next(1, maxN);
    for (int i = 0; i < maxN - 1; i++) {
        std::cout << elem << ' ';
    }
    std::cout << elem << std::endl;
}

void allDifferentCase(int maxN) {
    std::cout << maxN << std::endl;

    for (int i = 0; i < maxN - 1; i++) {
        std::cout << i + 1 << ' ';
    }
    std::cout << maxN << std::endl;
}

void cornerCases(int maxN, int number) {
    switch (number) {
        case 1: oneElementCase(maxN); break;
        case 2: allSameCase(maxN); break;
        case 3: allDifferentCase(maxN); break;
        default: return;
    }
}

void randomNaiveCase() {
    randomCase(1000);
}

void randomGoodCase() {
    randomCase(100000);
}

void cornerNaiveCases(int number) {
    cornerCases(1000, number);
}

void cornerGoodCases(int number) {
    cornerCases(100000, number);
}

int main(int argc, char **argv) {
    registerGen(argc, argv, 1);
    std::string profile = argv[1];

    if (profile == "randomNaiveCase") randomNaiveCase();
    if (profile == "randomGoodCase") randomGoodCase();
    if (profile == "cornerNaiveCases") cornerNaiveCases(std::stoi(argv[2]));
    if (profile == "cornerGoodCases") cornerGoodCases(std::stoi(argv[2]));
}
