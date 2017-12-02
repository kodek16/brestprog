#include "testing_utils.hh"

MockIO io;
#define cin io.in()
#define cout io.out()

namespace naive {
#include "naive.cc"
};

namespace good {
#include "good.cc"
};

#undef cin
#undef cout

int main() {
  std::vector<std::function<void()>> programs {
    [] {
      std::fill(naive::arr, naive::arr + naive::MAX_N, 0);
      naive::main();
    },
    [] {
      std::fill(good::arr, good::arr + good::MAX_N, 0);
      std::fill(good::num_count, good::num_count + good::MAX_VALUE + 1, 0);
      good::main();
    }
  };

  // Common tests
  for (const auto& program: programs) {
    TestProgram(program, io, "6\n1 1 1 2 2 3\n", LiteralTokenChecker("4"));
    TestProgram(program, io, "4\n1 2 3 4\n", LiteralTokenChecker("0"));
    TestProgram(program, io, "5\n3 3 3 3 3\n", LiteralTokenChecker("10"));
  }
}
