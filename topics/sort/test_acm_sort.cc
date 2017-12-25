#include "testing_utils.hh"

MockIO io;
#define cout io.out()

namespace acm_sort {
#include "acm_sort.cc"
};

#undef cout

const std::string EXPECTED_OUTPUT = R"(Team BSU
Team BSUIR
Team BSEU
)";

int main() {
  TestProgram(acm_sort::main, io, "", ExactOutputChecker(EXPECTED_OUTPUT));
}
