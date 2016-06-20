//@Test:Generator:AcmSort:O(N*log(N)):randomGoodCase:cornerGoodCases
#include <testlib.h>
#include <iostream>
#include <vector>

std::string randomName() {
    return rnd.next("[a-zA-Z0-9]{1,10}");
}

void randomCase(int maxN) {
    int n = rnd.next(1, maxN);
    std::cout << n << std::endl;

    for (int i = 0; i < n; i++) {
        std::cout << randomName() << ' ' << rnd.next(1, 15) << ' ' << rnd.next(1, maxN) << std::endl;
    }
}

void oneElementCase(int maxN) {
    std::cout << 1 << std::endl;
    std::cout << randomName() << ' ' << rnd.next(1, 15) << ' ' << rnd.next(1, maxN) << std::endl;
}

void allSameCase(int maxN) {
    std::cout << maxN << std::endl;

    int score = rnd.next(1, 15);
    int penalty = rnd.next(1, maxN);
    for (int i = 0; i < maxN; i++) {
        std::cout << randomName() << ' ' << score << ' ' << penalty << std::endl;
    }
}

void allDifferentCase(int maxN) {
    std::cout << maxN << std::endl;

    for (int i = 0; i < maxN; i++) {
        std::cout << randomName() << ' ' << 3 << ' ' << i + 1 << std::endl;
    }
}

void cornerCases(int maxN, int number) {
    switch (number) {
        case 1: oneElementCase(maxN); break;
        case 2: allSameCase(maxN); break;
        case 3: allDifferentCase(maxN); break;
        default: return;
    }
}

void randomGoodCase() {
    randomCase(100000);
}

void cornerGoodCases(int number) {
    cornerCases(100000, number);
}

int main(int argc, char **argv) {
    registerGen(argc, argv, 1);
    std::string profile = argv[1];

    if (profile == "randomGoodCase") randomGoodCase();
    if (profile == "cornerGoodCases") cornerGoodCases(std::stoi(argv[2]));
}
