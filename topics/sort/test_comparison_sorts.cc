#include "testing_utils.hh"

using namespace std;

#include "insertion_sort.cc"
#include "merge_sort.cc"

const int MEDIUM_SIZE = 1000;
const int LARGE_SIZE = 1000000;

std::tuple<std::vector<int>,
           std::vector<int>,
           std::vector<int>> all_sorts(const vector<int>& v) {

  auto std_sorted = v;
  std::sort(std_sorted.begin(), std_sorted.end());

  auto insertion_sorted = v;
  insertion_sort(insertion_sorted);

  auto merge_sorted = v;
  merge_sort(merge_sorted, 0, v.size() - 1);

  return std::make_tuple(std_sorted, insertion_sorted, merge_sorted);
}

int main() {
  {
    std::vector<int> v {1};

    auto [_, insertion_sorted, merge_sorted] = all_sorts(v);

    AssertEq(v, insertion_sorted);
    AssertEq(v, merge_sorted);
  }

  // Check all four-element vectors
  for (int w = 0; w < 4; w++) {
    for (int x = 0; x < 4; x++) {
      for (int y = 0; y < 4; y++) {
        for (int z = 0; z < 4; z++) {
          std::vector<int> v {w, x, y, z};
          
          auto [std_sorted, insertion_sorted, merge_sorted] = all_sorts(v);

          AssertEqC(std_sorted, insertion_sorted, Debug(v).print());
          AssertEqC(std_sorted, merge_sorted, Debug(v).print());
        }
      }
    }
  }

  // O(N^2) test
  {
    vector<int> v(MEDIUM_SIZE);
    for (int i = 0; i < MEDIUM_SIZE; i++) {
      v[i] = i % 20;
    }

    auto [std_sorted, insertion_sorted, merge_sorted] = all_sorts(v);

    AssertEq(std_sorted, insertion_sorted);
    AssertEq(std_sorted, merge_sorted);
  }

  // O(N log N) test
  {
    vector<int> v(LARGE_SIZE);
    for (int i = 0; i < LARGE_SIZE; i++) {
      v[i] = i % 200;
    }

    auto std_sorted = v;
    std::sort(std_sorted.begin(), std_sorted.end());

    auto merge_sorted = v;
    merge_sort(merge_sorted, 0, v.size() - 1);

    AssertEq(std_sorted, merge_sorted);
  }
}
