#include "testing_utils.hh"

MockIO io;
#define cin io.in()
#define cout io.out()

namespace count_sort {
#include "count_sort.cc"
};

#undef cin
#undef cout

int main() {
  TestProgram(count_sort::main, io,
      "1\n1\n",
      LiteralTokenChecker("1"));

  TestProgram(count_sort::main, io,
      "5\n1 2 3 4 5\n",
      LiteralTokenChecker("1 2 3 4 5"));

  TestProgram(count_sort::main, io,
      "5\n5 4 3 2 1\n",
      LiteralTokenChecker("1 2 3 4 5"));

  TestProgram(count_sort::main, io,
      "5\n4 4 4 4 4\n",
      LiteralTokenChecker("4 4 4 4 4"));

  TestProgram(count_sort::main, io,
      "5\n2 4 2 1 3\n",
      LiteralTokenChecker("1 2 2 3 4"));

  {
    std::ostringstream expected_out;
    for (int i = 1; i <= 250000; i++) {
      for (int j = 0; j < 4; j++) {
        expected_out << i << ' ';
      }
    }

    TestProgram(count_sort::main, io,
        Concat("1000000\n", Repeat(RangeString(1, 250000), 4, " "), "\n"),
        LiteralTokenChecker(expected_out.str()));
  }
}
